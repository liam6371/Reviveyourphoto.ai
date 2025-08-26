import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, email } = await request.json()

    console.log("=== PAYMENT RECOVERY ===")
    console.log("Payment ID:", paymentIntentId)
    console.log("Email:", email)

    if (!resend) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Send immediate recovery email for your specific payment
    const { data, error } = await resend.emails.send({
      from: "Revive My Photo <hello@revivemyphoto.ai>", // ✅ Your verified domain
      to: [email],
      subject: "🚨 URGENT: Your Paid Photos - Manual Recovery",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Payment Recovery - Revive My Photo</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1F2A44; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc3545 0%, #FF6F61 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: #F9F5EF; padding: 30px; border-radius: 0 0 12px 12px; }
              .urgent { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .paid-notice { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚨 URGENT: Your Paid Photos</h1>
                <p>Manual Recovery - Revive My Photo</p>
              </div>
              <div class="content">
                <div class="urgent">
                  <h3>⚠️ IMMEDIATE ATTENTION REQUIRED</h3>
                  <p><strong>We sincerely apologize!</strong> Your payment was successful but our automatic delivery system failed.</p>
                  <p><strong>This is our fault, not yours.</strong></p>
                </div>
                
                <div class="paid-notice">
                  <h3>✅ Payment Confirmed</h3>
                  <p><strong>Payment ID:</strong> ${paymentIntentId}</p>
                  <p><strong>Status:</strong> Successfully Processed</p>
                  <p><strong>Your photos were restored successfully</strong></p>
                </div>

                <h3>🔧 What Happened:</h3>
                <p>Your photos were successfully processed using our AI technology, but our email delivery system encountered a technical issue during the final delivery step.</p>

                <h3>📧 IMMEDIATE ACTION:</h3>
                <ol>
                  <li><strong>Reply to this email NOW</strong> with: "SEND MY PHOTOS"</li>
                  <li>Include your payment ID: <code>${paymentIntentId}</code></li>
                  <li>We'll manually send your photos within 30 minutes</li>
                  <li>You'll receive high-resolution, print-ready images</li>
                </ol>

                <h3>💰 Alternative - Instant Refund:</h3>
                <p>If you prefer an immediate refund instead of waiting, reply with "REFUND NOW" and we'll process it within 15 minutes.</p>

                <div class="paid-notice">
                  <h4>📞 Priority Support:</h4>
                  <p>• Email: support@revivemyphoto.ai</p>
                  <p>• Payment ID: ${paymentIntentId}</p>
                  <p>• Status: HIGH PRIORITY (Paid Customer)</p>
                  <p>• Response Time: Under 30 minutes</p>
                </div>

                <h3>🛠️ System Fix:</h3>
                <p>We're also immediately fixing the delivery system to prevent this from happening to other customers.</p>

                <p><strong>Again, we deeply apologize for this technical failure. Your satisfaction is our absolute priority.</strong></p>
                
                <p>Sincerely,<br>
                <strong>The Revive My Photo Team</strong><br>
                <em>Making this right immediately</em></p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      throw new Error(`Recovery email failed: ${JSON.stringify(error)}`)
    }

    return NextResponse.json({
      success: true,
      message: "🚨 URGENT recovery email sent successfully",
      emailId: data?.id,
      paymentId: paymentIntentId,
      nextSteps: [
        "Check your email immediately",
        "Reply with 'SEND MY PHOTOS' to get photos",
        "Or reply with 'REFUND NOW' for instant refund",
        "Response guaranteed within 30 minutes",
      ],
    })
  } catch (error) {
    console.error("Recovery email error:", error)
    return NextResponse.json(
      {
        error: "Failed to send recovery email",
        details: error instanceof Error ? error.message : "Unknown error",
        fallback: "Contact support directly with payment ID: " + request.body?.paymentIntentId,
      },
      { status: 500 },
    )
  }
}
