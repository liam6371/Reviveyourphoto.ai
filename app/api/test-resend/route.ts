import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  try {
    console.log("=== TESTING RESEND API ===")

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "No RESEND_API_KEY environment variable found",
      })
    }

    console.log("API Key found:", process.env.RESEND_API_KEY.substring(0, 15) + "...")
    console.log("API Key length:", process.env.RESEND_API_KEY.length)

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Test with the simplest possible email
    const { data, error } = await resend.emails.send({
      from: "Test <onboarding@resend.dev>",
      to: ["athasl18@gmail.com"],
      subject: "API Test",
      html: "<p>Testing API key</p>",
    })

    console.log("=== TEST RESULTS ===")
    console.log("Data:", JSON.stringify(data, null, 2))
    console.log("Error:", JSON.stringify(error, null, 2))

    if (error) {
      return NextResponse.json({
        success: false,
        error: error,
        apiKey: process.env.RESEND_API_KEY.substring(0, 15) + "...",
        keyLength: process.env.RESEND_API_KEY.length,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      emailId: data?.id,
      apiKey: process.env.RESEND_API_KEY.substring(0, 15) + "...",
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
