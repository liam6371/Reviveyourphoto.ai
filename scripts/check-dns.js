// DNS Checker Script
async function checkDNSRecords() {
  const domain = "revivemyphoto.ai"

  console.log("🔍 Checking DNS records for", domain)
  console.log("=" * 50)

  // Records that should exist
  const expectedRecords = [
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
  ]

  for (const record of expectedRecords) {
    try {
      console.log(`\n📋 Checking ${record.type} record for ${record.name}`)

      // You would use a DNS lookup library here
      // For now, just showing the structure
      console.log(`Expected: ${record.expected}`)
      console.log("Status: ⏳ Checking...")
    } catch (error) {
      console.log(`❌ Error checking ${record.name}:`, error.message)
    }
  }

  console.log("\n💡 If records are missing:")
  console.log("1. Add them to your domain provider's DNS settings")
  console.log("2. Wait 15-60 minutes for propagation")
  console.log("3. Check Resend dashboard for verification")
}

// Run the check
checkDNSRecords()
