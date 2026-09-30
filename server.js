const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Rooms state storage
const rooms = {};

io.on('connection', (socket) => {
  // Join Room
  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { currentTrack: null, isPlaying: false, seekTime: 0 };
    }
    // Naye user ko current playback status send karein
    socket.emit('sync-state', rooms[roomId]);
  });

  // Jab koi gaana change, play ya pause kare
  socket.on('playback-action', ({ roomId, action, data }) => {
    if (rooms[roomId]) {
      rooms[roomId] = { ...rooms[roomId], ...data };
      // Doosre phone ko turant notify karein
      socket.to(roomId).emit('playback-update', { action, data });
    }
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sync server live on port ${PORT}`));
