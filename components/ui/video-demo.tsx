"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Play, ArrowRight } from "lucide-react"
import Image from "next/image"

export function VideoDemo() {
  const [videoError, setVideoError] = useState(false)
  const [gifError, setGifError] = useState(false)

  // ✅ UPDATED WITH YOUR BLOB URL
  const BLOB_GIF_URL =
    "https://lltjdxxnshvp2s1h.public.blob.vercel-storage.com/x-downloader.com_dLqd1f-ezgif.com-video-to-gif-converter-UAo7V0YYgZZtCTnYq30RMsqED5zbpr.gif"

  // Fallback URLs in order of preference
  const GIF_URLS = [
    BLOB_GIF_URL, // Blob storage (most reliable) ✅
    "/restoration-demo.gif", // Local file (fallback)
  ]

  const handleVideoError = () => {
    console.log("Video failed to load, trying GIF...")
    setVideoError(true)
  }

  const handleGifError = () => {
    console.log("GIF failed to load, showing static image")
    setGifError(true)
  }

  return (
    <div className="mb-12">
      <div className="relative max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-deep-navy/5 to-rich-coral/5">
          {!videoError ? (
            <>
              {/* Try video first */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-96 object-cover"
                poster="/examples/repair-damage-eyes.jpg"
                onError={handleVideoError}
              >
                <source src="/restoration-demo.mp4" type="video/mp4" />
              </video>

              <div className="absolute bottom-6 left-6">
                <Badge className="bg-white/90 text-deep-navy border-deep-navy/20 font-sans">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Powered
                </Badge>
              </div>

              <div className="absolute top-6 right-6">
                <Badge className="bg-black/50 text-white border-white/20 font-sans">
                  <Play className="h-4 w-4 mr-2" />
                  Live Demo
                </Badge>
              </div>
            </>
          ) : !gifError ? (
            <>
              {/* ✅ NOW USING YOUR BLOB URL - Much more reliable! */}
              <img
                src={BLOB_GIF_URL || "/placeholder.svg"}
                alt="Photo restoration demo showing before and after transformation"
                className="w-full h-96 object-cover"
                onError={handleGifError}
              />

              <div className="absolute bottom-6 left-6">
                <Badge className="bg-white/90 text-deep-navy border-deep-navy/20 font-sans">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Demo
                </Badge>
              </div>

              <div className="absolute top-6 right-6">
                <Badge className="bg-green-500 text-white border-white/20 font-sans">
                  <Play className="h-4 w-4 mr-2" />
                  Blob CDN ✅
                </Badge>
              </div>
            </>
          ) : (
            /* Final fallback: Static image */
            <div className="w-full h-96 relative overflow-hidden">
              <Image
                src="/examples/repair-damage-eyes.jpg"
                alt="Photo restoration demo showing before and after transformation"
                fill
                className="object-cover"
                priority
              />

              <div className="absolute bottom-6 left-6">
                <Badge className="bg-white/90 text-deep-navy border-deep-navy/20 font-sans">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Demo
                </Badge>
              </div>

              <div className="absolute top-6 right-6">
                <Badge className="bg-black/50 text-white border-white/20 font-sans">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Before & After
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-deep-navy/60 font-sans text-sm">
            {!videoError
              ? "Watch our AI technology transform damaged photos into beautiful memories"
              : !gifError
                ? "See our AI technology in action with this animated demonstration (Powered by Vercel CDN)"
                : "See how our AI technology transforms damaged photos into beautiful memories"}
          </p>
        </div>
      </div>
    </div>
  )
}
