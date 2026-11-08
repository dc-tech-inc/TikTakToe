/**
 * Gerenciador de Salas de Jogo da Velha Multiplayer
 */
import {
  createInitialGameState,
  makeMove,
  resetBoard
} from './gameLogic.js';

export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  /**
   * Gera um ID legível e amigável para a sala (ex: pikachu-7, pixel-88 ou 6 dígitos)
   */
  generateRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Garante que é único
    if (this.rooms.has(id)) {
      return this.generateRoomId();
    }
    return id;
  }

  /**
   * Cria uma nova sala
   */
  createRoom({ name, type = 'public', password = '', hostUser, socketId }) {
    const id = this.generateRoomId();
    const roomName = (name && name.trim()) ? name.trim() : `Sala do ${hostUser.name || 'Pixel'}`;
    const cleanType = ['public', 'private', 'password'].includes(type) ? type : 'public';

    const room = {
      id,
      name: roomName,
      type: cleanType,
      password: cleanType === 'password' ? String(password || '').trim() : '',
      createdAt: Date.now(),
      hostSocketId: socketId,
      players: {
        X: {
          id: hostUser.id || socketId,
          socketId,
          name: hostUser.name || 'Jogador 1',
          avatar: hostUser.avatar || 'cat'
        },
        O: null
      },
      spectators: [],
      scores: {
        X: 0,
        O: 0,
        draws: 0,
        total: 0
      },
      gameState: createInitialGameState('X'),
      rematchVotes: new Set(),
      chatMessages: []
    };

    this.rooms.set(id, room);
    return room;
  }

  /**
   * Busca uma sala por ID
   */
  getRoom(roomId) {
    if (!roomId) return null;
    return this.rooms.get(roomId.toUpperCase()) || this.rooms.get(roomId) || null;
  }

  /**
   * Entra em uma sala existente
   */
  joinRoom(roomId, user, socketId, inputPassword = '') {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Sala não encontrada' };
    }

    // Se for sala com senha, valida senha
    if (room.type === 'password') {
      const isAlreadyInside =
        (room.players.X && room.players.X.socketId === socketId) ||
        (room.players.O && room.players.O.socketId === socketId) ||
        room.spectators.some(s => s.socketId === socketId);

      if (!isAlreadyInside && String(inputPassword || '').trim() !== room.password) {
        return { success: false, error: 'Senha da sala incorreta', requiresPassword: true };
      }
    }

    const userData = {
      id: user.id || socketId,
      socketId,
      name: user.name || 'Visitante',
      avatar: user.avatar || 'cat'
    };

    // Caso o mesmo socket já esteja na sala
    if (room.players.X && room.players.X.socketId === socketId) {
      room.players.X.name = userData.name;
      room.players.X.avatar = userData.avatar;
      return { success: true, room: this.sanitizeRoom(room), role: 'X' };
    }

    if (room.players.O && room.players.O.socketId === socketId) {
      room.players.O.name = userData.name;
      room.players.O.avatar = userData.avatar;
      return { success: true, room: this.sanitizeRoom(room), role: 'O' };
    }

    // Se vaga O estiver vazia, assume como Jogador O
    if (!room.players.O) {
      room.players.O = userData;
      // Começa o jogo se ambos os jogadores estiverem presentes
      if (room.players.X && room.players.O) {
        room.gameState.status = 'playing';
      }
      return { success: true, room: this.sanitizeRoom(room), role: 'O' };
    }

    // Se vaga X estiver vazia (caso o host tenha saído antes)
    if (!room.players.X) {
      room.players.X = userData;
      if (room.players.X && room.players.O) {
        room.gameState.status = 'playing';
      }
      return { success: true, room: this.sanitizeRoom(room), role: 'X' };
    }

    // Caso contrário, entra como espectador
    const existingSpecIndex = room.spectators.findIndex(s => s.socketId === socketId);
    if (existingSpecIndex >= 0) {
      room.spectators[existingSpecIndex] = userData;
    } else {
      room.spectators.push(userData);
    }

    return { success: true, room: this.sanitizeRoom(room), role: 'spectator' };
  }

  /**
   * Remove jogador ou espectador de uma sala
   */
  leaveRoom(roomId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    let roleRemoved = null;

    if (room.players.X && room.players.X.socketId === socketId) {
      roleRemoved = 'X';
      room.players.X = null;
    } else if (room.players.O && room.players.O.socketId === socketId) {
      roleRemoved = 'O';
      room.players.O = null;
    } else {
      const specIndex = room.spectators.findIndex(s => s.socketId === socketId);
      if (specIndex >= 0) {
        roleRemoved = 'spectator';
        room.spectators.splice(specIndex, 1);
      }
    }

    // Se um dos jogadores saiu enquanto a partida estava rolando
    if (roleRemoved === 'X' || roleRemoved === 'O') {
      room.rematchVotes.delete(socketId);
      
      // Se ainda houver espectadores, promove o primeiro espectador para a vaga aberta
      if (room.spectators.length > 0) {
        const promoted = room.spectators.shift();
        if (roleRemoved === 'X') {
          room.players.X = promoted;
        } else {
          room.players.O = promoted;
        }
        // Reinicia o tabuleiro para novo jogo com o novo jogador
        room.gameState = createInitialGameState('X');
        if (room.players.X && room.players.O) {
          room.gameState.status = 'playing';
        }
      } else {
        // Pausa a partida aguardando novo jogador
        room.gameState.status = 'waiting';
        room.gameState.board = Array(9).fill(null);
        room.gameState.winner = null;
        room.gameState.winningLine = null;
      }

      // Se o host era quem saiu, transfere host
      if (room.hostSocketId === socketId) {
        if (room.players.X) {
          room.hostSocketId = room.players.X.socketId;
        } else if (room.players.O) {
          room.hostSocketId = room.players.O.socketId;
        } else if (room.spectators.length > 0) {
          room.hostSocketId = room.spectators[0].socketId;
        }
      }
    }

    // Se não sobrar ninguém na sala, remove-a
    const hasAnyone = room.players.X || room.players.O || room.spectators.length > 0;
    if (!hasAnyone) {
      this.rooms.delete(room.id);
      return { roomDeleted: true, roomId: room.id };
    }

    return { roomDeleted: false, room: this.sanitizeRoom(room), roleRemoved };
  }

  /**
   * Processa uma jogada
   */
  handleMove(roomId, socketId, cellIndex) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Sala não encontrada' };
    }

    let playerSymbol = null;
    if (room.players.X && room.players.X.socketId === socketId) {
      playerSymbol = 'X';
    } else if (room.players.O && room.players.O.socketId === socketId) {
      playerSymbol = 'O';
    } else {
      return { success: false, error: 'Apenas os jogadores ativos podem jogar' };
    }

    const moveResult = makeMove(room.gameState, cellIndex, playerSymbol);
    if (!moveResult.success) {
      return moveResult;
    }

    room.gameState = moveResult.gameState;

    // Se o jogo acabou, atualiza placar
    if (room.gameState.status === 'finished') {
      room.scores.total += 1;
      if (room.gameState.winner === 'X') {
        room.scores.X += 1;
      } else if (room.gameState.winner === 'O') {
        room.scores.O += 1;
      } else if (room.gameState.winner === 'draw') {
        room.scores.draws += 1;
      }
    }

    return {
      success: true,
      room: this.sanitizeRoom(room),
      gameState: room.gameState
    };
  }

  /**
   * Solicita revanche / nova partida
   */
  handleRematch(roomId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Sala não encontrada' };
    }

    const isPlayer =
      (room.players.X && room.players.X.socketId === socketId) ||
      (room.players.O && room.players.O.socketId === socketId);

    if (!isPlayer) {
      return { success: false, error: 'Apenas os jogadores ativos podem pedir revanche' };
    }

    room.rematchVotes.add(socketId);

    const activePlayersCount = (room.players.X ? 1 : 0) + (room.players.O ? 1 : 0);

    // Se ambos os jogadores votaram (ou se só tem 1 jogador presente)
    if (room.rematchVotes.size >= activePlayersCount) {
      room.gameState = resetBoard(room.gameState, true);
      room.rematchVotes.clear();

      return {
        success: true,
        restarted: true,
        room: this.sanitizeRoom(room)
      };
    }

    return {
      success: true,
      restarted: false,
      votesCount: room.rematchVotes.size,
      requestedBy: socketId,
      room: this.sanitizeRoom(room)
    };
  }

  /**
   * Altera o nome da sala (apenas host)
   */
  updateRoomName(roomId, socketId, newName) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Sala não encontrada' };
    }

    if (room.hostSocketId !== socketId) {
      return { success: false, error: 'Apenas o anfitrião pode mudar o nome da sala' };
    }

    const trimmed = String(newName || '').trim();
    if (!trimmed) {
      return { success: false, error: 'O nome da sala não pode ficar vazio' };
    }

    room.name = trimmed.slice(0, 30);
    return { success: true, room: this.sanitizeRoom(room) };
  }

  /**
   * Adiciona mensagem no chat da sala
   */
  addChatMessage(roomId, user, text) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const message = {
      id: Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userName: user.name || 'Jogador',
      avatar: user.avatar || 'cat',
      text: String(text || '').slice(0, 100),
      timestamp: Date.now()
    };

    room.chatMessages.push(message);
    if (room.chatMessages.length > 40) {
      room.chatMessages.shift();
    }

    return message;
  }

  /**
   * Lista as salas públicas para o lobby
   */
  listPublicRooms() {
    const result = [];
    for (const room of this.rooms.values()) {
      if (room.type === 'public' || room.type === 'password') {
        const playersCount = (room.players.X ? 1 : 0) + (room.players.O ? 1 : 0);
        result.push({
          id: room.id,
          name: room.name,
          hostName: room.players.X?.name || room.players.O?.name || 'Anfitrião',
          playersCount,
          spectatorsCount: room.spectators.length,
          status: room.gameState.status === 'playing' ? 'playing' : 'waiting',
          type: room.type,
          hasPassword: room.type === 'password'
        });
      }
    }
    // Ordena mais recentes primeiro
    return result.sort((a, b) => b.playersCount - a.playersCount);
  }

  /**
   * Remove dados sensíveis (como senha em texto) antes de enviar para o cliente
   */
  sanitizeRoom(room) {
    const playersCount = (room.players.X ? 1 : 0) + (room.players.O ? 1 : 0);
    return {
      id: room.id,
      name: room.name,
      type: room.type,
      hasPassword: room.type === 'password',
      hostSocketId: room.hostSocketId,
      players: room.players,
      spectators: room.spectators,
      scores: room.scores,
      gameState: room.gameState,
      playersCount,
      rematchVotes: Array.from(room.rematchVotes),
      chatMessages: room.chatMessages.slice(-25)
    };
  }
}
