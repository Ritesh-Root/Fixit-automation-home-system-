const { execSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");
const path = require("path");

const input = path.join(__dirname, "demo-video", "fixit-demo.webm");
const output = path.join(__dirname, "demo-video", "fixit-demo.mp4");

console.log("Converting webm → mp4...");
console.log("ffmpeg:", ffmpeg);

const cmd = `"${ffmpeg}" -y -i "${input}" -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -movflags +faststart "${output}"`;
console.log("Running:", cmd);

try {
  execSync(cmd, { stdio: "inherit" });
  console.log("\nDone! MP4 saved to:", output);
} catch (e) {
  console.error("Conversion failed:", e.message);
}
