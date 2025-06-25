"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Loader2, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReliableGifProps {
  src: string
  fallbackImage: string
  alt: string
  width?: number
  height?: number
  className?: string
  autoPlay?: boolean
  controls?: boolean
}

export function ReliableGif({
  src,
  fallbackImage,
  alt,
  width = 400,
  height = 300,
  className = "",
  autoPlay = true,
  controls = false,
}: ReliableGifProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [useBlob, setUseBlob] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Try to upload to Blob storage for better reliability
  useEffect(() => {
    const uploadToBlob = async () => {
      try {
        // Check if we have blob storage
        if (!process.env.NEXT_PUBLIC_BLOB_URL) {
          console.log("No blob storage configured")
          return
        }

        // Only upload external files
        if (!src.startsWith("/")) {
          return
        }

        console.log("Attempting to upload GIF to blob storage...")

        const response = await fetch("/api/upload-gif", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gifPath: src }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.blobUrl) {
            console.log("GIF uploaded to blob:", result.blobUrl)
            setUseBlob(true)
            // Update src to use blob URL
            if (imgRef.current) {
              imgRef.current.src = result.blobUrl
            }
          }
        }
      } catch (error) {
        console.log("Blob upload failed, using original:", error)
      }
    }

    uploadToBlob()
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    console.log("GIF failed to load, showing fallback")
    setIsLoading(false)
    setHasError(true)
  }

  const togglePlayback = () => {
    if (imgRef.current) {
      if (isPlaying) {
        // Pause by setting to static image
        imgRef.current.src = fallbackImage
      } else {
        // Resume by setting back to GIF
        imgRef.current.src = src
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
          style={{ width, height }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Main Image/GIF */}
      {!hasError ? (
        <img
          ref={imgRef}
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300 rounded-lg`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      ) : (
        /* Fallback Image */
        <Image
          src={fallbackImage || "/placeholder.svg"}
          alt={`${alt} (static image)`}
          width={width}
          height={height}
          className="rounded-lg"
          onLoad={handleLoad}
        />
      )}

      {/* Controls */}
      {controls && !hasError && !isLoading && (
        <div className="absolute bottom-2 right-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-black/50 text-white hover:bg-black/70"
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Status Indicator */}
      {useBlob && (
        <div className="absolute top-2 left-2">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">Optimized</div>
        </div>
      )}
    </div>
  )
}
