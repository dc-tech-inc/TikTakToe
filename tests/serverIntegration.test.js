import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { RoomManager } from '../server/roomManager.js';

describe('Integração de Rede e WebSockets (Socket.IO + Servidor)', () => {
  let server, ioServer, port;
  let clientA, clientB;
  let roomManager;

  beforeAll(async () => {
    const app = express();
    server = http.createServer(app);
    ioServer = new Server(server, { cors: { origin: '*' } });
    roomManager = new RoomManager();

    const socketRoomMap = new Map();

    ioServer.on('connection', (socket) => {
      socket.on('lobby:subscribe', () => {
        socket.join('lobby');
        socket.emit('lobby:rooms', roomManager.listPublicRooms());
      });

      socket.on('room:create', ({ name, type, password, user }, cb) => {
        const room = roomManager.createRoom({
          name,
          type,
          password,
          hostUser: user,
          socketId: socket.id
        });
        socket.join(room.id);
        socketRoomMap.set(socket.id, room.id);
        ioServer.to('lobby').emit('lobby:rooms', roomManager.listPublicRooms());
        cb({ success: true, roomId: room.id, role: 'X', room: roomManager.sanitizeRoom(room) });
      });

      socket.on('room:join', ({ roomId, user, password }, cb) => {
        const res = roomManager.joinRoom(roomId, user, socket.id, password);
        if (!res.success) return cb(res);
        socket.join(res.room.id);
        socketRoomMap.set(socket.id, res.room.id);
        ioServer.to(res.room.id).emit('room:updated', res.room);
        ioServer.to('lobby').emit('lobby:rooms', roomManager.listPublicRooms());
        cb({ success: true, role: res.role, room: res.room });
      });

      socket.on('room:move', ({ roomId, cellIndex }, cb) => {
        const res = roomManager.handleMove(roomId, socket.id, cellIndex);
        if (!res.success) {
          if (typeof cb === 'function') cb(res);
          return;
        }
        ioServer.to(roomId).emit('room:updated', res.room);
        if (typeof cb === 'function') cb({ success: true });
      });

      socket.on('room:rematch', ({ roomId }, cb) => {
        const res = roomManager.handleRematch(roomId, socket.id);
        if (!res.success) return cb(res);
        ioServer.to(roomId).emit('room:updated', res.room);
        cb({ success: true, restarted: res.restarted });
      });
    });

    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (clientA) clientA.disconnect();
    if (clientB) clientB.disconnect();
    if (ioServer) ioServer.close();
    if (server) server.close();
  });

  it('deve sincronizar criação de sala, entrada, jogadas e vitória entre dois jogadores', async () => {
    clientA = Client(`http://localhost:${port}`);
    clientB = Client(`http://localhost:${port}`);

    await Promise.all([
      new Promise((res) => clientA.on('connect', res)),
      new Promise((res) => clientB.on('connect', res))
    ]);

    // Client B ouve o lobby
    clientB.emit('lobby:subscribe');

    // Client A cria a sala
    let createdRoomId = null;
    await new Promise((res) => {
      clientA.emit(
        'room:create',
        {
          name: 'Arena dos Campeões',
          type: 'public',
          user: { name: 'Gamer 1', avatar: 'cat' }
        },
        (response) => {
          expect(response.success).toBe(true);
          expect(response.role).toBe('X');
          createdRoomId = response.roomId;
          res();
        }
      );
    });

    expect(createdRoomId).toBeDefined();

    // Client B entra na sala
    await new Promise((res) => {
      clientB.emit(
        'room:join',
        {
          roomId: createdRoomId,
          user: { name: 'Gamer 2', avatar: 'frog' }
        },
        (response) => {
          expect(response.success).toBe(true);
          expect(response.role).toBe('O');
          expect(response.room.gameState.status).toBe('playing');
          res();
        }
      );
    });

    // Client A joga na casa 0
    await new Promise((res) => {
      clientA.emit('room:move', { roomId: createdRoomId, cellIndex: 0 }, (response) => {
        expect(response.success).toBe(true);
        res();
      });
    });

    // Client B joga na casa 3
    await new Promise((res) => {
      clientB.emit('room:move', { roomId: createdRoomId, cellIndex: 3 }, (response) => {
        expect(response.success).toBe(true);
        res();
      });
    });

    // Client A joga na casa 1
    await new Promise((res) => {
      clientA.emit('room:move', { roomId: createdRoomId, cellIndex: 1 }, (response) => {
        expect(response.success).toBe(true);
        res();
      });
    });

    // Client B joga na casa 4
    await new Promise((res) => {
      clientB.emit('room:move', { roomId: createdRoomId, cellIndex: 4 }, (response) => {
        expect(response.success).toBe(true);
        res();
      });
    });

    // Client A joga na casa 2 (vence a linha 0, 1, 2)
    const winPromise = new Promise((res) => {
      clientB.on('room:updated', (updated) => {
        if (updated.gameState.winner === 'X') {
          expect(updated.gameState.status).toBe('finished');
          expect(updated.gameState.winningLine).toEqual([0, 1, 2]);
          expect(updated.scores.X).toBe(1);
          res();
        }
      });
    });

    clientA.emit('room:move', { roomId: createdRoomId, cellIndex: 2 });
    await winPromise;
  });
});
