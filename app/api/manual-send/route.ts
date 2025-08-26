import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, email } = await request.json()

    console.log("=== MANUAL EMAIL SEND ===")
    console.log("Payment ID:", paymentIntentId)
    console.log("Email:", email)

    if (!resend) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // For your specific payment, let's send a recovery email
    const { data, error } = await resend.emails.send({
      from: "Revive My Photo <hello@revivemyphoto.ai>",
      to: [email],
      subject: "🚨 Your Paid Photos - Manual Delivery",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Your Paid Photos - Manual Delivery</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1F2A44; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1F2A44 0%, #FF6F61 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: #F9F5EF; padding: 30px; border-radius: 0 0 12px 12px; }
              .paid-notice { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .urgent { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚨 Your Paid Photos - Manual Delivery</h1>
                <p>Revive My Photo - Customer Support</p>
              </div>
              <div class="content">
                <div class="urgent">
                  <h3>⚠️ Apologies for the Delay!</h3>
                  <p><strong>We sincerely apologize that your automatic email delivery failed.</strong></p>
                  <p>Your payment was successful and your photos were processed correctly.</p>
                </div>
                
                <div class="paid-notice">
                  <h3>✅ Payment Confirmed</h3>
                  <p><strong>Payment ID:</strong> ${paymentIntentId}</p>
                  <p><strong>Status:</strong> Successfully Processed</p>
                  <p><strong>Service:</strong> AI Photo Restoration</p>
                </div>

                <h3>🔧 What Happened:</h3>
                <p>Your photos were successfully restored using our AI technology, but our automatic email delivery system encountered a technical issue. This is on us, not you!</p>

                <h3>📧 Next Steps:</h3>
                <ol>
                  <li><strong>Reply to this email</strong> with your payment ID: <code>${paymentIntentId}</code></li>
                  <li>We'll manually send your restored photos within 1 hour</li>
                  <li>You'll receive high-resolution, print-ready images</li>
                  <li>We're also fixing the system to prevent this in the future</li>
                </ol>

                <h3>💰 Refund Option:</h3>
                <p>If you prefer an immediate refund instead of waiting for manual delivery, just reply with "REFUND" and we'll process it immediately.</p>

                <div class="paid-notice">
                  <h4>📞 Direct Support:</h4>
                  <p>• Email: support@revivemyphoto.ai</p>
                  <p>• Payment ID: ${paymentIntentId}</p>
                  <p>• Priority: HIGH (Paid Customer)</p>
                </div>

                <p>Again, we sincerely apologize for this technical issue. Your satisfaction is our top priority.</p>
                
                <p><strong>The Revive My Photo Team</strong></p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      throw new Error(`Email failed: ${JSON.stringify(error)}`)
    }

    return NextResponse.json({
      success: true,
      message: "Manual recovery email sent",
      emailId: data?.id,
      paymentId: paymentIntentId,
    })
  } catch (error) {
    console.error("Manual send error:", error)
    return NextResponse.json(
      {
        error: "Failed to send manual email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
