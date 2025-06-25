import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    console.log("=== BLOB UPLOAD API ===")

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Blob storage not configured" }, { status: 400 })
    }

    const { fileName } = await request.json()

    // Read the GIF from your public folder
    const gifPath = path.join(process.cwd(), "public", fileName)
    console.log("Reading GIF from:", gifPath)

    try {
      const fileBuffer = await fs.readFile(gifPath)
      console.log(`File size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`)

      // Upload to Vercel Blob
      const { url } = await put(`demos/${fileName}`, fileBuffer, {
        access: "public",
        contentType: "image/gif",
        addRandomSuffix: false, // Keep original filename
      })

      console.log("✅ GIF uploaded successfully:", url)

      return NextResponse.json({
        success: true,
        blobUrl: url,
        originalPath: fileName,
        size: fileBuffer.length,
        sizeFormatted: `${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`,
      })
    } catch (fileError) {
      console.error("File read error:", fileError)
      return NextResponse.json({ error: "File not found or unreadable" }, { status: 404 })
    }
  } catch (error) {
    console.error("Blob upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload to blob",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
