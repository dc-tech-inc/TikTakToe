import React, { useState } from 'react';
import { sounds } from '../audio/soundEffects.js';
import { Globe, Link2, Lock, PlusCircle, X } from 'lucide-react';

export function CreateRoomModal({ isOpen, onClose, onCreate, defaultHostName }) {
  const [roomName, setRoomName] = useState(`Sala do ${defaultHostName || 'Jogador'}`);
  const [roomType, setRoomType] = useState('public');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = roomName.trim();
    if (!cleanName) {
      sounds.playDraw();
      setError('Dê um nome para a sua sala!');
      return;
    }

    if (roomType === 'password' && !password.trim()) {
      sounds.playDraw();
      setError('Por favor, defina uma senha ou PIN para trancar a sala!');
      return;
    }

    sounds.playJoinAlert();
    onCreate({
      name: cleanName,
      type: roomType,
      password: roomType === 'password' ? password.trim() : ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop">
      <div className="pixel-panel w-full max-w-md bg-pixel-panel text-white p-6 relative">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="font-pixel text-base text-pixel-yellow mb-4 flex items-center gap-2">
          <PlusCircle className="text-pixel-green" size={20} />
          CRIAR NOVA SALA
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Sala */}
          <div>
            <label className="block text-xs font-pixel text-pixel-mint mb-1.5">
              NOME DA SALA:
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setError('');
              }}
              maxLength={30}
              placeholder="Ex: Arena dos Campeões"
              className="pixel-input w-full text-sm text-yellow-300 font-bold"
              autoFocus
            />
          </div>

          {/* Tipo de Sala */}
          <div>
            <label className="block text-xs font-pixel text-pixel-mint mb-2">
              TIPO DE ACESSO:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRoomType('public');
                }}
                className={`p-3 border-2 text-center flex flex-col items-center gap-1 transition-all ${
                  roomType === 'public'
                    ? 'border-pixel-yellow bg-pixel-border/80 shadow-[2px_2px_0px_#000]'
                    : 'border-black bg-pixel-dark/40 hover:bg-pixel-dark/80'
                }`}
              >
                <Globe size={20} className="text-pixel-mint" />
                <span className="font-pixel text-[10px] text-white">PÚBLICA</span>
                <span className="text-[8px] text-gray-300">Na lista</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRoomType('private');
                }}
                className={`p-3 border-2 text-center flex flex-col items-center gap-1 transition-all ${
                  roomType === 'private'
                    ? 'border-pixel-yellow bg-pixel-border/80 shadow-[2px_2px_0px_#000]'
                    : 'border-black bg-pixel-dark/40 hover:bg-pixel-dark/80'
                }`}
              >
                <Link2 size={20} className="text-pixel-orange" />
                <span className="font-pixel text-[10px] text-white">PRIVADA</span>
                <span className="text-[8px] text-gray-300">Só por link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRoomType('password');
                }}
                className={`p-3 border-2 text-center flex flex-col items-center gap-1 transition-all ${
                  roomType === 'password'
                    ? 'border-pixel-yellow bg-pixel-border/80 shadow-[2px_2px_0px_#000]'
                    : 'border-black bg-pixel-dark/40 hover:bg-pixel-dark/80'
                }`}
              >
                <Lock size={20} className="text-pixel-red" />
                <span className="font-pixel text-[10px] text-white">COM SENHA</span>
                <span className="text-[8px] text-gray-300">Trancada</span>
              </button>
            </div>
          </div>

          {/* Campo de Senha (apenas se for com senha) */}
          {roomType === 'password' && (
            <div className="animate-pop">
              <label className="block text-xs font-pixel text-pixel-red mb-1.5 flex items-center gap-1">
                <Lock size={12} /> DEFINIR SENHA / PIN:
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                maxLength={20}
                placeholder="Ex: 1234 ou senha-secreta"
                className="pixel-input w-full text-sm text-pixel-yellow"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Seus amigos precisarão digitar esta senha para entrar na sala.
              </p>
            </div>
          )}

          {error && (
            <p className="text-pixel-red text-xs font-bold animate-pulse">
              ⚠️ {error}
            </p>
          )}

          {/* Botões de Ação */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="pixel-btn pixel-btn-red flex-1 py-3 text-xs"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="pixel-btn pixel-btn-green flex-1 py-3 text-xs"
            >
              CRIAR SALA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
