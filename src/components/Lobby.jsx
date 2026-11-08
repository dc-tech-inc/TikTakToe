import React, { useState } from 'react';
import { sounds } from '../audio/soundEffects.js';
import { Plus, Users, Lock, Play, Eye, Search, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

export function Lobby({
  rooms = [],
  onCreateRoomClick,
  onJoinRoom,
  onRefresh,
  loading = false
}) {
  const [search, setSearch] = useState('');
  const [directCode, setDirectCode] = useState('');

  const filteredRooms = rooms.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.hostName && r.hostName.toLowerCase().includes(q)) ||
      r.id.toLowerCase().includes(q)
    );
  });

  const handleDirectJoin = (e) => {
    e.preventDefault();
    const clean = directCode.trim();
    if (!clean) return;

    // Se o usuário colou a URL inteira (ex: http://.../?sala=ABC123 ou /sala/ABC123)
    let extractedId = clean;
    if (clean.includes('sala=')) {
      extractedId = clean.split('sala=')[1].split('&')[0];
    } else if (clean.includes('/sala/')) {
      extractedId = clean.split('/sala/')[1].split('/')[0];
    }

    sounds.playClick();
    onJoinRoom(extractedId.toUpperCase());
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner de Boas-vindas Pixel */}
      <div className="pixel-panel p-6 bg-gradient-to-r from-pixel-panel via-[#303657] to-pixel-panel flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-pixel-yellow text-black font-pixel text-[10px] border-2 border-black">
            <Sparkles size={12} /> MULTIPLAYER EM TEMPO REAL
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-white">
            ARENA DO JOGO DA VELHA
          </h2>
          <p className="text-sm text-gray-200 max-w-lg">
            Crie sua sala personalizada, envie o link direto para um amigo ou desafie jogadores online nas salas públicas!
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onCreateRoomClick();
          }}
          className="pixel-btn pixel-btn-green px-6 py-4 text-xs sm:text-sm flex items-center gap-2.5 shadow-pixel-lg"
        >
          <Plus size={20} />
          <span>CRIAR NOVA SALA</span>
        </button>
      </div>

      {/* Barra de Ações: Busca + Entrar por Código/Link Direto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Busca nas salas */}
        <div className="pixel-panel p-3 bg-pixel-panel flex items-center gap-2">
          <Search size={18} className="text-pixel-mint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome da sala ou anfitrião..."
            className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-400 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-gray-400 hover:text-white px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Entrada Rápida por Código ou Link */}
        <form
          onSubmit={handleDirectJoin}
          className="pixel-panel p-3 bg-pixel-panel flex items-center gap-2"
        >
          <span className="font-pixel text-[10px] text-pixel-yellow hidden sm:inline">
            CÓDIGO:
          </span>
          <input
            type="text"
            value={directCode}
            onChange={(e) => setDirectCode(e.target.value)}
            placeholder="Cole código ou link da sala..."
            className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-400 uppercase font-mono"
          />
          <button
            type="submit"
            disabled={!directCode.trim()}
            className="pixel-btn pixel-btn-yellow px-3 py-1.5 text-[10px] flex items-center gap-1"
          >
            <span>ENTRAR</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* Lista de Salas Públicas */}
      <div className="pixel-panel bg-pixel-panel overflow-hidden">
        {/* Cabeçalho da Lista */}
        <div className="pixel-panel-header px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-pixel text-xs text-pixel-yellow">
            <Users size={16} />
            <span>SALAS ABERTAS ({filteredRooms.length})</span>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onRefresh();
            }}
            disabled={loading}
            title="Atualizar lista de salas"
            className="pixel-btn pixel-btn-blue px-2.5 py-1 text-[10px] flex items-center gap-1"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">ATUALIZAR</span>
          </button>
        </div>

        {/* Grade de Salas */}
        <div className="p-4">
          {filteredRooms.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-4xl select-none">🎮</div>
              <h3 className="font-pixel text-xs text-pixel-mint">
                NENHUMA SALA ENCONTRADA NO MOMENTO!
              </h3>
              <p className="text-sm text-gray-300 max-w-sm mx-auto">
                Não há salas públicas ativas agora. Que tal clicar no botão verde acima e criar a sua sala?
              </p>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onCreateRoomClick();
                }}
                className="pixel-btn pixel-btn-green px-4 py-2.5 text-xs mt-2"
              >
                CRIAR MINHA SALA AGORA
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRooms.map((room) => {
                const isWaiting = room.status === 'waiting' || room.playersCount < 2;
                const isFull = room.playersCount >= 2;

                return (
                  <div
                    key={room.id}
                    className="p-4 border-2 border-black bg-pixel-dark/60 shadow-[3px_3px_0px_#000] flex flex-col justify-between gap-3 hover:border-pixel-yellow transition-all"
                  >
                    <div>
                      {/* Topo do Card: Status + Senha */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {isWaiting ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pixel-green/20 border border-pixel-green text-pixel-lime text-[10px] font-pixel animate-pulse">
                            ● AGUARDANDO ADVERSÁRIO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pixel-orange/20 border border-pixel-orange text-pixel-orange text-[10px] font-pixel">
                            ● PARTIDA ROLANDO
                          </span>
                        )}

                        {room.hasPassword && (
                          <span
                            title="Sala protegida com senha"
                            className="inline-flex items-center gap-1 text-[10px] text-pixel-red bg-pixel-red/20 px-1.5 py-0.5 border border-pixel-red font-pixel"
                          >
                            <Lock size={10} /> COM SENHA
                          </span>
                        )}
                      </div>

                      {/* Nome e Anfitrião */}
                      <h4 className="font-pixel text-sm text-pixel-yellow truncate">
                        {room.name}
                      </h4>
                      <p className="text-xs text-gray-300 mt-1">
                        Anfitrião: <strong className="text-white">{room.hostName}</strong>
                      </p>
                    </div>

                    {/* Rodapé do Card: Info e Botão Entrar */}
                    <div className="pt-2 border-t border-black/40 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-gray-300 flex items-center gap-2">
                        <span className="font-bold text-white">
                          👥 {room.playersCount}/2
                        </span>
                        {room.spectatorsCount > 0 && (
                          <span className="text-pixel-mint flex items-center gap-0.5 text-[10px]">
                            <Eye size={11} /> {room.spectatorsCount}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onJoinRoom(room.id, room.hasPassword);
                        }}
                        className={`pixel-btn py-2 px-3 text-[10px] flex items-center gap-1.5 ${
                          isFull ? 'pixel-btn-blue' : 'pixel-btn-green'
                        }`}
                      >
                        {isFull ? (
                          <>
                            <Eye size={14} />
                            <span>ASSISTIR</span>
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            <span>JOGAR</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
