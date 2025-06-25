import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File
    const services = JSON.parse((formData.get("services") as string) || "[]")

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("Processing request with services:", services)

    // Check if Replicate is configured
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("Replicate API token is not configured.")
      return NextResponse.json(
        {
          error: "Replicate API token is not configured. Please set the REPLICATE_API_TOKEN environment variable.",
          success: false,
        },
        { status: 500 },
      )
    }

    // Real Replicate processing
    const Replicate = (await import("replicate")).default

    // Validate token format
    if (!process.env.REPLICATE_API_TOKEN.startsWith("r8_")) {
      console.error("Invalid Replicate token format. Token should start with 'r8_'")
      return NextResponse.json(
        { error: "Invalid Replicate token format. Token should start with 'r8_'.", success: false },
        { status: 500 },
      )
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    console.log("Starting real AI processing with Replicate...")

    // Determine which model to use based on services
    let model: string
    let input: any

    // Priority order: colorization > restoration/enhancement
    if (services.includes("colorize")) {
      // Use BigColor for colorization
      model = "cjwbw/bigcolor:9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7c6c3c7c5e6c5"
      input = {
        image: dataUrl,
        render_factor: 35, // Higher quality
      }
      console.log("Using BigColor model for colorization")
    } else if (services.includes("repair") || services.includes("enhance") || services.includes("damage")) {
      // Use GFPGAN for face restoration and general enhancement
      model = "tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3"
      input = {
        img: dataUrl,
        version: "v1.4",
        scale: 2, // 2x upscaling
      }
      console.log("Using GFPGAN model for restoration/enhancement")
    } else {
      // Default to GFPGAN for general improvement
      model = "tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3"
      input = {
        img: dataUrl,
        version: "v1.4",
        scale: 2,
      }
      console.log("Using default GFPGAN model")
    }

    console.log("Starting prediction with model:", model)

    // Run the prediction
    const output = await replicate.run(model, { input })

    console.log("Restoration completed successfully")
    console.log("Output type:", typeof output)

    // Handle different output formats
    let restoredImageUrl: string
    if (typeof output === "string") {
      restoredImageUrl = output
    } else if (Array.isArray(output) && output.length > 0) {
      restoredImageUrl = output[0]
    } else if (output && typeof output === "object" && "url" in output) {
      restoredImageUrl = (output as any).url
    } else {
      throw new Error("Unexpected output format from AI model")
    }

    return NextResponse.json({
      success: true,
      originalImage: dataUrl,
      restoredImage: restoredImageUrl,
      model: model,
      services: services,
    })
  } catch (error) {
    console.error("Restoration error:", error)

    // Provide more detailed error information
    let errorMessage = "Failed to restore image"
    let errorDetails = "Unknown error"

    if (error instanceof Error) {
      errorDetails = error.message

      // Handle specific Replicate errors
      if (error.message.includes("authentication") || error.message.includes("Authentication")) {
        errorMessage = "Authentication failed - please check API token"
      } else if (error.message.includes("quota") || error.message.includes("limit")) {
        errorMessage = "API quota exceeded - please try again later"
      } else if (error.message.includes("timeout")) {
        errorMessage = "Processing timeout - please try with a smaller image"
      } else if (error.message.includes("Invalid input")) {
        errorMessage = "Invalid image format - please try a different image"
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        success: false,
      },
      { status: 500 },
    )
  }
}
