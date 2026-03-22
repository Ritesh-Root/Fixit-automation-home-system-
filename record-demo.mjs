import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, "demo-video");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone 14 Pro size
  deviceScaleFactor: 2,
  recordVideo: {
    dir: outputPath,
    size: { width: 390, height: 844 },
  },
});

const page = await context.newPage();

console.log("Navigating to demo page...");
await page.goto("http://localhost:3000/demo", { waitUntil: "networkidle" });

// Wait for the full demo script to play out (~22 seconds total delays in script)
console.log("Waiting for demo to play through (25 seconds)...");
await page.waitForTimeout(25000);

// Wait for done badge
try {
  await page.waitForSelector("text=Demo complete", { timeout: 5000 });
  console.log("Demo complete badge found!");
} catch {
  console.log("Continuing after timeout...");
}

// Linger a moment at the end
await page.waitForTimeout(2000);

console.log("Closing browser and saving video...");
await context.close();
await browser.close();

console.log(`Video saved to: ${outputPath}/`);
console.log("Look for a .webm file in that folder.");
