import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== EMAIL DEBUG INFO ===")

    const debugInfo = {
      hasResendKey: !!process.env.RESEND_API_KEY,
      keyLength: process.env.RESEND_API_KEY?.length || 0,
      keyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) || "none",
      keyFormat: process.env.RESEND_API_KEY?.startsWith("re_") || false,
      timestamp: new Date().toISOString(),
    }

    console.log("Debug info:", debugInfo)

    // Try to import and test Resend
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "No RESEND_API_KEY found",
        debug: debugInfo,
      })
    }

    // Dynamic import to avoid build issues
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    console.log("Resend initialized successfully")

    // Test with the most basic email possible
    const result = await resend.emails.send({
      from: "delivered@resend.dev",
      to: ["lathas5144@aim.com"], // ✅ Your verified email
      subject: "Debug Test",
      html: "<p>Testing if API key works</p>",
    })

    console.log("Email send result:", result)

    return NextResponse.json({
      success: !result.error,
      result: result,
      debug: debugInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug email error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
  }
}
