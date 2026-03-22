const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const outputDir = path.join(__dirname, "demo-video");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const CHROME_PATH =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  console.log("Launching Chrome...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: outputDir,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/demo ...");
  await page.goto("http://localhost:3000/demo", { waitUntil: "networkidle" });

  console.log("Recording demo playthrough (~28 seconds)...");
  await page.waitForTimeout(28000);

  // Try to wait for the done badge
  try {
    await page.waitForSelector("text=Demo complete", { timeout: 3000 });
    console.log("Caught 'Demo complete' badge.");
    await page.waitForTimeout(2000);
  } catch (_) {}

  console.log("Stopping recording and saving video...");
  await context.close();
  await browser.close();

  const files = fs.readdirSync(outputDir);
  const video = files.find((f) => f.endsWith(".webm"));
  if (video) {
    console.log(`\nVideo saved to:\n  ${path.join(outputDir, video)}`);
  } else {
    console.log("No .webm found in", outputDir);
    console.log("Files:", files);
  }
})();
