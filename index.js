import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import ResumeRoutes from "./routes/ResumeRoutes.js";
import { Server } from "socket.io";
import { createServer } from "http";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from tmp directory in /tmp
app.use("/files/recordings", express.static("/tmp/recordings"));
app.use("/files/images", express.static("/tmp/images"));
app.use("/files/resumes", express.static("/tmp/resumes"));

app.get("/", (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Welcome to PocketCV"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/resume", ResumeRoutes);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    try {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("online-users", {
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("signout", (id) => {
    try {
      onlineUsers.delete(id);
      socket.broadcast.emit("online-users", {
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    try {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("incoming-voice-call", {
          from: data.from,
          roomId: data.roomId,
          callType: data.callType,
        });
      } else {
        const senderSocket = onlineUsers.get(data.from);
        socket.to(senderSocket).emit("voice-call-offline");
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("reject-voice-call", (data) => {
    try {
      const sendUserSocket = onlineUsers.get(data.from);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("voice-call-rejected");
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("outgoing-video-call", (data) => {
    try {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("incoming-video-call", {
          from: data.from,
          roomId: data.roomId,
          callType: data.callType,
        });
      } else {
        const senderSocket = onlineUsers.get(data.from);
        socket.to(senderSocket).emit("video-call-offline");
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("accept-incoming-call", ({ id }) => {
    try {
      const sendUserSocket = onlineUsers.get(id);
      socket.to(sendUserSocket).emit("accept-call");
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("reject-video-call", (data) => {
    try {
      const sendUserSocket = onlineUsers.get(data.from);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("video-call-rejected");
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("send-msg", (data) => {
    try {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-receive", {
          from: data.from,
          message: data.message,
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("mark-read", ({ id, recieverId }) => {
    try {
      const sendUserSocket = onlineUsers.get(id);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("mark-read-recieve", { id, recieverId });
      }
    } catch (error) {
      console.error(error);
    }
  });
});

const port = process.env.PORT || 3005;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
