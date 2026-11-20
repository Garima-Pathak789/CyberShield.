const runTests = async () => {
  const baseURL = "http://localhost:5000";

  console.log("--- 1. Testing GET /api/health ---");
  const healthRes = await fetch(`${baseURL}/api/health`);
  const health = await healthRes.json();
  console.log("Health Status:", health.status, "DB Connected:", health.database?.connected);

  console.log("\n--- 2. Testing POST /api/scan (Suspicious Message) ---");
  const scan1Res = await fetch(`${baseURL}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Action required: Your account is suspended within 24 hours. Submit your OTP code now to avoid penalty."
    })
  });
  const scan1 = await scan1Res.json();
  console.log("Scan 1 Risk:", scan1.scan?.riskLevel, "Score:", scan1.scan?.riskScore, "Warnings:", scan1.scan?.warnings);

  console.log("\n--- 3. Testing POST /api/scan (Safe Message) ---");
  const scan2Res = await fetch(`${baseURL}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Good morning team, the weekly security briefing is scheduled for 10am."
    })
  });
  const scan2 = await scan2Res.json();
  console.log("Scan 2 Risk:", scan2.scan?.riskLevel, "Score:", scan2.scan?.riskScore, "Warnings:", scan2.scan?.warnings);

  console.log("\n--- 4. Testing POST /api/scan-url (Insecure IP / Keyword URL) ---");
  const url1Res = await fetch(`${baseURL}/api/scan-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "http://192.168.1.100/verify-account-security-login-portal-update"
    })
  });
  const url1 = await url1Res.json();
  console.log("URL 1 Risk:", url1.result?.riskLevel, "Score:", url1.result?.riskScore, "Warnings:", url1.result?.warnings);

  console.log("\n--- 5. Testing POST /api/scan-url (Safe HTTPS URL) ---");
  const url2Res = await fetch(`${baseURL}/api/scan-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://cybersecurity.gov.in"
    })
  });
  const url2 = await url2Res.json();
  console.log("URL 2 Risk:", url2.result?.riskLevel, "Score:", url2.result?.riskScore, "Warnings:", url2.result?.warnings);

  console.log("\n--- 6. Testing POST /api/scan-url (Invalid URL) ---");
  const url3Res = await fetch(`${baseURL}/api/scan-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "not-a-valid-http-url"
    })
  });
  const url3 = await url3Res.json();
  console.log("URL 3 Risk:", url3.result?.riskLevel, "Score:", url3.result?.riskScore, "Valid:", url3.result?.valid);

  console.log("\n--- 7. Testing GET /api/statistics ---");
  const statsRes = await fetch(`${baseURL}/api/statistics`);
  const stats = await statsRes.json();
  console.log("Statistics:", stats.statistics);

  console.log("\n--- 8. Testing GET /api/scans ---");
  const scansRes = await fetch(`${baseURL}/api/scans`);
  const scans = await scansRes.json();
  console.log("Total Scans Count:", scans.count, "Fetched:", scans.scans?.length);

  console.log("\n✅ ALL API TESTS COMPLETED SUCCESSFULLY!");
};

runTests().catch(console.error);
