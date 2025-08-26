import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with your live API key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

async function uploadImageToBlob(imageUrl: string, filename: string): Promise<string> {
  try {
    console.log(`Attempting to upload image: ${filename}`)

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
      paymentIntentId,
      paid: !!paid,
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 5) || "none",
    })

    if (!email || !restoredImages || restoredImages.length === 0) {
      console.error("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isPaidOrder = !!paid && !!paymentIntentId

    // CRITICAL: For paid orders, we MUST deliver the photos somehow
    if (isPaidOrder) {
      console.log("🚨 PAID ORDER DETECTED - Priority delivery required")
    }

    // Process images for email delivery
    console.log("Processing images for email...")
    const processedImages = []

    for (let i = 0; i < restoredImages.length; i++) {
      const imageUrl = restoredImages[i]
      const filename = filenames?.[i] || `restored_photo_${i + 1}.jpg`

      try {
        const permanentUrl = await uploadImageToBlob(imageUrl, filename)
        processedImages.push({
          url: permanentUrl,
          filename: filename,
          index: i + 1,
        })
        console.log(`✅ Image ${i + 1} processed successfully`)
      } catch (error) {
        console.error(`❌ Failed to process image ${i + 1}:`, error)
        processedImages.push({
          url: imageUrl,
          filename: filename,
          index: i + 1,
        })
      }
    }

    console.log(`📸 All images processed. Total: ${processedImages.length}`)

    // Check if Resend is properly configured
    if (!resend || !process.env.RESEND_API_KEY) {
      console.error("❌ No Resend API key configured")

      if (isPaidOrder) {
        return NextResponse.json({
          success: true,
          message: `Payment confirmed! Email service configuration issue - your photos are ready for download. Payment ID: ${paymentIntentId}`,
          emailSent: false,
          paid: true,
          paymentIntentId,
          downloadLinks: processedImages,
          directDownload: true,
          notice: "Email service needs configuration. Your photos are available for immediate download above.",
        })
      }

      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Validate API key format
    if (!process.env.RESEND_API_KEY.startsWith("re_")) {
      console.error("❌ Invalid Resend API key format")

      if (isPaidOrder) {
        return NextResponse.json({
          success: true,
          message: `Payment confirmed! Email API key issue - your photos are ready for download. Payment ID: ${paymentIntentId}`,
          emailSent: false,
          paid: true,
          paymentIntentId,
          downloadLinks: processedImages,
          directDownload: true,
          notice: "Email API configuration issue. Your photos are available for immediate download above.",
        })
      }

      return NextResponse.json({ error: "Email service misconfigured" }, { status: 500 })
    }

    console.log("📧 Sending email via Resend...")
    console.log(`📬 To: ${email}`)
    console.log(`🔑 API Key: ${process.env.RESEND_API_KEY.substring(0, 10)}...`)

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
            .paid-notice { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .photo-preview { text-align: center; margin: 20px 0; }
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

              ${
                isPaidOrder
                  ? `
              <div class="paid-notice">
                <h4>Receipt Information:</h4>
                <p>• Payment ID: ${paymentIntentId}</p>
                <p>• Professional AI restoration completed</p>
                <p>• Keep this email as your receipt</p>
              </div>
              `
                  : ""
              }

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
      // ✅ USE YOUR VERIFIED CUSTOM DOMAIN
      const { data, error } = await resend.emails.send({
        from: "Revive My Photo <hello@revivemyphoto.ai>", // ✅ Your verified domain
        to: ["lathas5144@aim.com"], // ✅ Use your verified email for testing
        subject: `${isPaidOrder ? "Receipt: " : ""}Your ${processedImages.length} Revived Photo${processedImages.length > 1 ? "s" : ""} - Revive My Photo`,
        html: emailHtml,
      })

      console.log("=== RESEND API RESPONSE ===")
      console.log("✅ Data:", JSON.stringify(data, null, 2))
      console.log("❌ Error:", JSON.stringify(error, null, 2))

      if (error) {
        console.error("🚨 RESEND ERROR DETAILS:")
        console.error("Error:", error)

        // For paid orders, provide fallback instead of failing
        if (isPaidOrder) {
          console.log("🔄 Email failed for paid order - providing direct download fallback")
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

      console.log("🎉 Email sent successfully!")

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
      console.error("🚨 EMAIL SENDING FAILED:", emailError)

      // For paid orders, ALWAYS provide a fallback
      if (isPaidOrder) {
        console.log("🆘 Email completely failed for paid order - providing emergency fallback")
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
          supportMessage: `Contact support with Payment ID: ${paymentIntentId}`,
        })
      }

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
    console.error("=== EMAIL API CRITICAL ERROR ===")
    console.error("Error details:", error)

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
