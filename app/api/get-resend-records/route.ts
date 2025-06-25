import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== RESEND DOMAIN RECORDS ===")

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "No RESEND_API_KEY found",
        message: "Add your Resend API key to get domain records",
      })
    }

    // Get domain records from Resend API
    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Domains data:", JSON.stringify(data, null, 2))

    // Find your domain
    const domain = data.data?.find((d: any) => d.name === "revivemyphoto.ai")

    if (!domain) {
      return NextResponse.json({
        error: "Domain not found",
        availableDomains: data.data?.map((d: any) => d.name) || [],
      })
    }

    // Get detailed records for your domain
    const recordsResponse = await fetch(`https://api.resend.com/domains/${domain.id}/records`, {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const recordsData = await recordsResponse.json()
    console.log("Records data:", JSON.stringify(recordsData, null, 2))

    return NextResponse.json({
      success: true,
      domain: domain,
      records: recordsData,
      instructions: {
        message: "Copy these exact values to your DNS provider",
        dkimRecord: recordsData.records?.find((r: any) => r.record === "resend._domainkey"),
      },
    })
  } catch (error) {
    console.error("Error fetching domain records:", error)
    return NextResponse.json({
      error: "Failed to fetch domain records",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
