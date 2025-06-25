"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

interface RestorationPreviewProps {
  originalImage: string
  restoredImage: string | null
  isProcessing: boolean
  error: string | null
  onDownload: () => void
  services: string[]
}

export function RestorationPreview({
  originalImage,
  restoredImage,
  isProcessing,
  error,
  onDownload,
  services,
}: RestorationPreviewProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="font-serif text-deep-navy flex items-center justify-between">
          Restoration Preview
          {isProcessing && (
            <Badge className="bg-rich-coral/10 text-rich-coral border-rich-coral/20">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processing...
            </Badge>
          )}
          {restoredImage && !isProcessing && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
          {error && (
            <Badge className="bg-red-100 text-red-700 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-deep-navy">Original</h4>
            <div className="aspect-square bg-cream rounded-lg overflow-hidden">
              <Image
                src={originalImage || "/placeholder.svg"}
                alt="Original photo"
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Restored Image */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-deep-navy">Restored</h4>
            <div className="aspect-square bg-cream rounded-lg overflow-hidden flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-rich-coral animate-spin mx-auto mb-2" />
                  <p className="text-sm text-deep-navy/60 font-sans">Processing your photo...</p>
                </div>
              ) : restoredImage ? (
                <Image
                  src={restoredImage || "/placeholder.svg"}
                  alt="Restored photo"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              ) : error ? (
                <div className="text-center text-red-600">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-sans">Processing failed</p>
                </div>
              ) : (
                <div className="text-center text-deep-navy/40">
                  <p className="text-sm font-sans">Restored image will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services Applied */}
        <div>
          <h4 className="font-serif font-semibold text-deep-navy mb-3">Services Applied</h4>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <Badge key={service} className="bg-rich-coral/10 text-rich-coral border-rich-coral/20">
                {service === "repair" && "Photo Restoration"}
                {service === "colorize" && "Colorization"}
                {service === "enhance" && "Quality Enhancement"}
                {service === "damage" && "Damage Repair"}
              </Badge>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-sans text-sm">{error}</p>
          </div>
        )}

        {/* Download Button */}
        {restoredImage && !isProcessing && (
          <Button
            onClick={onDownload}
            className="w-full bg-rich-coral hover:bg-rich-coral/90 text-white font-sans"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Restored Photo
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
