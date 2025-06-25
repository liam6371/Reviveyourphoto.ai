import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Resend API key...")

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "No RESEND_API_KEY found",
        hasKey: false,
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    console.log("API Key found:", process.env.RESEND_API_KEY.substring(0, 10) + "...")

    // Test sending a simple email
    const { data, error } = await resend.emails.send({
      from: "Test <hello@resend.dev>",
      to: ["athasl18@gmail.com"], // Your verified email
      subject: "Resend API Test",
      html: "<h1>Test Email</h1><p>If you receive this, your Resend API key is working!</p>",
    })

    if (error) {
      console.error("Resend test error:", error)
      return NextResponse.json({
        success: false,
        error: error,
        keyLength: process.env.RESEND_API_KEY.length,
        keyPrefix: process.env.RESEND_API_KEY.substring(0, 5),
      })
    }

    console.log("Test email sent successfully:", data)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      emailId: data?.id,
      keyWorking: true,
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      keyLength: process.env.RESEND_API_KEY?.length || 0,
    })
  }
}
