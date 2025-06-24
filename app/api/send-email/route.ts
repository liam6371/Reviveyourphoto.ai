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

    const { email, restoredImages, originalImages, services, filenames } = await request.json()

    console.log("Request data:", {
      email,
      restoredImagesCount: restoredImages?.length || 0,
      originalImagesCount: originalImages?.length || 0,
      servicesCount: services?.length || 0,
      filenamesCount: filenames?.length || 0,
    })

    if (!email || !restoredImages || restoredImages.length === 0) {
      console.error("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Processing email request for:", email)
    console.log("Restored images received:", restoredImages.length)
    console.log("Environment check:", {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
    })

    // Demo mode if no Resend API key
    if (!resend || !process.env.RESEND_API_KEY) {
      console.log("Demo mode: Simulating email send to:", email)

      // Simulate email processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return NextResponse.json({
        success: true,
        message: `Demo: Email would be sent to ${email} with ${restoredImages.length} restored photo(s). Add RESEND_API_KEY to enable real emails.`,
        emailSent: true,
        demo: true,
      })
    }

    // Check if this is the verified email address
    const isVerifiedEmail = email.toLowerCase() === VERIFIED_EMAIL.toLowerCase()

    if (!isVerifiedEmail) {
      console.log(`Email ${email} is not the verified address. Using demo mode.`)

      // Simulate email processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return NextResponse.json({
        success: true,
        message: `Demo Mode: Email simulation sent to ${email} with ${restoredImages.length} restored photo(s). Real emails are currently limited to verified addresses. Your photos are ready for download!`,
        emailSent: true,
        demo: true,
        reason: "unverified_recipient",
      })
    }

    // Real email sending with Resend (only for verified email)
    console.log("Sending real email via Resend to verified address:", email)

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
            .demo-notice { background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 20px; margin: 20px 0; }
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
              
              <div class="demo-notice">
                <h3>🚀 Launch Demo Active</h3>
                <p><strong>This is a real email with real restored photos!</strong> You're receiving this because you're testing our launch demo. In production, all customers will receive similar emails with their restored photos.</p>
              </div>
              
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

              <div class="demo-notice">
                <h4>Demo Information:</h4>
                <p>• These are real AI-restored photos processed by Replicate</p>
                <p>• Images are available for download</p>
                <p>• All photos are processed with the same technology customers will receive</p>
              </div>

              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Thank you for choosing Revive My Photo!</p>
              <p><strong>The Revive My Photo Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Revive My Photo. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      console.log("Attempting to send email via Resend...")

      // Send email with Resend to verified address
      const { data, error } = await resend.emails.send({
        from: "Revive My Photo <onboarding@resend.dev>", // Use resend.dev domain
        to: [email],
        subject: `Your ${processedImages.length} Revived Photo${processedImages.length > 1 ? "s" : ""} - Revive My Photo`,
        html: emailHtml,
      })

      if (error) {
        console.error("Resend error:", error)
        throw new Error(`Resend API error: ${JSON.stringify(error)}`)
      }

      console.log("Email sent successfully:", data)

      return NextResponse.json({
        success: true,
        message: `Real email sent successfully to ${email}! Check your inbox for ${processedImages.length} restored photos.`,
        emailSent: true,
        emailId: data?.id,
        demo: false,
        verified: true,
        imageUrls: processedImages.map((img) => img.url),
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)

      // Provide more specific error information
      let errorMessage = "Failed to send email"
      if (emailError instanceof Error) {
        if (emailError.message.includes("API key")) {
          errorMessage = "Email service configuration error"
        } else if (emailError.message.includes("rate limit")) {
          errorMessage = "Email rate limit exceeded"
        } else if (emailError.message.includes("domain")) {
          errorMessage = "Email domain verification required"
        } else {
          errorMessage = `Email service error: ${emailError.message}`
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: emailError instanceof Error ? emailError.message : "Unknown error",
          success: false,
          debug: {
            hasResendKey: !!process.env.RESEND_API_KEY,
            resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
            email: email,
            isVerified: isVerifiedEmail,
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
