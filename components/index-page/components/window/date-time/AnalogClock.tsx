// The clock face. Hands (hand = viisari) are drawn as rotated lines from the centre, so the
// second hand lines up with the digital field beside it.
export default function AnalogClock({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  const hand = (angleDeg: number, length: number, width: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x2: 50 + Math.cos(rad) * length,
      y2: 50 + Math.sin(rad) * length,
      strokeWidth: width,
    };
  };

  const hourHand = hand(((hours % 12) + minutes / 60) * 30, 24, 3.5);
  const minuteHand = hand((minutes + seconds / 60) * 6, 34, 2.5);
  const secondHand = hand(seconds * 6, 36, 1);

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32" aria-hidden>
      <circle cx="50" cy="50" r="47" fill="#fff" stroke="#7f9db9" />
      {Array.from({ length: 12 }, (_, i) => {
        const rad = ((i * 30 - 90) * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={50 + Math.cos(rad) * 40}
            cy={50 + Math.sin(rad) * 40}
            r={i % 3 === 0 ? 2 : 1.2}
            fill="#333"
          />
        );
      })}
      <line x1="50" y1="50" {...hourHand} stroke="#000" strokeLinecap="round" />
      <line
        x1="50"
        y1="50"
        {...minuteHand}
        stroke="#000"
        strokeLinecap="round"
      />
      <line x1="50" y1="50" {...secondHand} stroke="#c00" />
      <circle cx="50" cy="50" r="2" fill="#000" />
    </svg>
  );
}
