import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Header } from './components/Header.jsx';
import { Lobby } from './components/Lobby.jsx';
import { GameRoom } from './components/GameRoom.jsx';
import { NicknameModal } from './components/NicknameModal.jsx';
import { CreateRoomModal } from './components/CreateRoomModal.jsx';
import { PasswordPromptModal } from './components/PasswordPromptModal.jsx';
import { sounds } from './audio/soundEffects.js';

export function App() {
  // Estado do usuário
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignora erro
    }
    return null;
  });

  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isMandatoryUserModal, setIsMandatoryUserModal] = useState(!user);

  // Estado da Sala e Conexão
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'X' | 'O' | 'spectator'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [passwordModalRoom, setPasswordModalRoom] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [lastReaction, setLastReaction] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Sala pendente de acesso via URL (?sala=ID ou /sala/ID)
  const pendingRoomIdRef = useRef(null);

  // Inicializa Socket.IO
  useEffect(() => {
    // Detecta URL direta de sala
    const params = new URLSearchParams(window.location.search);
    const paramSala = params.get('sala');
    if (paramSala) {
      pendingRoomIdRef.current = paramSala.toUpperCase();
    } else {
      const pathParts = window.location.pathname.split('/');
      const salaIndex = pathParts.indexOf('sala');
      if (salaIndex >= 0 && pathParts[salaIndex + 1]) {
        pendingRoomIdRef.current = pathParts[salaIndex + 1].toUpperCase();
      }
    }

    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('lobby:subscribe');
    });

    newSocket.on('lobby:rooms', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    newSocket.on('room:updated', (updatedRoom) => {
      setCurrentRoom(updatedRoom);
    });

    newSocket.on('room:chat_message', (msg) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          chatMessages: [...(prev.chatMessages || []), msg]
        };
      });
    });

    newSocket.on('room:reaction_received', (data) => {
      sounds.playReaction();
      setLastReaction(data);
      setTimeout(() => setLastReaction(null), 3500);
    });

    newSocket.on('player:left', ({ role }) => {
      sounds.playAlert();
      showToast(`Um participante saiu da sala (${role || 'visitante'}).`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Quando o usuário e o socket estiverem prontos, verifica se havia link pendente
  useEffect(() => {
    if (socket && user && pendingRoomIdRef.current && !currentRoom) {
      const roomIdToJoin = pendingRoomIdRef.current;
      pendingRoomIdRef.current = null;
      handleJoinRoom(roomIdToJoin);
    }
  }, [socket, user, currentRoom]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Salvar usuário
  const handleSaveUser = (userData) => {
    const fullUser = {
      ...userData,
      id: user?.id || 'usr_' + Math.random().toString(36).substring(2, 9),
      socketId: socket?.id
    };
    setUser(fullUser);
    localStorage.setItem('ttt_user', JSON.stringify(fullUser));
    setIsEditingUser(false);
    setIsMandatoryUserModal(false);
  };

  // Criar sala
  const handleCreateRoom = ({ name, type, password }) => {
    if (!socket || !user) return;
    setIsCreateModalOpen(false);

    socket.emit(
      'room:create',
      { name, type, password, user: { ...user, socketId: socket.id } },
      (res) => {
        if (res.success) {
          setCurrentRoom(res.room);
          setUserRole(res.role);
          socket.emit('lobby:unsubscribe');
          // Atualiza URL no navegador sem recarregar
          window.history.pushState({}, '', `/?sala=${res.roomId}`);
        } else {
          showToast(res.error || 'Erro ao criar a sala.');
        }
      }
    );
  };

  // Entrar em sala
  const handleJoinRoom = (roomId, hasPassword = false, passwordInput = '') => {
    if (!socket) return;
    if (!user) {
      pendingRoomIdRef.current = roomId;
      setIsMandatoryUserModal(true);
      return;
    }

    socket.emit(
      'room:join',
      {
        roomId,
        user: { ...user, socketId: socket.id },
        password: passwordInput
      },
      (res) => {
        if (!res.success) {
          if (res.requiresPassword) {
            setPasswordModalRoom({ id: roomId, name: 'Sala Trancada' });
            setPasswordError(passwordInput ? 'Senha incorreta!' : '');
          } else {
            showToast(res.error || 'Não foi possível entrar na sala.');
          }
          return;
        }

        setPasswordModalRoom(null);
        setPasswordError('');
        setCurrentRoom(res.room);
        setUserRole(res.role);
        socket.emit('lobby:unsubscribe');
        sounds.playJoinAlert();
        window.history.pushState({}, '', `/?sala=${res.room.id}`);
      }
    );
  };

  // Jogar
  const handleMakeMove = (cellIndex) => {
    if (!socket || !currentRoom) return;
    socket.emit('room:move', { roomId: currentRoom.id, cellIndex }, (res) => {
      if (res && !res.success) {
        showToast(res.error || 'Jogada inválida');
      }
    });
  };

  // Revanche
  const handleRematch = () => {
    if (!socket || !currentRoom) return;
    socket.emit('room:rematch', { roomId: currentRoom.id });
  };

  // Renomear sala
  const handleRenameRoom = (newName) => {
    if (!socket || !currentRoom) return;
    socket.emit('room:rename', { roomId: currentRoom.id, newName });
  };

  // Reação emoji
  const handleSendReaction = (emoji, targetRole) => {
    if (!socket || !currentRoom) return;
    socket.emit('room:reaction', {
      roomId: currentRoom.id,
      user,
      emoji,
      targetRole
    });
  };

  // Mensagem no chat
  const handleSendChatMessage = (text) => {
    if (!socket || !currentRoom) return;
    socket.emit('room:chat', {
      roomId: currentRoom.id,
      user,
      text
    });
  };

  // Sair da sala
  const handleLeaveRoom = () => {
    if (!socket || !currentRoom) return;
    socket.emit('room:leave', { roomId: currentRoom.id });
    setCurrentRoom(null);
    setUserRole(null);
    socket.emit('lobby:subscribe');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen flex flex-col p-3 sm:p-6 max-w-6xl mx-auto">
      {/* Toast de Notificação */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 pixel-panel p-3 bg-pixel-yellow text-black font-pixel text-xs border-2 border-black shadow-pixel animate-pop">
          {toastMessage}
        </div>
      )}

      {/* Cabeçalho */}
      <Header
        user={user}
        onEditUser={() => setIsEditingUser(true)}
        inRoom={Boolean(currentRoom)}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Conteúdo Principal: Lobby ou Sala de Jogo */}
      <main className="flex-1">
        {currentRoom ? (
          <GameRoom
            room={currentRoom}
            user={{ ...user, socketId: socket?.id }}
            role={userRole}
            onMakeMove={handleMakeMove}
            onRematch={handleRematch}
            onRenameRoom={handleRenameRoom}
            onSendReaction={handleSendReaction}
            onSendChatMessage={handleSendChatMessage}
            lastReaction={lastReaction}
          />
        ) : (
          <Lobby
            rooms={rooms}
            onCreateRoomClick={() => setIsCreateModalOpen(true)}
            onJoinRoom={(id, hasPassword) => {
              if (hasPassword) {
                setPasswordModalRoom({ id, name: `Sala ${id}` });
              } else {
                handleJoinRoom(id);
              }
            }}
            onRefresh={() => {
              if (socket) socket.emit('lobby:subscribe');
            }}
          />
        )}
      </main>

      {/* Rodapé Retrô */}
      <footer className="mt-8 pt-4 pb-2 text-center text-xs text-gray-400 font-retro border-t border-black/40 flex flex-col items-center gap-1.5">
        <div>Jogo da Velha Retrô Pixel • Multiplayer com WebSockets e Web Audio 8-bit</div>
        <div className="text-[11px] text-gray-500/80 font-retro tracking-wide transition-opacity hover:opacity-100">
          {'feito com carinho para Miguel, Jessica e Laura <3 ❤️'}
        </div>
      </footer>

      {/* Modal de Nickname e Avatar */}
      <NicknameModal
        isOpen={isMandatoryUserModal || isEditingUser}
        initialUser={user}
        mandatory={isMandatoryUserModal}
        onSave={handleSaveUser}
        onClose={() => setIsEditingUser(false)}
      />

      {/* Modal de Criação de Sala */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        defaultHostName={user?.name}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      {/* Modal de Senha para Salas Trancadas */}
      <PasswordPromptModal
        isOpen={Boolean(passwordModalRoom)}
        roomName={passwordModalRoom?.name || 'Sala'}
        errorMessage={passwordError}
        onClose={() => {
          setPasswordModalRoom(null);
          setPasswordError('');
        }}
        onSubmit={(pwd) => {
          if (passwordModalRoom) {
            handleJoinRoom(passwordModalRoom.id, true, pwd);
          }
        }}
      />
    </div>
  );
}
