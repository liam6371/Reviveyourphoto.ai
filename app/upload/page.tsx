"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RestorationPreview } from "@/components/ui/restoration-preview"
import {
  Upload,
  X,
  CreditCard,
  ArrowLeft,
  Camera,
  CheckCircle,
  Loader2,
  Mail,
  Sparkles,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [step, setStep] = useState(1) // 1: Upload, 2: Services, 3: Preview, 4: Payment
  const [isProcessing, setIsProcessing] = useState(false)
  const [restorationResults, setRestorationResults] = useState<any[]>([])
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [email, setEmail] = useState("")
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailDemo, setEmailDemo] = useState(false)
  const [showVolumeDiscount, setShowVolumeDiscount] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Enhanced debug logging
  const addDebugInfo = (message: string) => {
    console.log("DEBUG:", message)
    setDebugInfo((prev) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Add this after the step state declaration
  useEffect(() => {
    addDebugInfo(`Step changed to: ${step}`)
    addDebugInfo(`Selected services: ${selectedServices.length} (${selectedServices.join(", ")})`)
    addDebugInfo(`Selected files: ${selectedFiles.length}`)
  }, [step, selectedServices, selectedFiles])

  const services = [
    {
      id: "repair",
      name: "Expert Photo Restoration",
      description: "Fix tears, scratches, and missing parts with precision",
    },
    {
      id: "colorize",
      name: "Colorization of Black & White Photos",
      description: "Add realistic, vibrant colors to vintage photographs",
    },
    { id: "damage", name: "Repairing Damage", description: "Restore fading, water damage, and deterioration" },
    {
      id: "enhance",
      name: "Improving Quality and Sharpness",
      description: "Enhance resolution and reduce noise for crystal clarity",
    },
  ]

  // Demo pricing calculation - $0.04 per photo
  const calculatePricing = () => {
    const photoCount = selectedFiles.length
    const basePrice = 0.04 // Demo price

    const subtotal = photoCount * basePrice

    return {
      basePrice,
      subtotal,
      total: subtotal,
      photoCount,
      savings: 0, // No volume discounts in demo
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    setSelectedFiles((prev) => [...prev, ...files])
    addDebugInfo(`Files dropped: ${files.length}`)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...files])
      addDebugInfo(`Files selected: ${files.length}`)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    addDebugInfo(`File removed at index: ${index}`)
  }

  const toggleService = (serviceId: string) => {
    addDebugInfo(`Toggling service: ${serviceId}`)
    setSelectedServices((prev) => {
      const newServices = prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
      addDebugInfo(`New services: ${newServices.join(", ")}`)
      return newServices
    })
  }

  const processPhotos = async () => {
    addDebugInfo("=== STARTING PHOTO PROCESSING ===")
    addDebugInfo(`Selected services: ${selectedServices.join(", ")}`)
    addDebugInfo(`Selected files: ${selectedFiles.length}`)

    // Enhanced validation
    if (selectedServices.length === 0) {
      const errorMsg = "Please select at least one restoration service before processing."
      addDebugInfo(`ERROR: ${errorMsg}`)
      alert(errorMsg)
      return
    }

    if (selectedFiles.length === 0) {
      const errorMsg = "Please select at least one photo to process."
      addDebugInfo(`ERROR: ${errorMsg}`)
      alert(errorMsg)
      return
    }

    setIsProcessing(true)
    setProcessingError(null)
    setRestorationResults([])
    setIsDemoMode(false)
    addDebugInfo("Processing state set to true")

    try {
      const results = []
      addDebugInfo(`Starting to process ${selectedFiles.length} files`)

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        addDebugInfo(`Processing file ${i + 1}/${selectedFiles.length}: ${file.name}`)

        const formData = new FormData()
        formData.append("image", file)
        formData.append("services", JSON.stringify(selectedServices))

        addDebugInfo("Making API call to /api/restore")

        const response = await fetch("/api/restore", {
          method: "POST",
          body: formData,
        })

        addDebugInfo(`API response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        addDebugInfo(`API response: ${JSON.stringify(result, null, 2)}`)

        if (result.success) {
          const processedResult = {
            originalImage: result.originalImage,
            restoredImage: result.restoredImage,
            filename: file.name,
            services: selectedServices,
            isDemo: result.demo || false,
            demoMessage: result.message,
            model: result.model,
          }

          results.push(processedResult)
          addDebugInfo(`Successfully processed file ${i + 1}`)

          if (result.demo) {
            setIsDemoMode(true)
            addDebugInfo("Demo mode detected")
          }
        } else {
          const errorMsg = result.error || "Failed to process image"
          addDebugInfo(`Processing failed: ${errorMsg}`)
          throw new Error(errorMsg)
        }
      }

      addDebugInfo(`All files processed successfully. Results: ${results.length}`)
      setRestorationResults(results)

      addDebugInfo("Setting step to 3 (Preview)")
      setStep(3)
      addDebugInfo("Step should now be 3")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to process photos"
      addDebugInfo(`PROCESSING ERROR: ${errorMsg}`)
      console.error("Processing error:", error)
      setProcessingError(errorMsg)
    } finally {
      setIsProcessing(false)
      addDebugInfo("Processing state set to false")
      addDebugInfo("=== PHOTO PROCESSING COMPLETE ===")
    }
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      // For external URLs (Replicate results), we need to fetch and download
      if (imageUrl.startsWith("http")) {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `restored_${filename}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up the object URL
        window.URL.revokeObjectURL(url)
      } else {
        // For data URLs (demo mode), download directly
        const link = document.createElement("a")
        link.href = imageUrl
        link.download = `restored_${filename}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download image. Please try right-clicking and saving the image.")
    }
  }

  const pricing = calculatePricing()

  const handleFreeDelivery = async () => {
    if (!email) {
      alert("Please enter your email address")
      return
    }

    setIsEmailSending(true)
    addDebugInfo("Starting email delivery process...")

    try {
      addDebugInfo(`Sending email to: ${email}`)
      addDebugInfo(`Restored images count: ${restorationResults.length}`)

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          restoredImages: restorationResults.map((r) => r.restoredImage),
          originalImages: restorationResults.map((r) => r.originalImage),
          services: selectedServices,
          filenames: restorationResults.map((r) => r.filename),
        }),
      })

      addDebugInfo(`Email API response status: ${response.status}`)

      const result = await response.json()
      addDebugInfo(`Email API response: ${JSON.stringify(result, null, 2)}`)

      if (result.success) {
        setEmailSent(true)
        setEmailDemo(result.demo || false)

        if (result.demo) {
          alert(`Demo Mode: ${result.message}`)
        } else {
          alert(`Success! Your restored photos have been emailed to ${email}. Check your inbox in a few minutes.`)
        }
      } else {
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Email sending error:", error)
      addDebugInfo(`Email error: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(
        `Email sending failed: ${errorMessage}. Please try downloading the images directly or check the debug info above.`,
      )
    } finally {
      setIsEmailSending(false)
      addDebugInfo("Email delivery process completed")
    }
  }

  const handlePayment = () => {
    setShowPayment(true)
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentSuccess(true)
    setShowPayment(false)
    alert(`Payment successful! Your photos are being processed. Payment ID: ${paymentIntentId}`)
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    console.error("Payment error:", error)
  }

  return (
    <div className="min-h-screen bg-warm-beige">
      {/* Enhanced Debug Panel */}
      <Card className="mb-4 bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h4 className="font-bold text-yellow-800 mb-2">Debug Info:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>
              <strong>Current State:</strong> Step: {step} | Files: {selectedFiles.length} | Services:{" "}
              {selectedServices.length} | Processing: {isProcessing ? "Yes" : "No"} | Results:{" "}
              {restorationResults.length}
            </p>
            <p>
              <strong>Selected Services:</strong> {selectedServices.join(", ") || "None"}
            </p>
            {processingError && (
              <p className="text-red-600">
                <strong>Error:</strong> {processingError}
              </p>
            )}
            <div className="mt-2">
              <strong>Recent Activity:</strong>
              {debugInfo.map((info, i) => (
                <div key={i} className="text-xs">
                  {info}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <header className="bg-warm-beige/95 backdrop-blur-sm border-b border-deep-navy/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <ArrowLeft className="h-5 w-5 text-deep-navy" />
            <div className="w-8 h-8 bg-deep-navy rounded-full flex items-center justify-center">
              <Camera className="h-4 w-4 text-warm-beige" />
            </div>
            <span className="text-2xl font-serif font-semibold text-deep-navy">Revive My Photo</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge
              variant={step >= 1 ? "default" : "secondary"}
              className={step >= 1 ? "bg-rich-coral text-white" : "bg-deep-navy/20 text-deep-navy"}
            >
              1. Upload
            </Badge>
            <Badge
              variant={step >= 2 ? "default" : "secondary"}
              className={step >= 2 ? "bg-rich-coral text-white" : "bg-deep-navy/20 text-deep-navy"}
            >
              2. Services
            </Badge>
            <Badge
              variant={step >= 3 ? "default" : "secondary"}
              className={step >= 3 ? "bg-rich-coral text-white" : "bg-deep-navy/20 text-deep-navy"}
            >
              3. Preview
            </Badge>
            <Badge
              variant={step >= 4 ? "default" : "secondary"}
              className={step >= 4 ? "bg-rich-coral text-white" : "bg-deep-navy/20 text-deep-navy"}
            >
              4. Delivery
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Email Service Notice */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-serif font-semibold text-blue-900 mb-2">Email Delivery Ready!</h3>
                <p className="text-blue-800 font-sans text-sm leading-relaxed">
                  Get your restored photos delivered via email. Add RESEND_API_KEY environment variable to enable real
                  email delivery, or test with our demo mode.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 1 && (
          <div className="space-y-12">
            <div className="text-center">
              <h1 className="text-5xl font-serif font-bold text-deep-navy mb-6">Upload Your Photos to Revive</h1>
              <p className="text-xl text-deep-navy/70 font-sans max-w-2xl mx-auto">
                Select the photographs you'd like to restore. Each image will be processed using advanced AI technology.
              </p>
            </div>

            {/* File Upload Area */}
            <Card className="border-2 border-dashed border-deep-navy/20 hover:border-rich-coral/40 transition-colors bg-white/50 backdrop-blur-sm">
              <CardContent className="p-12">
                <div
                  className={`text-center ${dragActive ? "bg-rich-coral/5" : ""} rounded-xl p-12 transition-colors`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-20 w-20 text-deep-navy/40 mx-auto mb-6" />
                  <h3 className="text-2xl font-serif font-semibold text-deep-navy mb-4">
                    Drag and drop your photos here
                  </h3>
                  <p className="text-deep-navy/60 mb-6 font-sans">or click to browse your files</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="bg-white border-deep-navy/30 text-deep-navy hover:bg-deep-navy/5 font-sans"
                      asChild
                    >
                      <span>Choose Files</span>
                    </Button>
                  </Label>
                  <p className="text-sm text-deep-navy/50 mt-6 font-sans">
                    Supported formats: JPG, PNG, TIFF, BMP (Max 10MB per file)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif text-deep-navy">Selected Photos ({selectedFiles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-cream rounded-xl overflow-hidden">
                          <Image
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={file.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-rich-coral hover:bg-rich-coral/90"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs text-deep-navy/60 mt-2 truncate font-sans">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedFiles.length > 0 && (
              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-rich-coral hover:bg-rich-coral/90 text-white px-10 py-4 rounded-full font-sans"
                  onClick={() => setStep(2)}
                >
                  Continue to Services
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12">
            <div className="text-center">
              <h1 className="text-5xl font-serif font-bold text-deep-navy mb-6">Select Restoration Services</h1>
              <p className="text-xl text-deep-navy/70 font-sans max-w-2xl mx-auto">
                Choose the restoration services that best suit your photographs' needs
              </p>
            </div>

            {selectedServices.length === 0 && (
              <Card className="bg-orange-50 border-orange-200 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <p className="text-orange-800 font-sans text-sm">
                      Please select at least one restoration service to continue.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedServices.includes(service.id)
                      ? "border-rich-coral bg-rich-coral/5 shadow-lg"
                      : "hover:border-deep-navy/30 bg-white/80 backdrop-blur-sm"
                  }`}
                  onClick={() => toggleService(service.id)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-semibold text-deep-navy mb-2">{service.name}</h3>
                        <p className="text-deep-navy/70 font-sans leading-relaxed">{service.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quality guarantee section */}
            <div className="mt-12">
              <Card className="bg-gradient-to-br from-rich-coral/5 to-rich-coral/10 border-rich-coral/20 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-12 w-12 text-rich-coral mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-deep-navy mb-4">Premium Quality Included</h3>
                  <p className="text-deep-navy/80 font-sans leading-relaxed mb-6">
                    Every restoration includes our highest quality processing - no upgrades needed. You'll receive
                    print-ready, high-resolution images perfect for any use.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-rich-coral flex-shrink-0" />
                      <span className="font-sans text-deep-navy">Maximum resolution output</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-rich-coral flex-shrink-0" />
                      <span className="font-sans text-deep-navy">Professional print quality</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-rich-coral flex-shrink-0" />
                      <span className="font-sans text-deep-navy">Museum-grade restoration</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-rich-coral flex-shrink-0" />
                      <span className="font-sans text-deep-navy">24-48 hour delivery</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Simplified order summary */}
            <Card className="bg-gradient-to-br from-cream to-warm-beige shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-serif font-semibold text-deep-navy mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-deep-navy">{pricing.photoCount} photos × $0.04 each</span>
                    <span className="font-serif font-semibold text-deep-navy">${pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-700 border-green-200 mt-2">
                        Launch Special - $0.04/photo
                      </Badge>
                      <p className="text-deep-navy/70 font-sans mt-2">Real AI processing at launch pricing</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-serif font-semibold text-deep-navy">Total</span>
                    <span className="text-3xl font-serif font-bold text-rich-coral">${pricing.total.toFixed(2)}</span>
                  </div>
                  <div className="bg-rich-coral/10 rounded-lg p-4">
                    <p className="text-deep-navy font-sans text-sm text-center">
                      <strong>Includes:</strong> Highest quality restoration, print-ready resolution, professional
                      processing, and email delivery
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="border-deep-navy/30 text-deep-navy hover:bg-deep-navy/5 font-sans"
                onClick={() => setStep(1)}
              >
                Back to Upload
              </Button>
              <Button
                size="lg"
                className="bg-rich-coral hover:bg-rich-coral/90 text-white px-10 py-4 rounded-full font-sans"
                onClick={processPhotos}
                disabled={selectedServices.length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing with AI...
                  </>
                ) : selectedServices.length === 0 ? (
                  "Select Services First"
                ) : (
                  "Revive Photos with AI"
                )}
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-blue-900 mb-2">Processing Your Photos</h3>
              <p className="text-blue-800 font-sans text-sm">
                Please wait while we restore your photos with AI. This may take a few moments...
              </p>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-12">
            <div className="text-center">
              <h1 className="text-5xl font-serif font-bold text-deep-navy mb-6">AI Restoration Results</h1>
              <p className="text-xl text-deep-navy/70 font-sans">
                Your photos have been processed using advanced AI. Review the results below.
              </p>
            </div>

            {processingError && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <p className="text-red-700 font-sans">{processingError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-8">
              {restorationResults.map((result, index) => (
                <RestorationPreview
                  key={index}
                  originalImage={result.originalImage}
                  restoredImage={result.restoredImage}
                  isProcessing={false}
                  error={null}
                  onDownload={() => downloadImage(result.restoredImage, result.filename)}
                  services={result.services}
                  isDemo={result.isDemo}
                  demoMessage={result.demoMessage}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="border-deep-navy/30 text-deep-navy hover:bg-deep-navy/5 font-sans"
                onClick={() => setStep(2)}
              >
                Back to Services
              </Button>
              <Button
                size="lg"
                className="bg-rich-coral hover:bg-rich-coral/90 text-white px-10 py-4 rounded-full font-sans"
                onClick={() => setStep(4)}
              >
                Continue to Delivery
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12">
            <div className="text-center">
              <h1 className="text-5xl font-serif font-bold text-deep-navy mb-6">Get Your Restored Photos</h1>
              <p className="text-xl text-deep-navy/70 font-sans">
                Choose how you'd like to receive your restored photos
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Free Email Delivery */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 font-serif text-deep-navy">
                    <Mail className="h-6 w-6 text-green-600" />
                    <span>Email Delivery</span>
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-700 border-green-200 w-fit">Free Testing!</Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-deep-navy/80 font-sans">
                    Get your restored photos delivered directly to your email inbox with download links.
                  </p>
                  <div>
                    <Label htmlFor="email-free" className="font-sans text-deep-navy">
                      Email Address
                    </Label>
                    <Input
                      id="email-free"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleFreeDelivery}
                    disabled={isEmailSending || emailSent || !email}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-sans"
                    size="lg"
                  >
                    {isEmailSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Email...
                      </>
                    ) : emailSent ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Email Sent!
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Photos to Email
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Paid Option */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 font-serif text-deep-navy">
                    <CreditCard className="h-6 w-6" />
                    <span>Secure Payment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
            </div>

            {emailSent && (
              <Card className={`${emailDemo ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle
                      className={`h-6 w-6 ${emailDemo ? "text-blue-600" : "text-green-600"} mt-0.5 flex-shrink-0`}
                    />
                    <div>
                      <h4 className={`font-serif font-semibold ${emailDemo ? "text-blue-900" : "text-green-900"} mb-2`}>
                        {emailDemo ? "Email Demo Complete!" : "Email Sent Successfully!"}
                      </h4>
                      <p className={`${emailDemo ? "text-blue-800" : "text-green-800"} font-sans text-sm`}>
                        {emailDemo
                          ? `Demo mode: In production, your restored photos would be sent to ${email}. Add RESEND_API_KEY to enable real emails.`
                          : `Your restored photos have been sent to ${email}. Please check your inbox (and spam folder) in the next few minutes.`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button
                variant="outline"
                className="border-deep-navy/30 text-deep-navy hover:bg-deep-navy/5 font-sans"
                onClick={() => setStep(3)}
              >
                Back to Preview
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
