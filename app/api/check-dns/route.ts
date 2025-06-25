import { NextResponse } from "next/server"
import { promises as dns } from "dns"

export async function GET() {
  try {
    const domain = "revivemyphoto.ai"
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    }

    // DNS checks to perform
    const dnsChecks = [
      {
        type: "MX",
        name: `send.${domain}`,
        description: "Mail exchange record for sending emails",
        expected: "feedback-smtp.us-east-1.amazonses.com",
      },
      {
        type: "TXT",
        name: `send.${domain}`,
        description: "SPF record for email authentication",
        expected: "v=spf1 include:amazonses.com",
      },
      {
        type: "TXT",
        name: `resend._domainkey.${domain}`,
        description: "DKIM record for email signing",
        expected: "p=MIGf (DKIM public key)",
      },
      {
        type: "TXT",
        name: `_dmarc.${domain}`,
        description: "DMARC policy record",
        expected: "v=DMARC1; p=none;",
      },
    ]

    for (const check of dnsChecks) {
      const result = {
        ...check,
        status: "unknown",
        found: [],
        message: "",
      }

      try {
        if (check.type === "MX") {
          const records = await dns.resolveMx(check.name)
          result.found = records.map((r) => `${r.priority} ${r.exchange}`)

          const hasCorrectMX = records.some((r) => r.exchange.includes("amazonses.com"))
          result.status = hasCorrectMX ? "pass" : "fail"
          result.message = hasCorrectMX ? "✅ Correct AWS SES mail server found" : "❌ AWS SES mail server not found"
        } else if (check.type === "TXT") {
          const records = await dns.resolveTxt(check.name)
          result.found = records.map((r) => r.join(""))

          let isCorrect = false
          if (check.name.includes("_domainkey")) {
            isCorrect = records.some((r) => r.join("").includes("p=MIGf"))
            result.message = isCorrect ? "✅ DKIM record found" : "❌ DKIM record missing or incorrect"
          } else if (check.name.includes("send")) {
            isCorrect = records.some((r) => r.join("").includes("v=spf1") && r.join("").includes("amazonses.com"))
            result.message = isCorrect ? "✅ SPF record found" : "❌ SPF record missing or incorrect"
          } else if (check.name.includes("_dmarc")) {
            isCorrect = records.some((r) => r.join("").includes("v=DMARC1"))
            result.message = isCorrect ? "✅ DMARC record found" : "❌ DMARC record missing or incorrect"
          }

          result.status = isCorrect ? "pass" : "fail"
        }
      } catch (error) {
        result.status = "fail"
        result.message = `❌ No ${check.type} records found`
        result.error = error.message
      }

      results.checks.push(result)
      results.summary.total++
      if (result.status === "pass") {
        results.summary.passed++
      } else {
        results.summary.failed++
      }
    }

    // Add recommendations
    results.recommendations = []

    if (results.summary.failed > 0) {
      results.recommendations.push("Add missing DNS records to your domain provider")
      results.recommendations.push("Wait 1-4 hours for DNS propagation")
      results.recommendations.push("Use default domain (onboarding@resend.dev) as alternative")
    } else {
      results.recommendations.push("All DNS records look good!")
      results.recommendations.push("Check Resend dashboard for verification status")
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      error: "DNS check failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
