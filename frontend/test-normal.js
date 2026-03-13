/**
 * Test normal user interactions for logging in without firing anomalies
 */
import { chromium } from "playwright";

const APP_URL  = "http://localhost:5173";   
const USERNAME = "admin";
const PASSWORD = "admin123";

async function runNormalTest() {
  console.log("Starting normal user simulation...");

  const browser = await chromium.launch({ headless: false }); // Real browser window
  
  // Use realistic fingerprint/timezone
  const context = await browser.newContext({
    userAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timezoneId: "Asia/Kolkata",         
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  
  try {
    await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Simulate real user mouse behavior (moving the mouse before typing)
    await page.evaluate(() => {
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150 }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 200 }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 250 }));
    });

    const usernameField = await page.locator('input[type="text"]').first();
    await usernameField.click();
    await page.waitForTimeout(100);
    await usernameField.type(USERNAME, { delay: 100 }); 

    const passwordField = await page.locator('input[type="password"]').first();
    await passwordField.click();
    await page.waitForTimeout(100);
    await passwordField.type(PASSWORD, { delay: 100 }); 

    await page.mouse.move(900, 500);
    const submitBtn = await page.locator('button').filter({ hasText: /AUTHENTICATE|LOGIN|Sign In/i }).first();
    await page.waitForTimeout(1500); // Simulate human reaction time before clicking
    await submitBtn.click();

    await page.waitForTimeout(3000);
    
    const content = await page.content();
    if (content.includes("Dashboard")) {
        console.log("✅ Passed normal login test.");
    } else {
        console.log("❌ Normal login failed. Check backend logic.");
    }
  } catch(e) {
      console.error(e);
  } finally {
      await browser.close();
  }
}

runNormalTest();
