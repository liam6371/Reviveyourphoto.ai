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
              {/* Video Option */}
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
                <source src="/restoration-demo.webm" type="video/webm" />
              </video>

              {/* Video overlay with branding */}
              <div className="absolute bottom-6 left-6">
                <Badge className="bg-white/90 text-deep-navy border-deep-navy/20 font-sans">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Demo
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
            /* Fallback: Animated Demo with Before/After Images */
            <div className="w-full h-96 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
              {/* Animated Before/After Showcase */}
              <div className="grid grid-cols-2 gap-8 w-full h-full p-8">
                <div className="text-center">
                  <h3 className="text-deep-navy font-serif text-xl mb-4">Before</h3>
                  <div className="relative h-48 bg-white rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src="/examples/damaged-military-portrait.jpg"
                      alt="Damaged photo before restoration"
                      fill
                      className="object-cover opacity-70"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-rich-coral font-serif text-xl mb-4">After AI Restoration</h3>
                  <div className="relative h-48 bg-white rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src="/examples/repair-damage-eyes.jpg"
                      alt="Restored photo after AI processing"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Animated Arrow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-rich-coral text-white p-3 rounded-full shadow-lg animate-pulse">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Fallback overlay */}
              <div className="absolute bottom-6 left-6">
                <Badge className="bg-white/90 text-deep-navy border-deep-navy/20 font-sans">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Demo
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
