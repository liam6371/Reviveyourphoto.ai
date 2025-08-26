import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  try {
    console.log("=== TESTING VERIFIED DOMAIN ===")

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "No RESEND_API_KEY found",
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Test with your verified domain AND your account email
    const { data, error } = await resend.emails.send({
      from: "Revive My Photo <hello@revivemyphoto.ai>", // Your verified domain
      to: ["lathas5144@aim.com"], // Your Resend account email
      subject: "🎉 Domain Verification Test - SUCCESS!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Domain Test Success</title>
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
                <h1>🎉 DOMAIN VERIFICATION SUCCESS!</h1>
                <p>Revive My Photo - Email System</p>
              </div>
              <div class="content">
                <div class="success">
                  <h3>✅ Everything is Working!</h3>
                  <p><strong>Your custom domain is fully operational!</strong></p>
                  <p>From: hello@revivemyphoto.ai</p>
                  <p>To: lathas5144@aim.com</p>
                  <p>Status: DELIVERED</p>
                </div>
                
                <h3>🚀 What This Means:</h3>
                <ul>
                  <li>✅ Custom domain is verified and working</li>
                  <li>✅ Email delivery system is operational</li>
                  <li>✅ Your photo restoration site is ready!</li>
                  <li>✅ Customers can receive their photos via email</li>
                </ul>

                <h3>📧 Next Steps:</h3>
                <ol>
                  <li>Update your main email API to use your account email for testing</li>
                  <li>For production, customers can use any email address</li>
                  <li>Your site is ready to go live!</li>
                </ol>

                <p><strong>Congratulations! Your email system is fully functional.</strong></p>
                
                <p>Best regards,<br>
                <strong>Revive My Photo System</strong></p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log("=== DOMAIN TEST RESULTS ===")
    console.log("Data:", JSON.stringify(data, null, 2))
    console.log("Error:", JSON.stringify(error, null, 2))

    if (error) {
      return NextResponse.json({
        success: false,
        error: error,
        message: "Domain test failed",
        solution: "Check if revivemyphoto.ai is verified in Resend dashboard",
      })
    }

    return NextResponse.json({
      success: true,
      message: "🎉 DOMAIN VERIFICATION SUCCESSFUL!",
      emailId: data?.id,
      from: "hello@revivemyphoto.ai",
      to: "lathas5144@aim.com",
      status: "Your custom domain is working perfectly!",
      nextSteps: [
        "Your email system is fully operational",
        "Update test emails to use lathas5144@aim.com",
        "Deploy to production - you're ready!",
      ],
    })
  } catch (error) {
    console.error("Domain test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
