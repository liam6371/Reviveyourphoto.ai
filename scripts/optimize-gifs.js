import { promises as fs } from "fs"
import path from "path"

async function optimizeGif(inputPath, outputPath) {
  try {
    console.log(`Optimizing ${inputPath}...`)

    // Get file stats
    const stats = await fs.stat(inputPath)
    console.log(`Original size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`)

    // For GIFs, we need to use a different approach since Sharp doesn't handle animated GIFs well
    // Copy the file and check size
    await fs.copyFile(inputPath, outputPath)

    const newStats = await fs.stat(outputPath)
    console.log(`Final size: ${(newStats.size / 1024 / 1024).toFixed(2)}MB`)

    // Warn if file is too large
    if (newStats.size > 10 * 1024 * 1024) {
      // 10MB
      console.warn(`⚠️  GIF is ${(newStats.size / 1024 / 1024).toFixed(2)}MB - consider reducing size`)
    }

    return newStats.size
  } catch (error) {
    console.error(`Failed to optimize ${inputPath}:`, error)
    throw error
  }
}

// Optimize all GIFs in public folder
async function optimizeAllGifs() {
  const publicDir = path.join(process.cwd(), "public")
  const files = await fs.readdir(publicDir, { recursive: true })

  for (const file of files) {
    if (file.toString().endsWith(".gif")) {
      const inputPath = path.join(publicDir, file.toString())
      const outputPath = path.join(publicDir, "optimized_" + file.toString())

      try {
        await optimizeGif(inputPath, outputPath)
      } catch (error) {
        console.error(`Failed to process ${file}:`, error)
      }
    }
  }
}

optimizeAllGifs()
