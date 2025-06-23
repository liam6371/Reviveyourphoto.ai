import { type NextRequest, NextResponse } from "next/server"

// Check if we have a valid Replicate token
const DEMO_MODE = !process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN.length < 10

async function simulateProcessing(delay = 2000) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

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
    console.log("Demo mode:", DEMO_MODE)
    console.log("Replicate token exists:", !!process.env.REPLICATE_API_TOKEN)
    console.log("Replicate token length:", process.env.REPLICATE_API_TOKEN?.length || 0)

    // Demo mode - simulate processing without Replicate
    if (DEMO_MODE) {
      console.log("Running in demo mode - simulating photo restoration...")

      // Simulate processing time
      await simulateProcessing(3000)

      // Return the original image as "restored" for demo purposes
      return NextResponse.json({
        success: true,
        originalImage: dataUrl,
        restoredImage: dataUrl, // Using original as demo
        model: "demo-mode",
        services: services,
        demo: true,
        message:
          "Demo mode: In production, this would be processed with Replicate AI. Add a valid REPLICATE_API_TOKEN to enable real processing.",
      })
    }

    // Real Replicate processing
    const Replicate = (await import("replicate")).default

    // Validate token format
    if (!process.env.REPLICATE_API_TOKEN.startsWith("r8_")) {
      console.error("Invalid Replicate token format. Token should start with 'r8_'")
      throw new Error("Invalid API token format")
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
      demo: false,
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

        // Fall back to demo mode for authentication errors
        console.log("Authentication failed, falling back to demo mode...")

        try {
          const formData = await request.formData()
          const file = formData.get("image") as File
          const services = JSON.parse((formData.get("services") as string) || "[]")

          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString("base64")
          const dataUrl = `data:${file.type};base64,${base64}`

          await simulateProcessing(2000)

          return NextResponse.json({
            success: true,
            originalImage: dataUrl,
            restoredImage: dataUrl,
            model: "demo-fallback",
            services: services,
            demo: true,
            message: "Demo mode: Replicate authentication failed. Check your REPLICATE_API_TOKEN environment variable.",
          })
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError)
        }
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
