import React from 'react';

export const AVATAR_LIST = [
  { id: 'cat', name: 'Gatinho', color: '#ffb3ba' },
  { id: 'frog', name: 'Sapinho', color: '#baffc9' },
  { id: 'bear', name: 'Ursinho', color: '#ffd6a5' },
  { id: 'robot', name: 'Robô', color: '#bae1ff' },
  { id: 'bunny', name: 'Coelhinho', color: '#ffc6ff' },
  { id: 'duck', name: 'Patinho', color: '#ffffba' }
];

/**
 * Componente de Avatar Pixel Art com Expressões Dinâmicas
 * @param {string} id - 'cat' | 'frog' | 'bear' | 'robot' | 'bunny' | 'duck'
 * @param {'idle' | 'thinking' | 'celebrating' | 'surprised'} mood
 * @param {number} size
 */
export function PixelAvatar({ id = 'cat', mood = 'idle', size = 56, className = '' }) {
  // Cores por humor
  const isCelebrating = mood === 'celebrating';
  const isThinking = mood === 'thinking';
  const isSurprised = mood === 'surprised';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className} ${
        isCelebrating ? 'animate-bounce' : isThinking ? 'animate-pulse' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-[2px_2px_0px_#000]"
        style={{ imageRendering: 'pixelated' }}
      >
        {renderAvatarShape(id, mood)}
      </svg>
      {/* Indicador de expressão em balãozinho caso esteja pensando ou comemorando */}
      {isThinking && (
        <span className="absolute -top-1 -right-1 text-xs select-none animate-bounce">
          💭
        </span>
      )}
      {isCelebrating && (
        <span className="absolute -top-2 -right-2 text-xs select-none animate-spin">
          ⭐
        </span>
      )}
      {isSurprised && (
        <span className="absolute -top-1 -right-1 text-xs select-none">
          ❗
        </span>
      )}
    </div>
  );
}

function renderAvatarShape(id, mood) {
  switch (id) {
    case 'frog':
      return renderFrog(mood);
    case 'bear':
      return renderBear(mood);
    case 'robot':
      return renderRobot(mood);
    case 'bunny':
      return renderBunny(mood);
    case 'duck':
      return renderDuck(mood);
    case 'cat':
    default:
      return renderCat(mood);
  }
}

// 🐱 Gatinho Pixel
function renderCat(mood) {
  return (
    <g>
      {/* Orelhas */}
      <rect x="2" y="1" width="3" height="3" fill="#ff7597" stroke="#000" strokeWidth="0.5" />
      <rect x="11" y="1" width="3" height="3" fill="#ff7597" stroke="#000" strokeWidth="0.5" />
      <rect x="3" y="2" width="1" height="1" fill="#ffe3e9" />
      <rect x="12" y="2" width="1" height="1" fill="#ffe3e9" />

      {/* Rosto */}
      <rect x="2" y="4" width="12" height="10" rx="1" fill="#ffb3ba" stroke="#000" strokeWidth="0.75" />
      
      {/* Bochechas */}
      <rect x="3" y="9" width="2" height="1" fill="#ff5277" />
      <rect x="11" y="9" width="2" height="1" fill="#ff5277" />

      {/* Olhos e Expressão */}
      {mood === 'celebrating' ? (
        // Olhos felizes em arco ^ ^
        <>
          <path d="M4 7 L5 6 L6 7" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M10 7 L11 6 L12 7" stroke="#000" strokeWidth="1" fill="none" />
          {/* Boquinha aberta de alegria */}
          <rect x="7" y="9" width="2" height="2" fill="#000" />
          <rect x="7" y="10" width="2" height="1" fill="#ff3860" />
        </>
      ) : mood === 'thinking' ? (
        // Olhos olhando para o lado pensando
        <>
          <rect x="4" y="6" width="2" height="2" fill="#000" />
          <rect x="10" y="6" width="2" height="2" fill="#000" />
          <rect x="4" y="5" width="2" height="1" fill="#ffe761" />
          <rect x="10" y="5" width="2" height="1" fill="#ffe761" />
          {/* Boquinha de dúvida */}
          <rect x="7" y="9" width="3" height="1" fill="#000" />
        </>
      ) : mood === 'surprised' ? (
        // Olhos arregalados e boca aberta em "O"
        <>
          <rect x="4" y="6" width="2" height="2" fill="#000" />
          <rect x="10" y="6" width="2" height="2" fill="#000" />
          <rect x="7" y="8" width="2" height="3" fill="#000" />
        </>
      ) : (
        // Padrão feliz (idle)
        <>
          <rect x="4" y="7" width="2" height="2" fill="#000" />
          <rect x="10" y="7" width="2" height="2" fill="#000" />
          <rect x="4" y="7" width="1" height="1" fill="#fff" />
          <rect x="10" y="7" width="1" height="1" fill="#fff" />
          {/* Focinho */}
          <rect x="7" y="8" width="2" height="1" fill="#ff5277" />
          <path d="M6 10 L7 9 L8 10 L9 9 L10 10" stroke="#000" strokeWidth="0.5" fill="none" />
        </>
      )}

      {/* Bigodes */}
      <line x1="1" y1="8" x2="3" y2="8" stroke="#000" strokeWidth="0.6" />
      <line x1="13" y1="8" x2="15" y2="8" stroke="#000" strokeWidth="0.6" />
    </g>
  );
}

// 🐸 Sapinho Pixel
function renderFrog(mood) {
  return (
    <g>
      {/* Olhos esbugalhados no topo */}
      <circle cx="4" cy="4" r="3" fill="#baffc9" stroke="#000" strokeWidth="0.75" />
      <circle cx="12" cy="4" r="3" fill="#baffc9" stroke="#000" strokeWidth="0.75" />

      {/* Rosto do sapinho */}
      <rect x="2" y="4" width="12" height="10" rx="2" fill="#38b764" stroke="#000" strokeWidth="0.75" />

      {/* Pupilas nos olhos */}
      {mood === 'celebrating' ? (
        <>
          <path d="M3 4 L4 3 L5 4" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M11 4 L12 3 L13 4" stroke="#000" strokeWidth="1" fill="none" />
          <rect x="5" y="9" width="6" height="3" fill="#000" rx="1" />
          <rect x="6" y="10" width="4" height="2" fill="#ff3860" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <rect x="3" y="3" width="2" height="2" fill="#000" />
          <rect x="11" y="3" width="2" height="2" fill="#000" />
          <line x1="5" y1="10" x2="11" y2="9" stroke="#000" strokeWidth="1" />
        </>
      ) : mood === 'surprised' ? (
        <>
          <circle cx="4" cy="4" r="1.5" fill="#000" />
          <circle cx="12" cy="4" r="1.5" fill="#000" />
          <circle cx="8" cy="9" r="1.8" fill="#000" />
        </>
      ) : (
        <>
          <circle cx="4" cy="4" r="1.5" fill="#000" />
          <circle cx="12" cy="4" r="1.5" fill="#000" />
          <circle cx="3.5" cy="3.5" r="0.6" fill="#fff" />
          <circle cx="11.5" cy="3.5" r="0.6" fill="#fff" />
          {/* Sorrisinho largo de sapinho */}
          <path d="M5 9 Q8 12 11 9" stroke="#000" strokeWidth="1" fill="none" />
        </>
      )}

      {/* Bochechas rosadas */}
      <rect x="3" y="8" width="2" height="1" fill="#f6757a" />
      <rect x="11" y="8" width="2" height="1" fill="#f6757a" />
    </g>
  );
}

// 🐻 Ursinho Pixel
function renderBear(mood) {
  return (
    <g>
      {/* Orelhas */}
      <circle cx="3" cy="3" r="2.5" fill="#8b5e34" stroke="#000" strokeWidth="0.75" />
      <circle cx="13" cy="3" r="2.5" fill="#8b5e34" stroke="#000" strokeWidth="0.75" />
      <circle cx="3" cy="3" r="1.2" fill="#ffd6a5" />
      <circle cx="13" cy="3" r="1.2" fill="#ffd6a5" />

      {/* Rosto */}
      <rect x="2" y="3" width="12" height="11" rx="2" fill="#a0693b" stroke="#000" strokeWidth="0.75" />

      {/* Focinho claro */}
      <ellipse cx="8" cy="9.5" rx="3.5" ry="2.5" fill="#ffd6a5" stroke="#000" strokeWidth="0.5" />
      <rect x="7" y="8" width="2" height="1.5" fill="#3a2312" rx="0.5" />

      {/* Olhos e Expressão */}
      {mood === 'celebrating' ? (
        <>
          <path d="M4 6 L5 5 L6 6" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M10 6 L11 5 L12 6" stroke="#000" strokeWidth="1" fill="none" />
          <rect x="7" y="10" width="2" height="1.5" fill="#e43b44" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <rect x="4" y="5" width="2" height="2" fill="#000" />
          <rect x="10" y="5" width="2" height="2" fill="#000" />
          <line x1="7" y1="10" x2="9" y2="10.5" stroke="#000" strokeWidth="0.8" />
        </>
      ) : mood === 'surprised' ? (
        <>
          <rect x="4" y="5" width="2" height="2" fill="#000" />
          <rect x="10" y="5" width="2" height="2" fill="#000" />
          <circle cx="8" cy="10" r="1" fill="#000" />
        </>
      ) : (
        <>
          <circle cx="5" cy="6" r="1" fill="#000" />
          <circle cx="11" cy="6" r="1" fill="#000" />
          <circle cx="4.6" cy="5.6" r="0.4" fill="#fff" />
          <circle cx="10.6" cy="5.6" r="0.4" fill="#fff" />
          <path d="M7 10 Q8 11 9 10" stroke="#000" strokeWidth="0.8" fill="none" />
        </>
      )}
    </g>
  );
}

// 🤖 Robozinho Pixel
function renderRobot(mood) {
  return (
    <g>
      {/* Antena */}
      <line x1="8" y1="1" x2="8" y2="3" stroke="#000" strokeWidth="1" />
      <circle cx="8" cy="1" r="1.2" fill="#fee761" stroke="#000" strokeWidth="0.5" />

      {/* Cabeça de Metal */}
      <rect x="2" y="3" width="12" height="11" fill="#41a6f6" stroke="#000" strokeWidth="0.75" />
      
      {/* Parafusos nas orelhas */}
      <rect x="0.5" y="7" width="1.5" height="3" fill="#fee761" stroke="#000" strokeWidth="0.5" />
      <rect x="14" y="7" width="1.5" height="3" fill="#fee761" stroke="#000" strokeWidth="0.5" />

      {/* Visor digital */}
      <rect x="3.5" y="5" width="9" height="5" fill="#181425" stroke="#000" strokeWidth="0.5" />

      {/* Olhos digitais */}
      {mood === 'celebrating' ? (
        <>
          <rect x="5" y="6" width="2" height="2" fill="#fee761" />
          <rect x="9" y="6" width="2" height="2" fill="#fee761" />
          <line x1="5" y1="12" x2="11" y2="12" stroke="#fee761" strokeWidth="1" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <line x1="5" y1="6" x2="7" y2="6" stroke="#73eff7" strokeWidth="1.5" />
          <line x1="9" y1="7" x2="11" y2="7" stroke="#73eff7" strokeWidth="1.5" />
          <rect x="6" y="11" width="4" height="1" fill="#000" />
        </>
      ) : mood === 'surprised' ? (
        <>
          <circle cx="6" cy="7.5" r="1.5" fill="#ff5277" />
          <circle cx="10" cy="7.5" r="1.5" fill="#ff5277" />
          <rect x="7" y="11" width="2" height="2" fill="#000" />
        </>
      ) : (
        <>
          <rect x="5" y="6.5" width="2" height="2" fill="#73eff7" />
          <rect x="9" y="6.5" width="2" height="2" fill="#73eff7" />
          {/* Boca de grade de som */}
          <rect x="5" y="11" width="6" height="1.5" fill="#262b44" stroke="#000" strokeWidth="0.5" />
        </>
      )}
    </g>
  );
}

// 🐰 Coelhinho Pixel
function renderBunny(mood) {
  return (
    <g>
      {/* Orelhas compridas */}
      <rect x="3" y="0.5" width="3" height="5" rx="1.5" fill="#ffffff" stroke="#000" strokeWidth="0.75" />
      <rect x="10" y="0.5" width="3" height="5" rx="1.5" fill="#ffffff" stroke="#000" strokeWidth="0.75" />
      <rect x="4" y="1.5" width="1" height="3" fill="#ffb3ba" />
      <rect x="11" y="1.5" width="1" height="3" fill="#ffb3ba" />

      {/* Rosto fofo */}
      <rect x="2" y="4" width="12" height="10" rx="2" fill="#ffffff" stroke="#000" strokeWidth="0.75" />

      {/* Bochechinhas */}
      <circle cx="4" cy="9.5" r="1" fill="#ffb3ba" />
      <circle cx="12" cy="9.5" r="1" fill="#ffb3ba" />

      {/* Olhos e Expressão */}
      {mood === 'celebrating' ? (
        <>
          <path d="M4 7 L5 6 L6 7" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M10 7 L11 6 L12 7" stroke="#000" strokeWidth="1" fill="none" />
          <polygon points="8,8.5 7.2,10 8.8,10" fill="#f6757a" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <circle cx="5" cy="7" r="1" fill="#000" />
          <circle cx="11" cy="7" r="1" fill="#000" />
          <polygon points="8,8.5 7.2,10 8.8,10" fill="#f6757a" />
        </>
      ) : mood === 'surprised' ? (
        <>
          <circle cx="5" cy="6.5" r="1.5" fill="#000" />
          <circle cx="11" cy="6.5" r="1.5" fill="#000" />
          <circle cx="8" cy="10" r="1" fill="#000" />
        </>
      ) : (
        <>
          <circle cx="5" cy="7.5" r="1" fill="#000" />
          <circle cx="11" cy="7.5" r="1" fill="#000" />
          <circle cx="4.6" cy="7.1" r="0.4" fill="#fff" />
          <circle cx="10.6" cy="7.1" r="0.4" fill="#fff" />
          <polygon points="8,8.5 7.2,9.5 8.8,9.5" fill="#f6757a" />
          {/* Dentes de coelhinho */}
          <rect x="7.3" y="10.5" width="1.4" height="1.5" fill="#fff" stroke="#000" strokeWidth="0.4" />
        </>
      )}
    </g>
  );
}

// 🦆 Patinho Pixel
function renderDuck(mood) {
  return (
    <g>
      {/* Topete */}
      <rect x="7" y="1" width="2" height="2" fill="#fee761" stroke="#000" strokeWidth="0.5" />

      {/* Rosto do Patinho */}
      <rect x="2" y="3" width="12" height="11" rx="2" fill="#fee761" stroke="#000" strokeWidth="0.75" />

      {/* Bico laranjinha fofo */}
      <rect x="5" y="8.5" width="6" height="3" rx="1.5" fill="#f77622" stroke="#000" strokeWidth="0.75" />

      {/* Olhos e Expressão */}
      {mood === 'celebrating' ? (
        <>
          <path d="M4 6 L5 5 L6 6" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M10 6 L11 5 L12 6" stroke="#000" strokeWidth="1" fill="none" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <circle cx="5" cy="5.5" r="1" fill="#000" />
          <circle cx="11" cy="5.5" r="1" fill="#000" />
        </>
      ) : mood === 'surprised' ? (
        <>
          <circle cx="5" cy="5" r="1.5" fill="#000" />
          <circle cx="11" cy="5" r="1.5" fill="#000" />
          <circle cx="8" cy="10" r="1" fill="#000" />
        </>
      ) : (
        <>
          <circle cx="5" cy="6" r="1.2" fill="#000" />
          <circle cx="11" cy="6" r="1.2" fill="#000" />
          <circle cx="4.6" cy="5.6" r="0.5" fill="#fff" />
          <circle cx="10.6" cy="5.6" r="0.5" fill="#fff" />
        </>
      )}

      {/* Bochechas */}
      <rect x="3" y="7.5" width="1.5" height="1" fill="#ff7597" />
      <rect x="11.5" y="7.5" width="1.5" height="1" fill="#ff7597" />
    </g>
  );
}

/**
 * Ícone Pixel do X (Cruz pixelada estilizada)
 */
export function PixelPieceX({ size = 48, className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={`drop-shadow-[3px_3px_0px_#000] ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Sombra / Borda preta de fundo */}
      <path
        d="M2 1 L5 1 L8 4 L11 1 L14 1 L14 4 L11 7 L14 10 L14 13 L11 13 L8 10 L5 13 L2 13 L2 10 L5 7 L2 4 Z"
        fill="#000000"
      />
      {/* Miolo colorido X (Rosa / Vermelho Pixel) */}
      <path
        d="M3 2 L5 2 L8 5 L11 2 L13 2 L13 4 L10 7 L13 10 L13 12 L11 12 L8 9 L5 12 L3 12 L3 10 L6 7 L3 4 Z"
        fill="#f6757a"
      />
      {/* Brilho 8-bit */}
      <rect x="4" y="3" width="1" height="1" fill="#ffe3e9" />
      <rect x="11" y="3" width="1" height="1" fill="#ffe3e9" />
      <rect x="8" y="6" width="1" height="1" fill="#ffe3e9" />
    </svg>
  );
}

/**
 * Ícone Pixel do O (Círculo / Anel pixelado estilizado)
 */
export function PixelPieceO({ size = 48, className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={`drop-shadow-[3px_3px_0px_#000] ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Borda preta externa */}
      <rect x="4" y="1" width="8" height="14" fill="#000" />
      <rect x="1" y="4" width="14" height="8" fill="#000" />

      {/* Miolo Ciano / Mint */}
      <rect x="5" y="2" width="6" height="12" fill="#41a6f6" />
      <rect x="2" y="5" width="12" height="6" fill="#41a6f6" />

      {/* Abertura central preta */}
      <rect x="5" y="5" width="6" height="6" fill="#181425" stroke="#000" strokeWidth="0.5" />

      {/* Brilhos 8-bit */}
      <rect x="4" y="3" width="2" height="1" fill="#d0f4ff" />
      <rect x="3" y="4" width="1" height="2" fill="#d0f4ff" />
    </svg>
  );
}
