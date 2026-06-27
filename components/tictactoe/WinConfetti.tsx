'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

// Pirate-themed victory burst: gold/amber paper confetti mixed with treasure
// emoji, fired as two volleys from the bottom corners like a pair of cannons.
// Mounted only on a win (see GameOverModal), so the effect fires once per open.
export default function WinConfetti() {
  useEffect(() => {
    // Respect users who opt out of motion — no burst at all.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    // Dedicated full-screen canvas so we control stacking and never block
    // clicks on the modal beneath the falling confetti.
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '200'; // above GameOverModal (z-101)
    document.body.appendChild(canvas);

    const cannon = confetti.create(canvas, { resize: true, useWorker: true });

    const goldColors = ['#facc15', '#f59e0b', '#fde68a', '#b45309', '#fbbf24'];
    const treasure = ['💰', '🪙', '⭐', '🏴‍☠️'].map((text) =>
      confetti.shapeFromText({ text, scalar: 2 }),
    );

    const fireVolley = () => {
      // Left cannon, angled up and to the right.
      cannon({
        particleCount: 60,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 1 },
        colors: goldColors,
      });
      cannon({
        particleCount: 14,
        angle: 60,
        spread: 70,
        startVelocity: 55,
        origin: { x: 0, y: 1 },
        shapes: treasure,
        scalar: 2,
      });
      // Right cannon, angled up and to the left.
      cannon({
        particleCount: 60,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 1 },
        colors: goldColors,
      });
      cannon({
        particleCount: 14,
        angle: 120,
        spread: 70,
        startVelocity: 55,
        origin: { x: 1, y: 1 },
        shapes: treasure,
        scalar: 2,
      });
    };

    fireVolley();
    const secondVolley = window.setTimeout(fireVolley, 250);

    return () => {
      window.clearTimeout(secondVolley);
      cannon.reset();
      canvas.remove();
    };
  }, []);

  return null;
}
