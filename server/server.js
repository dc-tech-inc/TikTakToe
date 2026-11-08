import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { RoomManager } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configuração do Socket.IO com suporte a CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();

// Mapeamento de socketId -> roomId para desconexões limpas
const socketRoomMap = new Map();

// API REST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: roomManager.listPublicRooms() });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = roomManager.getRoom(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  res.json({ room: roomManager.sanitizeRoom(room) });
});

// Eventos do Socket.IO
io.on('connection', (socket) => {
  // Entra no canal do lobby para atualizações de salas
  socket.on('lobby:subscribe', () => {
    socket.join('lobby');
    socket.emit('lobby:rooms', roomManager.listPublicRooms());
  });

  socket.on('lobby:unsubscribe', () => {
    socket.leave('lobby');
  });

  // Criar sala
  socket.on('room:create', ({ name, type, password, user }, callback) => {
    try {
      const room = roomManager.createRoom({
        name,
        type,
        password,
        hostUser: user || { name: 'Anfitrião', avatar: 'cat' },
        socketId: socket.id
      });

      socket.join(room.id);
      socketRoomMap.set(socket.id, room.id);

      io.to('lobby').emit('lobby:rooms', roomManager.listPublicRooms());

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId: room.id,
          role: 'X',
          room: roomManager.sanitizeRoom(room)
        });
      }
    } catch (err) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Entrar na sala
  socket.on('room:join', ({ roomId, user, password }, callback) => {
    try {
      const result = roomManager.joinRoom(
        roomId,
        user || { name: 'Visitante', avatar: 'cat' },
        socket.id,
        password
      );

      if (!result.success) {
        if (typeof callback === 'function') {
          callback(result);
        }
        return;
      }

      socket.join(result.room.id);
      socketRoomMap.set(socket.id, result.room.id);

      // Notifica todos na sala da atualização
      io.to(result.room.id).emit('room:updated', result.room);
      // Atualiza o lobby com contagem de jogadores
      io.to('lobby').emit('lobby:rooms', roomManager.listPublicRooms());

      if (typeof callback === 'function') {
        callback({
          success: true,
          role: result.role,
          room: result.room
        });
      }
    } catch (err) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Fazer jogada
  socket.on('room:move', ({ roomId, cellIndex }, callback) => {
    const result = roomManager.handleMove(roomId, socket.id, cellIndex);
    if (!result.success) {
      if (typeof callback === 'function') callback(result);
      return;
    }

    io.to(roomId).emit('room:updated', result.room);
    io.to(roomId).emit('game:move_made', {
      cellIndex,
      symbol: result.gameState.board[cellIndex],
      currentTurn: result.gameState.currentTurn,
      winner: result.gameState.winner,
      winningLine: result.gameState.winningLine
    });

    if (result.gameState.status === 'finished') {
      io.to(roomId).emit('game:finished', {
        winner: result.gameState.winner,
        winningLine: result.gameState.winningLine,
        scores: result.room.scores
      });
    }

    if (typeof callback === 'function') callback({ success: true });
  });

  // Pedir revanche
  socket.on('room:rematch', ({ roomId }, callback) => {
    const result = roomManager.handleRematch(roomId, socket.id);
    if (!result.success) {
      if (typeof callback === 'function') callback(result);
      return;
    }

    io.to(roomId).emit('room:updated', result.room);

    if (result.restarted) {
      io.to(roomId).emit('game:restarted', result.room);
    } else {
      io.to(roomId).emit('rematch:voted', {
        votesCount: result.votesCount,
        requestedBy: socket.id
      });
    }

    if (typeof callback === 'function') callback({ success: true, restarted: result.restarted });
  });

  // Renomear sala
  socket.on('room:rename', ({ roomId, newName }, callback) => {
    const result = roomManager.updateRoomName(roomId, socket.id, newName);
    if (!result.success) {
      if (typeof callback === 'function') callback(result);
      return;
    }

    io.to(roomId).emit('room:updated', result.room);
    io.to('lobby').emit('lobby:rooms', roomManager.listPublicRooms());

    if (typeof callback === 'function') callback({ success: true });
  });

  // Chat na sala
  socket.on('room:chat', ({ roomId, user, text }) => {
    const msg = roomManager.addChatMessage(roomId, user, text);
    if (msg) {
      io.to(roomId).emit('room:chat_message', msg);
    }
  });

  // Reações / Emojis dinâmicos
  socket.on('room:reaction', ({ roomId, user, emoji, targetRole }) => {
    io.to(roomId).emit('room:reaction_received', {
      user,
      emoji,
      targetRole,
      timestamp: Date.now()
    });
  });

  // Sair da sala explicitamente
  socket.on('room:leave', ({ roomId }, callback) => {
    leaveCurrentRoom(socket, roomId);
    if (typeof callback === 'function') callback({ success: true });
  });

  // Desconexão
  socket.on('disconnect', () => {
    const roomId = socketRoomMap.get(socket.id);
    if (roomId) {
      leaveCurrentRoom(socket, roomId);
    }
  });
});

function leaveCurrentRoom(socket, roomId) {
  socketRoomMap.delete(socket.id);
  socket.leave(roomId);

  const leaveResult = roomManager.leaveRoom(roomId, socket.id);
  if (!leaveResult) return;

  if (leaveResult.roomDeleted) {
    io.to('lobby').emit('lobby:rooms', roomManager.listPublicRooms());
  } else {
    io.to(roomId).emit('room:updated', leaveResult.room);
    io.to(roomId).emit('player:left', { role: leaveResult.roleRemoved });
    io.to('lobby').emit('lobby:rooms', roomManager.listPublicRooms());
  }
}

// Servir frontend compilado em produção (Vite dist) e pasta public
const distPath = path.join(__dirname, '..', 'dist');
const publicPath = path.join(__dirname, '..', 'public');

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Pixel Tic-Tac-Toe] Servidor rodando na porta ${PORT}`);
  console.log(`[Pixel Tic-Tac-Toe] Acesse http://localhost:${PORT}`);
});
