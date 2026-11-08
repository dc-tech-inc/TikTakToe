import React, { useEffect, useRef } from 'react';

const CONFETTI_COLORS = [
  '#fee761', // Amarelo Pixel
  '#f6757a', // Rosa Pixel
  '#41a6f6', // Azul Pixel
  '#38b764', // Verde Pixel
  '#feae34', // Laranja Pixel
  '#73eff7', // Ciano Pixel
  '#ffffff'  // Branco
];

export function PixelConfetti({ active = false, duration = 4000 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const particleCount = 140;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.5,
        size: Math.floor(Math.random() * 6) + 8, // 8px a 14px quadrados pixel
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 4 + 3,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10
      });
    }

    let animationFrameId;
    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Desenha partícula pixelada com borda preta retrô
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        ctx.fillStyle = '#000000';
        ctx.fillRect(-p.size / 2 - 1, -p.size / 2 - 1, p.size + 2, p.size + 2);

        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

        ctx.restore();

        // Se sair da tela embaixo, reaparece no topo se ainda houver tempo
        if (p.y > canvas.height + 20 && elapsed < duration - 1000) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
