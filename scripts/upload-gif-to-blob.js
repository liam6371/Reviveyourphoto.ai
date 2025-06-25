import { put } from "@vercel/blob"
import { promises as fs } from "fs"
import path from "path"

async function uploadGifToBlob() {
  try {
    console.log("🚀 Starting GIF upload to Blob...")

    // Check if we have the token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("❌ BLOB_READ_WRITE_TOKEN not found in environment variables")
      console.log("Add this to your .env.local file:")
      console.log("BLOB_READ_WRITE_TOKEN=your_token_here")
      return
    }

    // Your GIF file name
    const gifFileName = "restoration-demo.gif"
    const gifPath = path.join(process.cwd(), "public", gifFileName)

    console.log(`📁 Reading ${gifFileName} from:`, gifPath)

    // Check if file exists
    try {
      await fs.access(gifPath)
    } catch (error) {
      console.error(`❌ File not found: ${gifPath}`)
      console.log("Make sure your GIF is in the public folder")
      return
    }

    // Read the file
    const fileBuffer = await fs.readFile(gifPath)
    const fileSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2)

    console.log(`📊 File size: ${fileSizeMB}MB`)

    if (fileBuffer.length > 50 * 1024 * 1024) {
      // 50MB limit
      console.warn("⚠️  File is very large, upload might fail")
    }

    // Upload to Vercel Blob
    console.log("☁️  Uploading to Vercel Blob...")

    const { url } = await put(`demos/${gifFileName}`, fileBuffer, {
      access: "public",
      contentType: "image/gif",
      addRandomSuffix: false,
    })

    console.log("✅ Upload successful!")
    console.log("🔗 Blob URL:", url)
    console.log("")
    console.log("📋 Next steps:")
    console.log("1. Copy this URL to use in your components:")
    console.log(`   ${url}`)
    console.log("2. Update your video-demo component to use this URL")
    console.log("3. Test the GIF loads properly")

    // Save URL to a file for easy reference
    const urlFile = path.join(process.cwd(), "blob-urls.txt")
    await fs.appendFile(urlFile, `${gifFileName}: ${url}\n`)
    console.log(`💾 URL saved to: blob-urls.txt`)

    return url
  } catch (error) {
    console.error("❌ Upload failed:", error)

    if (error.message?.includes("unauthorized")) {
      console.log("🔑 Check your BLOB_READ_WRITE_TOKEN is correct")
    } else if (error.message?.includes("too large")) {
      console.log("📏 File is too large, try compressing your GIF")
    }
  }
}

// Run the upload
uploadGifToBlob()
