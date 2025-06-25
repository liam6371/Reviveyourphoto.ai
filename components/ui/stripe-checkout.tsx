"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react"

// Safe Stripe initialization
const getStripePromise = () => {
  if (typeof window === "undefined") return null
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return null
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

const stripePromise = getStripePromise()

interface CheckoutFormProps {
  amount: number
  photoCount: number
  services: string[]
  email: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

function CheckoutForm({ amount, photoCount, services, email, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [localEmail, setLocalEmail] = useState(email || "")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Critical validation - prevent payment without email
    if (!localEmail || !localEmail.includes("@")) {
      onError("Please enter a valid email address before proceeding with payment")
      return
    }

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus("processing")

    try {
      // Create payment intent with email
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          photoCount,
          services,
          email: localEmail, // Use the email from the form
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create payment intent")
      }

      const { clientSecret, paymentIntentId } = result

      if (!clientSecret) {
        throw new Error("Failed to create payment intent")
      }

      // Confirm payment with email
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: localEmail,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent.status === "succeeded") {
        setPaymentStatus("success")
        onSuccess(paymentIntent.id)
      }
    } catch (err) {
      setPaymentStatus("error")
      onError(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#1F2A44",
        "::placeholder": {
          color: "#8B8B8B",
        },
      },
    },
  }

  if (paymentStatus === "success") {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-serif font-bold text-green-900 mb-2">Payment Successful!</h3>
          <p className="text-green-800 font-sans">Your photos are now being processed and emailed to {localEmail}.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3 font-serif text-deep-navy">
          <CreditCard className="h-6 w-6" />
          <span>Secure Payment & Email Delivery</span>
        </CardTitle>
        <div className="flex justify-between items-center">
          <span className="font-sans text-deep-navy/70">
            {photoCount} photo{photoCount > 1 ? "s" : ""} × $0.50 each
          </span>
          <Badge className="bg-green-100 text-green-700">Launch Special</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-cream rounded-lg p-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-serif font-semibold text-deep-navy">Total:</span>
            <span className="font-serif font-bold text-rich-coral text-2xl">${amount.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input - Required Part of Payment Form */}
          <div>
            <label htmlFor="payment-email" className="block text-sm font-medium text-deep-navy mb-2">
              Email Address *
            </label>
            <p className="text-deep-navy/60 font-sans text-sm mb-3">
              Your restored photos will be automatically emailed here after payment
            </p>
            <input
              id="payment-email"
              type="email"
              placeholder="your@email.com"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              className="w-full p-4 border border-deep-navy/20 rounded-lg bg-white text-deep-navy text-lg focus:outline-none focus:ring-2 focus:ring-rich-coral focus:border-rich-coral"
              required
            />
          </div>

          {/* Card Element */}
          <div>
            <label className="block text-sm font-medium text-deep-navy mb-2">Payment Details *</label>
            <div className="p-4 border border-deep-navy/20 rounded-lg bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {paymentStatus === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700 font-sans text-sm">
                  Payment failed. Please check your details and try again.
                </p>
              </div>
            </div>
          )}

          {/* Payment Flow Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-serif font-semibold text-blue-900 mb-2">What happens next:</h4>
            <div className="space-y-1 text-blue-800 font-sans text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span>Payment is processed securely</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span>Photos are automatically emailed to {localEmail || "your email"}</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!stripe || isProcessing || !localEmail || !localEmail.includes("@")}
            className="w-full bg-rich-coral hover:bg-rich-coral/90 text-white font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : !localEmail || !localEmail.includes("@") ? (
              "Enter Email to Continue"
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ${amount.toFixed(2)} & Send Photos
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-deep-navy/60 font-sans">
            🔒 Secured by Stripe • Photos automatically emailed after successful payment
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface StripeCheckoutProps {
  amount: number
  photoCount: number
  services: string[]
  email: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

export function StripeCheckout({ amount, photoCount, services, email, onSuccess, onError }: StripeCheckoutProps) {
  const [isStripeConfigured, setIsStripeConfigured] = useState(true)

  useEffect(() => {
    // Check if Stripe is configured on the client side
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setIsStripeConfigured(false)
    }
  }, [])

  // Show configuration error if Stripe is not set up
  if (!isStripeConfigured || !stripePromise) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-serif font-bold text-red-900 mb-2">Payment Setup Required</h3>
          <p className="text-red-800 font-sans mb-6">
            Stripe payment processing is not configured. Please add your Stripe API keys to enable payments.
          </p>
          <div className="bg-red-100 rounded-lg p-4 text-left">
            <p className="text-red-800 font-sans text-sm">
              <strong>Required Environment Variables:</strong>
              <br />• STRIPE_SECRET_KEY
              <br />• NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        photoCount={photoCount}
        services={services}
        email={email}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}
