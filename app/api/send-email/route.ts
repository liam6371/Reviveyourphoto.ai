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

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log("Resend API key missing - this is a problem!")
      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured. Please contact support with your payment ID.",
          paymentIntentId,
        },
        { status: 500 },
      )
    }

    // Check if this is the verified email address OR if it's a paid order
    const isVerifiedEmail = email.toLowerCase() === VERIFIED_EMAIL.toLowerCase()

    // Real email sending with Resend (for verified email OR paid orders)
    console.log("Sending real email via Resend to:", email, isPaidOrder ? "(PAID ORDER)" : "(VERIFIED EMAIL)")

    // Process images with fallback handling
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
                <p><strong>Amount:</strong> $${(processedImages.length * 0.5).toFixed(2)} (Launch Special Pricing)</p>
              </div>
              `
                  : `
              <div class="paid-notice">
                <h3>🚀 Launch Special Active</h3>
                <p><strong>You're getting real AI-restored photos at our launch price!</strong> This is professional photo restoration using advanced AI technology at our special introductory pricing of $0.50 per photo.</p>
              </div>
              `
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
                  : `
              <div class="paid-notice">
                <h4>Launch Special Information:</h4>
                <p>• Real AI-restored photos processed by Replicate</p>
                <p>• Professional quality at introductory pricing</p>
                <p>• All photos processed with production-grade technology</p>
              </div>
              `
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

      // Send email with Resend
      const { data, error } = await resend.emails.send({
        from: "Revive My Photo <onboarding@resend.dev>", // Use resend.dev domain
        to: [email],
        subject: `${isPaidOrder ? "Receipt: " : ""}Your ${processedImages.length} Revived Photo${processedImages.length > 1 ? "s" : ""} - Revive My Photo`,
        html: emailHtml,
      })

      if (error) {
        console.error("Resend error:", error)

        // For paid orders, this is a critical error
        if (isPaidOrder) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to send receipt email for paid order. Please contact support with payment ID: ${paymentIntentId}`,
              paymentIntentId,
            },
            { status: 500 },
          )
        }

        throw new Error(`Resend API error: ${JSON.stringify(error)}`)
      }

      console.log("Email sent successfully:", data)

      return NextResponse.json({
        success: true,
        message: `${isPaidOrder ? "Payment confirmed! " : ""}Real email sent successfully to ${email}! Check your inbox for ${processedImages.length} professionally restored photos.`,
        emailSent: true,
        emailId: data?.id,
        verified: true,
        paid: isPaidOrder,
        paymentIntentId: isPaidOrder ? paymentIntentId : undefined,
        imageUrls: processedImages.map((img) => img.url),
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)

      // For paid orders, this is critical
      if (isPaidOrder) {
        return NextResponse.json(
          {
            success: false,
            error: `Payment successful but email delivery failed. Please contact support with payment ID: ${paymentIntentId} to receive your photos.`,
            paymentIntentId,
          },
          { status: 500 },
        )
      }

      // Provide more specific error information and better fallbacks
      let errorMessage = "Failed to send email"
      const shouldFallbackToDemo = false

      if (emailError instanceof Error) {
        if (emailError.message.includes("API key") || emailError.message.includes("Authentication")) {
          errorMessage = "Email service configuration error"
        } else if (emailError.message.includes("rate limit")) {
          errorMessage = "Email rate limit exceeded - please try again in a few minutes"
        } else if (emailError.message.includes("domain") || emailError.message.includes("Domain")) {
          errorMessage = "Email domain verification in progress"
        } else {
          errorMessage = `Email service error: ${emailError.message}`
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: emailError instanceof Error ? emailError.message : "Unknown error",
          success: false,
          fallback: {
            message: "Your photos are ready for download from the preview page above",
            downloadAvailable: true,
            imageUrls: processedImages.map((img) => img.url),
          },
          debug: {
            hasResendKey: !!process.env.RESEND_API_KEY,
            resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
            email: email,
            isVerified: isVerifiedEmail,
            isPaid: isPaidOrder,
            suggestion: "Add your domain to Resend and verify it, or use the direct download option",
          },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("=== EMAIL API ERROR ===")
    console.error("Error details:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to process email request",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
        suggestion: "Check server logs for detailed error information",
      },
      { status: 500 },
    )
  }
}
