let io = null;

function initSockets(httpServer) {
  const { Server } = require("socket.io");
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN, credentials: true }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { ok: true });
  });

  return io;
}

function emitEvent(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

module.exports = { initSockets, emitEvent };
