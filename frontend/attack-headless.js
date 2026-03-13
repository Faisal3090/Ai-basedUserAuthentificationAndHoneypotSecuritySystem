/**
 * ═══════════════════════════════════════════════════════════════
 *  HEADLESS BROWSER ATTACK SIMULATOR
 *  Uses Playwright — triggers HEADLESS_BROWSER + TIMEZONE_SHIFT
 *  + FINGERPRINT_MISMATCH + BOT_SPEED_SUBMIT tripwires
 * 
 *  Install:  npm install playwright
 *            npx playwright install chromium
 * 
 *  Run:      node attack-headless.js
 * ═══════════════════════════════════════════════════════════════
 */

import { chromium } from "playwright";

const APP_URL  = "http://localhost:5173";   // your frontend
const USERNAME = "admin";
const PASSWORD = "admin123";

async function attack() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  HEADLESS BROWSER ATTACK SIMULATION");
  console.log("═══════════════════════════════════════════════════\n");

  const browser = await chromium.launch({
    headless: true,   // ← triggers HEADLESS_BROWSER detection (screenWidth=0)
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    // Different OS + timezone from baseline (IST → EST = 10.5hr shift)
    userAgent:  "python-requests/2.28.2",
    timezoneId: "America/New_York",         // ← triggers TIMEZONE_SHIFT
    locale:     "en-US",
    geolocation:{ latitude: 40.71, longitude: -74.00 },
    permissions:["geolocation"],
    // No viewport = headless signal
    viewport: null,
  });

  // Inject script to make headless even more obvious to your detector
  await context.addInitScript(() => {
    // Override screen to return 0 (headless signal)
    Object.defineProperty(window.screen, "width",  { get: () => 0 });
    Object.defineProperty(window.screen, "height", { get: () => 0 });
    // Override hardwareConcurrency to 1 (VPS signal)
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 1 });
    // Override deviceMemory to undefined
    Object.defineProperty(navigator, "deviceMemory", { get: () => undefined });
  });

  const page = await context.newPage();

  try {
    console.log(`📡 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(800);
    console.log("✅ Page loaded\n");

    // ── Fill form with ZERO mouse movement (NO_MOUSE_ACTIVITY) ──
    console.log("⚡ Filling form instantly with no mouse movement...");
    const t0 = Date.now();

    // Target username field
    const usernameField = await page.locator('input[type="text"]').first();
    await usernameField.fill(USERNAME);

    // Target password field
    const passwordField = await page.locator('input[type="password"]').first();
    await passwordField.fill(PASSWORD);

    // Submit instantly (BOT_SPEED_SUBMIT — under 800ms total)
    const submitBtn = await page.locator('button').filter({ hasText: /AUTHENTICATE|LOGIN|Sign In/i }).first();
    await submitBtn.click();

    const elapsed = Date.now() - t0;
    console.log(`⏱  Form filled + submitted in ${elapsed}ms`);
    console.log(`   (Threshold: 800ms — BOT_SPEED_SUBMIT ${elapsed < 800 ? "✅ TRIGGERED" : "not triggered"})\n`);

    // Wait for redirect
    await page.waitForTimeout(4000);

    // ── Check result ─────────────────────────────────────────
    const url     = page.url();
    const content = await page.content();

    console.log("─── RESULT ─────────────────────────────────────────");
    if (content.includes("SecureAdmin") || content.includes("Dashboard")) {
      console.log("🕵️  HONEYPOT TRIGGERED — Attacker inside fake dashboard!");
      console.log("   → Check your app dashboard → Honeypot tab");
    } else if (content.includes("expired") || content.includes("locked") || content.includes("terminated")) {
      console.log("🔒 ACCOUNT TERMINATED — Highest severity detection!");
    } else if (content.includes("Invalid") || content.includes("incorrect")) {
      console.log("❌ Login rejected by credential check");
    } else {
      console.log("⚠️  Unclear result — saving screenshot for review");
    }
    console.log(`   URL: ${url}`);

    await page.screenshot({ path: "attack-result-headless.png", fullPage: true });
    console.log("📸 Screenshot → attack-result-headless.png");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
    console.log("\n✅ Headless attack simulation complete");
    console.log("═══════════════════════════════════════════════════");
  }
}

attack();
