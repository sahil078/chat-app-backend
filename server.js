import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Add any REST API routes
app.get("/", (req, res) => {
  res.send("Backend server running");
});

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`${username} joined room ${roomId}`);

    const joinMessage = {
      id: Date.now().toString(),
      sender: "System",
      text: `${username} joined the room`,
      timestamp: new Date().toISOString(),
    };

    io.to(roomId).emit("room-message", joinMessage);
  });

  socket.on("room-message", ({ roomId, msg }) => {
    io.to(roomId).emit("room-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
httpServer.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
