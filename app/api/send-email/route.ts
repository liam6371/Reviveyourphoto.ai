import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { put } from "@vercel/blob"

// Initialize Resend (will work in demo mode if no API key)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Your verified email address for testing
const VERIFIED_EMAIL = "athasl18@gmail.com"

async function uploadImageToBlob(imageUrl: string, filename: string): Promise<string> {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const blob = new Uint8Array(imageBuffer)

    // Upload to Vercel Blob storage
    const { url } = await put(`restored/${filename}`, blob, {
      access: "public",
      contentType: response.headers.get("content-type") || "image/jpeg",
    })

    return url
  } catch (error) {
    console.error("Failed to upload image to blob storage:", error)
    return imageUrl // Return original URL as fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, restoredImages, originalImages, services, filenames } = await request.json()

    if (!email || !restoredImages || restoredImages.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Processing email request for:", email)
    console.log("Restored images received:", restoredImages.length)

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

    // Store images permanently for real email
    console.log("Uploading restored images to permanent storage...")
    const permanentImageUrls = []

    for (let i = 0; i < restoredImages.length; i++) {
      const imageUrl = restoredImages[i]
      const filename = filenames?.[i] || `restored_photo_${i + 1}.jpg`

      console.log(`Uploading image ${i + 1}:`, filename)

      // Upload to Vercel Blob storage
      const permanentUrl = await uploadImageToBlob(imageUrl, filename)
      permanentImageUrls.push(permanentUrl)

      console.log(`Image ${i + 1} uploaded:`, permanentUrl)
    }

    // Real email sending with Resend (only for verified email)
    console.log("Sending real email via Resend to verified address:", email)

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
                <p>Photos processed: <strong>${permanentImageUrls.length}</strong></p>
              </div>

              <h3>Your Restored Photos:</h3>
              <p>Your restored photos are ready for download. Click the buttons below to save each photo:</p>
              
              <div class="photo-preview">
                ${permanentImageUrls
                  .map(
                    (url: string, index: number) => `
                    <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 8px;">
                      <h4>Photo ${index + 1}</h4>
                      <img src="${url}" alt="Restored Photo ${index + 1}" style="max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                      <br><br>
                      <a href="${url}" class="button" download="restored_photo_${index + 1}.jpg">Download Photo ${index + 1}</a>
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
                <p>• Images are stored permanently and ready for download</p>
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
      // Send email with Resend to verified address
      const { data, error } = await resend.emails.send({
        from: "Revive My Photo <onboarding@resend.dev>", // Use resend.dev domain
        to: [email],
        subject: `Your ${permanentImageUrls.length} Revived Photo${permanentImageUrls.length > 1 ? "s" : ""} - Revive My Photo`,
        html: emailHtml,
      })

      if (error) {
        console.error("Resend error:", error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log("Email sent successfully with permanent image URLs:", data)

      return NextResponse.json({
        success: true,
        message: `Real email sent successfully to ${email}! Check your inbox for ${permanentImageUrls.length} restored photos.`,
        emailSent: true,
        emailId: data?.id,
        demo: false,
        verified: true,
        imageUrls: permanentImageUrls,
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)

      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailError instanceof Error ? emailError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Try the demo mode or use a verified email address",
      },
      { status: 500 },
    )
  }
}
