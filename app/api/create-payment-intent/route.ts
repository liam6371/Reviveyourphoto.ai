import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe environment variables are available
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log("Stripe environment variables not configured")
      return NextResponse.json(
        {
          error: "Payment processing is not configured. Please add Stripe environment variables to enable payments.",
          configured: false,
          debug: {
            hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
            hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          },
        },
        { status: 400 },
      )
    }

    // Dynamically import and initialize Stripe only when needed
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })

    const { amount, photoCount, services, email } = await request.json()

    if (!amount || !photoCount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create payment intent for real processing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        photoCount: photoCount.toString(),
        services: JSON.stringify(services),
        email: email || "",
        product: "photo-restoration",
        pricePerPhoto: "0.04", // Track the current promotional price
      },
      description: `Photo Restoration - ${photoCount} photo${photoCount > 1 ? "s" : ""} at $0.04 each`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Payment intent creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
