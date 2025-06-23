import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "Replicate API token not configured" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("Starting colorization...")

    // Use BigColor model for colorization
    const output = await replicate.run(
      "cjwbw/bigcolor:9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7c6c3c7c5e6c5",
      {
        input: {
          image: dataUrl,
        },
      },
    )

    console.log("Colorization completed:", output)

    return NextResponse.json({
      success: true,
      originalImage: dataUrl,
      colorizedImage: output,
    })
  } catch (error) {
    console.error("Colorization error:", error)
    return NextResponse.json(
      { error: "Failed to colorize image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
