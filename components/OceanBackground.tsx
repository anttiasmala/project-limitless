'use client';

import { useEffect, useRef } from 'react';

type Props = {
  stormLevel: number; // 0.0 to 1.0
  isDarkTheme: boolean;
};

type WaveLayer = {
  amplitude: number;
  period: number;
  speed: number;
  y: number;
  color: string;
};

export default function OceanBackground({ stormLevel, isDarkTheme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const currentStormRef = useRef<number>(stormLevel);

  useEffect(() => {
    currentStormRef.current = stormLevel;
  }, [stormLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function drawFrame() {
      if (!canvas || !ctx) return;
      const s = currentStormRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Sky gradient — calm blue → stormy dark grey
      const skyTop = isDarkTheme
        ? `hsl(${lerp(220, 200, s)}, ${lerp(40, 15, s)}%, ${lerp(8, 4, s)}%)`
        : `hsl(${lerp(210, 200, s)}, ${lerp(70, 20, s)}%, ${lerp(75, 25, s)}%)`;
      const skyBottom = isDarkTheme
        ? `hsl(${lerp(210, 195, s)}, ${lerp(50, 20, s)}%, ${lerp(12, 6, s)}%)`
        : `hsl(${lerp(200, 195, s)}, ${lerp(65, 25, s)}%, ${lerp(55, 20, s)}%)`;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Wave layers — from back to front
      const layers: WaveLayer[] = [
        {
          amplitude: lerp(6, 28, s),
          period: lerp(0.008, 0.014, s),
          speed: lerp(0.3, 2.2, s),
          y: h * lerp(0.58, 0.52, s),
          color: isDarkTheme
            ? `hsla(${lerp(210, 195, s)}, ${lerp(45, 25, s)}%, ${lerp(
                18,
                10,
                s,
              )}%, 0.7)`
            : `hsla(${lerp(200, 190, s)}, ${lerp(60, 30, s)}%, ${lerp(
                42,
                22,
                s,
              )}%, 0.7)`,
        },
        {
          amplitude: lerp(8, 36, s),
          period: lerp(0.01, 0.018, s),
          speed: lerp(0.5, 3.0, s),
          y: h * lerp(0.65, 0.6, s),
          color: isDarkTheme
            ? `hsla(${lerp(205, 190, s)}, ${lerp(50, 28, s)}%, ${lerp(
                22,
                12,
                s,
              )}%, 0.8)`
            : `hsla(${lerp(198, 185, s)}, ${lerp(58, 28, s)}%, ${lerp(
                38,
                18,
                s,
              )}%, 0.8)`,
        },
        {
          amplitude: lerp(10, 44, s),
          period: lerp(0.012, 0.022, s),
          speed: lerp(0.7, 3.8, s),
          y: h * lerp(0.72, 0.68, s),
          color: isDarkTheme
            ? `hsla(${lerp(200, 185, s)}, ${lerp(55, 30, s)}%, ${lerp(
                26,
                14,
                s,
              )}%, 0.85)`
            : `hsla(${lerp(196, 180, s)}, ${lerp(56, 26, s)}%, ${lerp(
                34,
                15,
                s,
              )}%, 0.85)`,
        },
        {
          amplitude: lerp(14, 52, s),
          period: lerp(0.014, 0.026, s),
          speed: lerp(1.0, 4.5, s),
          y: h * lerp(0.8, 0.76, s),
          color: isDarkTheme
            ? `hsla(${lerp(195, 180, s)}, ${lerp(60, 32, s)}%, ${lerp(
                20,
                10,
                s,
              )}%, 0.9)`
            : `hsla(${lerp(194, 175, s)}, ${lerp(54, 24, s)}%, ${lerp(
                30,
                12,
                s,
              )}%, 0.9)`,
        },
        {
          // Foreground — always fills to bottom
          amplitude: lerp(18, 60, s),
          period: lerp(0.016, 0.03, s),
          speed: lerp(1.2, 5.5, s),
          y: h * lerp(0.88, 0.84, s),
          color: isDarkTheme
            ? `hsla(${lerp(190, 175, s)}, ${lerp(65, 35, s)}%, ${lerp(
                16,
                8,
                s,
              )}%, 1)`
            : `hsla(${lerp(192, 170, s)}, ${lerp(52, 22, s)}%, ${lerp(
                26,
                10,
                s,
              )}%, 1)`,
        },
      ];

      timeRef.current += 0.016;
      const t = timeRef.current;

      layers.forEach((layer, layerIndex) => {
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 2) {
          // Multiple sine waves per layer for organic look
          const y =
            layer.y +
            Math.sin(x * layer.period + t * layer.speed) * layer.amplitude +
            Math.sin(
              x * layer.period * 1.7 + t * layer.speed * 0.8 + layerIndex,
            ) *
              (layer.amplitude * 0.4) +
            Math.sin(x * layer.period * 0.5 + t * layer.speed * 1.3) *
              (layer.amplitude * 0.25);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      });

      // Foam flecks at high storm levels
      if (s > 0.5) {
        const foamCount = Math.floor(lerp(0, 18, (s - 0.5) * 2));
        ctx.fillStyle = `rgba(255, 255, 255, ${lerp(0, 0.5, (s - 0.5) * 2)})`;
        for (let i = 0; i < foamCount; i++) {
          const fx = (Math.sin(t * 2.1 + i * 137.5) * 0.5 + 0.5) * w;
          const fy =
            h * lerp(0.72, 0.68, s) +
            Math.sin(t * 3 + i * 42) * lerp(10, 44, s) * 0.5;
          const fr = lerp(1, 4, s);
          ctx.beginPath();
          ctx.arc(fx, fy, fr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(drawFrame);
    }

    animFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkTheme]); // only re-init on theme change; storm level is read via ref

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}
