const { spawn } = require("child_process");
const path = require("path");

const ffmpegPath = path.join(__dirname, "ff3.exe");
const input = path.join(__dirname, "demo-video", "fixit-demo.webm");
const output = path.join(__dirname, "demo-video", "fixit-demo.mp4");

const args = ["-y", "-i", input, "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output];

const proc = spawn(ffmpegPath, args, { stdio: "inherit" });

proc.on("close", (code) => {
  if (code === 0) {
    const fs = require("fs");
    const stat = fs.statSync(output);
    console.log(`\nMP4 ready: ${output} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
  } else {
    console.error("ffmpeg exited with code", code);
  }
});
