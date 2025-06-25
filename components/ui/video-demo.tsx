"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Play, ArrowRight } from "lucide-react"
import Image from "next/image"

export function VideoDemo() {
  const [videoError, setVideoError] = useState(false)

  const handleVideoError = () => {
    console.log("Video failed to load, showing fallback")
    setVideoError(true)
  }

  return (
    <div className="mb-12">
      <div className="relative max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-deep-navy/5 to-rich-coral/5">
          {!videoError ? (
            <>
              {/* Video Option - Updated to use your MP4 */}
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
                Your browser does not support the video tag.
              </video>

              {/* Video overlay with branding */}
              <div className="absolute bottom-6 left-6">
                <Badge className="bg-white/90 text-deep-navy border-deep-navy/20 font-sans">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Powered
                </Badge>
              </div>

              {/* Play indicator */}
              <div className="absolute top-6 right-6">
                <Badge className="bg-black/50 text-white border-white/20 font-sans">
                  <Play className="h-4 w-4 mr-2" />
                  Live Demo
                </Badge>
              </div>
            </>
          ) : (
            /* Fallback: Show as GIF instead */
            <div className="w-full h-96 relative overflow-hidden">
              <Image
                src="/restoration-demo.gif"
                alt="Photo restoration demo showing before and after transformation"
                fill
                className="object-cover"
                priority
                unoptimized // Important for GIFs to animate properly
              />

              {/* GIF overlay */}
              <div className="absolute bottom-6 left-6">
                <Badge className="bg-white/90 text-deep-navy border-deep-navy/20 font-sans">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Demo
                </Badge>
              </div>

              {/* GIF indicator */}
              <div className="absolute top-6 right-6">
                <Badge className="bg-black/50 text-white border-white/20 font-sans">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Animated Demo
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Demo Description */}
        <div className="mt-6 text-center">
          <p className="text-deep-navy/60 font-sans text-sm">
            {videoError
              ? "See how our AI technology transforms damaged photos into beautiful memories"
              : "Watch our AI technology transform damaged photos into beautiful memories"}
          </p>
        </div>
      </div>
    </div>
  )
}
