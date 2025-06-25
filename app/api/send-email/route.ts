import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend (will work in demo mode if no API key)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Your verified email address for testing
const VERIFIED_EMAIL = "athasl18@gmail.com"

async function uploadImageToBlob(imageUrl: string, filename: string): Promise<string> {
  try {
    console.log(`Attempting to upload image: ${filename}`)
    console.log(`Image URL: ${imageUrl}`)

    // Check if we have blob storage configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("Blob storage not configured, using original URL")
      return imageUrl
    }

    // Only try to upload external URLs (Replicate results)
    if (!imageUrl.startsWith("http")) {
      console.log("Image is data URL, using original")
      return imageUrl
    }

    // Fetch the image from the URL
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const blob = new Uint8Array(imageBuffer)

    // Dynamic import of Vercel Blob
    const { put } = await import("@vercel/blob")

    // Upload to Vercel Blob storage
    const { url } = await put(`restored/${Date.now()}_${filename}`, blob, {
      access: "public",
      contentType: response.headers.get("content-type") || "image/jpeg",
    })

    console.log(`Successfully uploaded to blob: ${url}`)
    return url
  } catch (error) {
    console.error(`Failed to upload image ${filename}:`, error)
    // Return original URL as fallback
    return imageUrl
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== EMAIL API CALLED ===")

    const { email, restoredImages, originalImages, services, filenames, paymentIntentId, paid } = await request.json()

    console.log("Request data:", {
      email,
      restoredImagesCount: restoredImages?.length || 0,
      originalImagesCount: originalImages?.length || 0,
      servicesCount: services?.length || 0,
      filenamesCount: filenames?.length || 0,
      paymentIntentId,
      paid: !!paid,
    })

    if (!email || !restoredImages || restoredImages.length === 0) {
      console.error("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Processing email request for:", email)
    console.log("Restored images received:", restoredImages.length)
    console.log("Is paid order:", !!paid)
    console.log("Environment check:", {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
    })

    // For paid orders, try harder to send real emails
    const isPaidOrder = !!paid && !!paymentIntentId

    // CRITICAL: For paid orders, we MUST deliver the photos somehow
    if (isPaidOrder) {
      console.log("PAID ORDER DETECTED - Ensuring delivery at all costs")
    }

    // Process images with fallback handling FIRST
    console.log("Processing images for email...")
    const processedImages = []

    for (let i = 0; i < restoredImages.length; i++) {
      const imageUrl = restoredImages[i]
      const filename = filenames?.[i] || `restored_photo_${i + 1}.jpg`

      console.log(`Processing image ${i + 1}/${restoredImages.length}: ${filename}`)

      try {
        // Try to upload to permanent storage, but don't fail if it doesn't work
        const permanentUrl = await uploadImageToBlob(imageUrl, filename)
        processedImages.push({
          url: permanentUrl,
          filename: filename,
          index: i + 1,
        })
        console.log(`Image ${i + 1} processed successfully`)
      } catch (error) {
        console.error(`Failed to process image ${i + 1}:`, error)
        // Use original URL as fallback
        processedImages.push({
          url: imageUrl,
          filename: filename,
          index: i + 1,
        })
      }
    }

    console.log(`All images processed. Total: ${processedImages.length}`)

    // If no Resend API key, handle paid orders specially
    if (!resend || !process.env.RESEND_API_KEY) {
      console.log("No Resend API key configured")

      if (isPaidOrder) {
        console.log("PAID ORDER but no email service - providing direct download links")

        // For paid orders without email service, return success with download links
        return NextResponse.json({
          success: true,
          message: `Payment confirmed! Your photos are ready for download. Email service is being configured - you can download your ${processedImages.length} restored photos directly.`,
          emailSent: false,
          paid: true,
          paymentIntentId,
          downloadLinks: processedImages,
          directDownload: true,
          notice: "Email delivery is being set up. Your photos are available for immediate download above.",
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured.",
        },
        { status: 500 },
      )
    }

    // For paid orders, send to ANY email address (remove verification restriction)
    const isVerifiedEmail = email.toLowerCase() === VERIFIED_EMAIL.toLowerCase()

    // Only restrict for free orders, not paid orders
    if (!isVerifiedEmail && !isPaidOrder) {
      console.log(`Email ${email} is not verified and not a paid order.`)
      return NextResponse.json(
        {
          success: false,
          error: "Email address not verified for free service.",
        },
        { status: 400 },
      )
    }

    // Real email sending with Resend (for verified email OR paid orders)
    console.log("Sending real email via Resend to:", email, isPaidOrder ? "(PAID ORDER)" : "(VERIFIED EMAIL)")

    // Create email content
    const servicesList = services
      .map((service: string) => {
        switch (service) {
          case "repair":
            return "Photo Restoration"
          case "colorize":
            return "Colorization"
          case "enhance":
            return "Quality Enhancement"
          case "damage":
            return "Damage Repair"
          default:
            return service
        }
      })
      .join(", ")

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your Revived Photos - Revive My Photo</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1F2A44; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1F2A44 0%, #FF6F61 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #F9F5EF; padding: 30px; border-radius: 0 0 12px 12px; }
            .services { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #8B8B8B; font-size: 14px; }
            .button { display: inline-block; background: #FF6F61; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 10px 5px; font-weight: bold; }
            .button:hover { background: #e55a4f; }
            .paid-notice { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .photo-preview { text-align: center; margin: 20px 0; }
            .photo-preview img { max-width: 200px; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your Photos Have Been Revived!</h1>
              <p>Revive My Photo - AI-Powered Photo Restoration</p>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>Your precious photos have been carefully restored using our advanced AI technology. We're excited to share the results with you!</p>
              
              ${
                isPaidOrder
                  ? `
              <div class="paid-notice">
                <h3>✅ Payment Confirmed</h3>
                <p><strong>Thank you for your purchase!</strong> Your payment has been processed successfully.</p>
                <p><strong>Payment ID:</strong> ${paymentIntentId}</p>
                <p><strong>Amount:</strong> $${(processedImages.length * 0.5).toFixed(2)}</p>
              </div>
              `
                  : ""
              }
              
              <div class="services">
                <h3>Services Applied:</h3>
                <p><strong>${servicesList}</strong></p>
                <p>Photos processed: <strong>${processedImages.length}</strong></p>
              </div>

              <h3>Your Restored Photos:</h3>
              <p>Your restored photos are ready for download. Click the buttons below to save each photo:</p>
              
              <div class="photo-preview">
                ${processedImages
                  .map(
                    (image) => `
                    <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 8px;">
                      <h4>Photo ${image.index}</h4>
                      <img src="${image.url}" alt="Restored Photo ${image.index}" style="max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                      <br><br>
                      <a href="${image.url}" class="button" download="${image.filename}">Download Photo ${image.index}</a>
                    </div>
                  `,
                  )
                  .join("")}
              </div>

              <h3>What's Next?</h3>
              <ul>
                <li>Save your restored photos to a safe location</li>
                <li>Share your memories with family and friends</li>
                <li>Consider printing them for physical keepsakes</li>
                <li>Leave us a review if you're happy with the results!</li>
              </ul>

              ${
                isPaidOrder
                  ? `
              <div class="paid-notice">
                <h4>Receipt Information:</h4>
                <p>• Payment ID: ${paymentIntentId}</p>
                <p>• Professional AI restoration completed</p>
                <p>• All photos processed with production-grade technology</p>
                <p>• Keep this email as your receipt</p>
              </div>
              `
                  : ""
              }

              <p>If you have any questions or need assistance, please don't hesitate to contact our support team${isPaidOrder ? ` and reference your payment ID: ${paymentIntentId}` : ""}.</p>
              
              <p>Thank you for choosing Revive My Photo!</p>
              <p><strong>The Revive My Photo Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Revive My Photo. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
              ${isPaidOrder ? `<p>Payment ID: ${paymentIntentId}</p>` : ""}
            </div>
          </div>
        </body>
      </html>
    `

    try {
      console.log("Attempting to send email via Resend...")

      // Send email with Resend - using the exact format from your working example
      const { data, error } = await resend.emails.send({
        from: "Revive My Photo <onboarding@resend.dev>",
        to: [email],
        subject: `${isPaidOrder ? "Receipt: " : ""}Your ${processedImages.length} Revived Photo${processedImages.length > 1 ? "s" : ""} - Revive My Photo`,
        html: emailHtml,
      })

      if (error) {
        console.error("Resend error:", error)

        // For paid orders, provide fallback with download links instead of failing
        if (isPaidOrder) {
          console.log("Email failed for paid order - providing direct download fallback")
          return NextResponse.json({
            success: true,
            message: `Payment confirmed! Email delivery encountered an issue, but your photos are ready for download. Payment ID: ${paymentIntentId}`,
            emailSent: false,
            paid: true,
            paymentIntentId,
            downloadLinks: processedImages,
            directDownload: true,
            emailError: error,
            notice: "Email delivery failed, but your photos are available for immediate download above.",
          })
        }

        throw new Error(`Resend API error: ${JSON.stringify(error)}`)
      }

      console.log("Email sent successfully:", data)

      return NextResponse.json({
        success: true,
        message: `${isPaidOrder ? "Payment confirmed! " : ""}Email sent successfully to ${email}! Check your inbox for ${processedImages.length} professionally restored photos.`,
        emailSent: true,
        emailId: data?.id,
        paid: isPaidOrder,
        paymentIntentId: isPaidOrder ? paymentIntentId : undefined,
        imageUrls: processedImages.map((img) => img.url),
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)

      // For paid orders, ALWAYS provide a fallback - never fail completely
      if (isPaidOrder) {
        console.log("Email completely failed for paid order - providing emergency fallback")
        return NextResponse.json({
          success: true, // Still success because payment went through
          message: `Payment confirmed! Email delivery failed, but your photos are ready for download. Payment ID: ${paymentIntentId}`,
          emailSent: false,
          paid: true,
          paymentIntentId,
          downloadLinks: processedImages,
          directDownload: true,
          emailError: emailError instanceof Error ? emailError.message : "Unknown email error",
          notice: "Email service temporarily unavailable. Your photos are available for immediate download above.",
          supportMessage: `If you need assistance, contact support with Payment ID: ${paymentIntentId}`,
        })
      }

      // For non-paid orders, we can fail normally
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailError instanceof Error ? emailError.message : "Unknown error",
          success: false,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("=== EMAIL API ERROR ===")
    console.error("Error details:", error)

    // Extract payment info from request if available
    let paymentIntentId = null
    let isPaidOrder = false
    try {
      const body = await request.json()
      paymentIntentId = body.paymentIntentId
      isPaidOrder = !!body.paid && !!paymentIntentId
    } catch (e) {
      // Ignore parsing errors
    }

    // For paid orders, even if everything fails, provide some fallback
    if (isPaidOrder && paymentIntentId) {
      return NextResponse.json({
        success: false,
        error: "Email processing failed completely",
        paid: true,
        paymentIntentId,
        supportMessage: `Your payment was successful (ID: ${paymentIntentId}). Please contact support to receive your photos.`,
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json(
      {
        error: "Failed to process email request",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
