// using 4 libraries
// 1. express
// 2. https
// 3. socket.io
// 4. quickrtc-server

import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
// Step 1: Import QuickRTCServer
import { QuickRTCServer } from "quickrtc-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Generate self-signed certs if they don't exist
const certsDir = path.join(__dirname, "certs");
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

// Create HTTPS server
const server = https.createServer(
  {
    key: fs.readFileSync(path.join(certsDir, "key.pem")),
    cert: fs.readFileSync(path.join(certsDir, "cert.pem")),
  },
  app
);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});

// Step 2: Create and start QuickRTC server
const quickrtc = new QuickRTCServer({
  socketServer: io,
});

await quickrtc.start();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});
