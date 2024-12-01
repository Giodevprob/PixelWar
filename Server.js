const express = require("express");
const WebSocket = require("ws");
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static("."));
app.use(express.json());

// Store canvas data
const canvas = Array(50 * 50).fill("#FFFFFF"); // 50x50 pixels

// REST endpoint to update pixels
app.post("/update", (req, res) => {
    const { x, y, color } = req.body;
    const index = y * 50 + x;
    if (index >= 0 && index < canvas.length) {
        canvas[index] = color;
        res.json({ message: "Pixel updated!" });

        // Notify WebSocket clients
        broadcast({ x, y, color });
    } else {
        res.status(400).json({ message: "Invalid pixel coordinates." });
    }
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ noServer: true });
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Upgrade HTTP server to WebSocket server
const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => wss.emit("connection", ws, request));
});