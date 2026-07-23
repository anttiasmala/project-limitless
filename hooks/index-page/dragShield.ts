// While a window is being dragged or resized, the mouse can pass over an
// <iframe> (e.g. the Paint app). An iframe is a separate browsing context, so it
// it stops dragging / resizing
export function showDragShield(cursor: string): () => void {
  const shield = document.createElement('div');
  shield.style.position = 'fixed';
  shield.style.inset = '0';
  shield.style.zIndex = '2147483647';
  shield.style.cursor = cursor;
  document.body.appendChild(shield);
  return () => shield.remove();
}
