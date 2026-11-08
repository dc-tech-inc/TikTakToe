import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../server/roomManager.js';

describe('Gerenciador de Salas (RoomManager)', () => {
  let manager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  it('deve criar uma sala pública com as configurações corretas', () => {
    const room = manager.createRoom({
      name: 'Sala do Pedro',
      type: 'public',
      hostUser: { id: 'u1', name: 'Pedro', avatar: 'frog' },
      socketId: 'sock-1'
    });

    expect(room.id).toBeDefined();
    expect(room.name).toBe('Sala do Pedro');
    expect(room.type).toBe('public');
    expect(room.players.X.name).toBe('Pedro');
    expect(room.players.O).toBeNull();
    expect(room.gameState.status).toBe('waiting');
  });

  it('deve listar salas públicas e ocultar salas privadas no lobby', () => {
    manager.createRoom({
      name: 'Pública 1',
      type: 'public',
      hostUser: { name: 'Player 1' },
      socketId: 'sock-1'
    });

    manager.createRoom({
      name: 'Privada Secreta',
      type: 'private',
      hostUser: { name: 'Player 2' },
      socketId: 'sock-2'
    });

    manager.createRoom({
      name: 'Com Senha',
      type: 'password',
      password: '123',
      hostUser: { name: 'Player 3' },
      socketId: 'sock-3'
    });

    const list = manager.listPublicRooms();
    expect(list.length).toBe(2);
    expect(list.some(r => r.name === 'Privada Secreta')).toBe(false);
    expect(list.some(r => r.name === 'Pública 1')).toBe(true);
    expect(list.some(r => r.name === 'Com Senha')).toBe(true);
  });

  it('deve exigir e validar senha em sala protegida', () => {
    const room = manager.createRoom({
      name: 'Sala Trancada',
      type: 'password',
      password: 'senha-pixel-99',
      hostUser: { name: 'Ana' },
      socketId: 'sock-ana'
    });

    // Tentativa com senha errada
    const failJoin = manager.joinRoom(room.id, { name: 'Bob' }, 'sock-bob', 'senha-errada');
    expect(failJoin.success).toBe(false);
    expect(failJoin.error).toBe('Senha da sala incorreta');

    // Tentativa com senha certa
    const okJoin = manager.joinRoom(room.id, { name: 'Bob' }, 'sock-bob', 'senha-pixel-99');
    expect(okJoin.success).toBe(true);
    expect(okJoin.role).toBe('O');
  });

  it('deve permitir que terceiro jogador entre como espectador', () => {
    const room = manager.createRoom({
      name: 'Duelo',
      type: 'public',
      hostUser: { name: 'Jogador 1' },
      socketId: 's1'
    });

    const join2 = manager.joinRoom(room.id, { name: 'Jogador 2' }, 's2');
    expect(join2.role).toBe('O');
    expect(room.gameState.status).toBe('playing');

    const join3 = manager.joinRoom(room.id, { name: 'Espectador 1' }, 's3');
    expect(join3.role).toBe('spectator');
    expect(room.spectators.length).toBe(1);
    expect(room.spectators[0].name).toBe('Espectador 1');
  });

  it('não deve permitir que espectadores façam jogadas', () => {
    const room = manager.createRoom({
      name: 'Duelo',
      type: 'public',
      hostUser: { name: 'J1' },
      socketId: 's1'
    });
    manager.joinRoom(room.id, { name: 'J2' }, 's2');
    manager.joinRoom(room.id, { name: 'Esp' }, 's3');

    const moveResult = manager.handleMove(room.id, 's3', 0);
    expect(moveResult.success).toBe(false);
    expect(moveResult.error).toBe('Apenas os jogadores ativos podem jogar');
  });

  it('deve atualizar o placar quando houver vitória', () => {
    const room = manager.createRoom({
      name: 'Partida',
      type: 'public',
      hostUser: { name: 'J1' },
      socketId: 's1'
    });
    manager.joinRoom(room.id, { name: 'J2' }, 's2');

    // J1 joga 0
    manager.handleMove(room.id, 's1', 0);
    // J2 joga 3
    manager.handleMove(room.id, 's2', 3);
    // J1 joga 1
    manager.handleMove(room.id, 's1', 1);
    // J2 joga 4
    manager.handleMove(room.id, 's2', 4);
    // J1 joga 2 (vence na linha [0, 1, 2])
    const finalMove = manager.handleMove(room.id, 's1', 2);

    expect(finalMove.success).toBe(true);
    expect(finalMove.gameState.winner).toBe('X');
    expect(room.scores.X).toBe(1);
    expect(room.scores.total).toBe(1);
  });

  it('deve gerenciar revanche quando ambos os jogadores solicitarem', () => {
    const room = manager.createRoom({
      name: 'Partida',
      type: 'public',
      hostUser: { name: 'J1' },
      socketId: 's1'
    });
    manager.joinRoom(room.id, { name: 'J2' }, 's2');

    // Finaliza o jogo
    manager.handleMove(room.id, 's1', 0);
    manager.handleMove(room.id, 's2', 3);
    manager.handleMove(room.id, 's1', 1);
    manager.handleMove(room.id, 's2', 4);
    manager.handleMove(room.id, 's1', 2);

    // Jogador 1 pede revanche
    const req1 = manager.handleRematch(room.id, 's1');
    expect(req1.restarted).toBe(false);

    // Jogador 2 pede revanche
    const req2 = manager.handleRematch(room.id, 's2');
    expect(req2.restarted).toBe(true);
    expect(room.gameState.status).toBe('playing');
    expect(room.gameState.board).toEqual(Array(9).fill(null));
  });

  it('deve promover espectador caso um jogador ativo saia', () => {
    const room = manager.createRoom({
      name: 'Sala Lotada',
      type: 'public',
      hostUser: { name: 'J1' },
      socketId: 's1'
    });
    manager.joinRoom(room.id, { name: 'J2' }, 's2');
    manager.joinRoom(room.id, { name: 'Esp' }, 's3');

    // J2 sai da sala
    const leaveResult = manager.leaveRoom(room.id, 's2');
    expect(leaveResult.roomDeleted).toBe(false);
    expect(room.players.O.name).toBe('Esp');
    expect(room.spectators.length).toBe(0);
  });

  it('deve permitir apenas ao anfitrião mudar o nome da sala', () => {
    const room = manager.createRoom({
      name: 'Nome Antigo',
      type: 'public',
      hostUser: { name: 'J1' },
      socketId: 's1'
    });
    manager.joinRoom(room.id, { name: 'J2' }, 's2');

    // J2 tenta mudar nome
    const renameFail = manager.updateRoomName(room.id, 's2', 'Novo Nome');
    expect(renameFail.success).toBe(false);

    // J1 muda nome
    const renameOk = manager.updateRoomName(room.id, 's1', 'Novo Nome do J1');
    expect(renameOk.success).toBe(true);
    expect(room.name).toBe('Novo Nome do J1');
  });

  it('deve remover a sala se todos os participantes saírem', () => {
    const room = manager.createRoom({
      name: 'Sala Passageira',
      type: 'public',
      hostUser: { name: 'Solitário' },
      socketId: 's-solo'
    });

    const leave = manager.leaveRoom(room.id, 's-solo');
    expect(leave.roomDeleted).toBe(true);
    expect(manager.getRoom(room.id)).toBeNull();
  });
});
