import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { gifPath } = await request.json()

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Blob storage not configured" }, { status: 400 })
    }

    // Read the GIF file from public directory
    const fullPath = path.join(process.cwd(), "public", gifPath.replace("/", ""))

    console.log("Reading GIF from:", fullPath)

    const fileBuffer = await fs.readFile(fullPath)
    const fileName = path.basename(gifPath)

    console.log(`Uploading ${fileName} (${fileBuffer.length} bytes) to blob...`)

    // Upload to Vercel Blob
    const { url } = await put(`gifs/${fileName}`, fileBuffer, {
      access: "public",
      contentType: "image/gif",
    })

    console.log("GIF uploaded successfully:", url)

    return NextResponse.json({
      success: true,
      blobUrl: url,
      originalPath: gifPath,
      size: fileBuffer.length,
    })
  } catch (error) {
    console.error("GIF upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload GIF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
