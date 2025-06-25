// Working DNS Checker Script
import { promises as dns } from "dns"

async function checkDNSRecords() {
  const domain = "revivemyphoto.ai"

  console.log("🔍 Checking DNS records for", domain)
  console.log("=".repeat(50))

  // Records that should exist based on your Resend setup
  const checks = [
    {
      type: "MX",
      name: `send.${domain}`,
      expected: "feedback-smtp.us-east-1.amazonses.com",
    },
    {
      type: "TXT",
      name: `send.${domain}`,
      expected: "v=spf1 include:amazonses.com",
    },
    {
      type: "TXT",
      name: `resend._domainkey.${domain}`,
      expected: "p=MIGfMA0GCSqGSIb3DQEB",
    },
    {
      type: "TXT",
      name: `_dmarc.${domain}`,
      expected: "v=DMARC1; p=none;",
    },
  ]

  for (const check of checks) {
    try {
      console.log(`\n📋 Checking ${check.type} record for ${check.name}`)

      if (check.type === "MX") {
        try {
          const records = await dns.resolveMx(check.name)
          console.log(`✅ Found MX records:`)
          records.forEach((record) => {
            console.log(`   Priority: ${record.priority}, Exchange: ${record.exchange}`)
            if (record.exchange.includes("amazonses.com")) {
              console.log(`   ✅ Correct AWS SES server found!`)
            }
          })
        } catch (error) {
          console.log(`❌ No MX records found for ${check.name}`)
          console.log(`   Expected: ${check.expected}`)
        }
      } else if (check.type === "TXT") {
        try {
          const records = await dns.resolveTxt(check.name)
          console.log(`✅ Found TXT records:`)
          records.forEach((record, index) => {
            const txtValue = record.join("")
            console.log(`   Record ${index + 1}: ${txtValue.substring(0, 100)}${txtValue.length > 100 ? "..." : ""}`)

            if (check.name.includes("_domainkey") && txtValue.includes("p=MIGf")) {
              console.log(`   ✅ DKIM record looks correct!`)
            } else if (check.name.includes("send") && txtValue.includes("v=spf1")) {
              console.log(`   ✅ SPF record looks correct!`)
            } else if (check.name.includes("_dmarc") && txtValue.includes("v=DMARC1")) {
              console.log(`   ✅ DMARC record looks correct!`)
            }
          })
        } catch (error) {
          console.log(`❌ No TXT records found for ${check.name}`)
          console.log(`   Expected to contain: ${check.expected}`)
        }
      }
    } catch (error) {
      console.log(`❌ Error checking ${check.name}:`, error.message)
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log("📊 DNS Check Summary:")
  console.log("✅ = Record found and looks correct")
  console.log("❌ = Record missing or incorrect")
  console.log("\n💡 Next steps:")
  console.log("1. If records are missing, add them to your domain provider")
  console.log("2. If records exist but Resend still shows 'Pending', wait 1-4 hours")
  console.log("3. If still failing after 24 hours, contact your domain provider")
  console.log("\n🚀 Alternative: Use default domain onboarding@resend.dev")
}

// Run the check
checkDNSRecords().catch(console.error)
