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

    console.log("Starting enhancement...")

    // Use GFPGAN for face restoration and enhancement
    const output = await replicate.run(
      "tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      {
        input: {
          img: dataUrl,
          version: "v1.4",
          scale: 2,
        },
      },
    )

    console.log("Enhancement completed:", output)

    return NextResponse.json({
      success: true,
      originalImage: dataUrl,
      enhancedImage: output,
    })
  } catch (error) {
    console.error("Enhancement error:", error)
    return NextResponse.json(
      { error: "Failed to enhance image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
