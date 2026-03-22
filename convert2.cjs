const { spawn } = require("child_process");
const path = require("path");

const ffmpegPath = path.join(__dirname, "node_modules", "ffmpeg-static", "ffmpeg.exe");
const input = path.join(__dirname, "demo-video", "fixit-demo.webm");
const output = path.join(__dirname, "demo-video", "fixit-demo.mp4");

console.log("ffmpeg:", ffmpegPath);
console.log("input:", input);
console.log("output:", output);

const args = ["-y", "-i", input, "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output];

const proc = spawn(ffmpegPath, args, { stdio: "inherit" });

proc.on("close", (code) => {
  if (code === 0) {
    const fs = require("fs");
    const stat = fs.statSync(output);
    console.log(`\nMP4 saved: ${output} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
  } else {
    console.error("ffmpeg exited with code", code);
  }
});
