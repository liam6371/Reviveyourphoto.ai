"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react"

export default function RecoverPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const sendRecoveryEmail = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/recover-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: "pi_3RdzsYKarur5yQPS1ekwfLfj",
          email: "athasl18@gmail.com",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Recovery failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-beige p-6">
      <div className="container mx-auto max-w-2xl">
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardTitle className="text-2xl font-serif flex items-center">
              <Mail className="h-6 w-6 mr-2" />🚨 URGENT: Recover Your Paid Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Payment Details:</h3>
                <p className="text-yellow-700">
                  <strong>Payment ID:</strong> pi_3RdzsYKarur5yQPS1ekwfLfj
                </p>
                <p className="text-yellow-700">
                  <strong>Email:</strong> athasl18@gmail.com
                </p>
                <p className="text-yellow-700">
                  <strong>Status:</strong> Payment successful, delivery failed
                </p>
              </div>

              <div className="text-center">
                <Button
                  onClick={sendRecoveryEmail}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending Recovery Email...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Send Recovery Email NOW
                    </>
                  )}
                </Button>
              </div>

              {result && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Recovery Email Sent!</h3>
                    </div>
                    <p className="text-green-700 mb-3">{result.message}</p>
                    <div className="space-y-2">
                      <p className="text-green-600 font-medium">Next Steps:</p>
                      {result.nextSteps?.map((step: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-700">{index + 1}</Badge>
                          <span className="text-green-700 text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-800">Error</h3>
                    </div>
                    <p className="text-red-700 mt-2">{error}</p>
                  </CardContent>
                </Card>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">What This Does:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Sends urgent recovery email to athasl18@gmail.com</li>
                  <li>• Includes your payment ID for verification</li>
                  <li>• Provides direct reply options for photos or refund</li>
                  <li>• Guarantees response within 30 minutes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
