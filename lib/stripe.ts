import Stripe from "stripe"

// Make Stripe initialization completely safe for build time
export const stripe = (() => {
  // Only initialize Stripe if we're in runtime AND have the secret key
  if (typeof window !== "undefined") {
    // Client-side, return null
    return null
  }

  // Server-side
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY not found - Stripe will be disabled")
    return null
  }

  try {
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
    return null
  }
})()

export const getStripe = () => {
  if (typeof window === "undefined") {
    // Server-side, return null
    return null
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set")
    return null
  }

  return require("@stripe/stripe-js").loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}
