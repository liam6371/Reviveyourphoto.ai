import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  try {
    console.log("=== TESTING CUSTOM DOMAIN EMAIL ===")

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "No RESEND_API_KEY found",
        message: "Add your Resend API key to test emails",
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Test email with your custom domain
    const { data, error } = await resend.emails.send({
      from: "Revive My Photo <hello@revivemyphoto.ai>", // ✅ Your custom domain
      to: ["athasl18@gmail.com"], // Your verified email
      subject: "🎉 Custom Domain Test - Revive My Photo",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Custom Domain Test</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1F2A44; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1F2A44 0%, #FF6F61 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: #F9F5EF; padding: 30px; border-radius: 0 0 12px 12px; }
              .success { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Custom Domain Working!</h1>
                <p>Revive My Photo - Email Test</p>
              </div>
              <div class="content">
                <div class="success">
                  <h3>✅ Success!</h3>
                  <p><strong>Your custom domain is working perfectly!</strong></p>
                  <p>This email was sent from: <strong>hello@revivemyphoto.ai</strong></p>
                  <p>DNS verification: <strong>Complete</strong></p>
                  <p>Email delivery: <strong>Operational</strong></p>
                </div>
                
                <h3>What this means:</h3>
                <ul>
                  <li>✅ DNS records are properly configured</li>
                  <li>✅ Domain verification is complete</li>
                  <li>✅ Email sending is fully operational</li>
                  <li>✅ Your customers will receive emails from your domain</li>
                </ul>

                <h3>Next Steps:</h3>
                <ul>
                  <li>🚀 Your photo restoration site is ready for production!</li>
                  <li>📧 Customers will receive emails from revivemyphoto.ai</li>
                  <li>💳 Payment confirmations will be sent automatically</li>
                  <li>📸 Restored photos will be delivered via email</li>
                </ul>

                <p><strong>Congratulations! Your email system is fully operational.</strong></p>
                
                <p>Best regards,<br>
                <strong>The Revive My Photo System</strong></p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log("=== EMAIL TEST RESULTS ===")
    console.log("Data:", JSON.stringify(data, null, 2))
    console.log("Error:", JSON.stringify(error, null, 2))

    if (error) {
      return NextResponse.json({
        success: false,
        error: error,
        message: "Custom domain email test failed",
        troubleshooting: [
          "Check if domain status is 'Verified' in Resend dashboard",
          "Verify all DNS records are green in Resend",
          "Wait a few more minutes for domain verification",
          "Try using default domain as fallback",
        ],
      })
    }

    return NextResponse.json({
      success: true,
      message: "🎉 Custom domain email test successful!",
      emailId: data?.id,
      from: "hello@revivemyphoto.ai",
      to: "athasl18@gmail.com",
      status: "Email sent successfully with custom domain",
      nextSteps: [
        "Update your main email API to use custom domain",
        "Test the full payment flow",
        "Deploy to production",
        "Your site is ready for customers!",
      ],
    })
  } catch (error) {
    console.error("Custom domain test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to test custom domain email",
    })
  }
}
