1. If Kraken's strength is changed, reset score?

A lot of ideas below:

**Quick**
**_Sound effects — a cannon blast when you win, splash when you draw, creak on each move (using the Web Audio API or small .mp3 files)_**

Animated winning line — draw a crossed-out line through the winning three squares instead of just highlighting them

First player toggle — let players choose who goes first before each round, rather than always starting with ☠️

Move history — show a log like "Turn 3: Davy Jones played center" in a pirate scroll-style sidebar

**Medium Effort**
Kraken avatar reactions — show a small Kraken illustration that changes expression (calm → angry → victorious) based on game state

Local storage persistence — remember scores across page refreshes so a session survives an accidental reload

Timed moves — optional sand timer (e.g. 10 seconds per move) that auto-forfeits if time runs out, with a pirate hourglass UI

Treasure chest win counter — replace numeric scores with a row of treasure chest icons that fill up as you win rounds

**Bigger Features**
Best-of series mode — play a best-of-3 or best-of-5 series with a grand champion announcement at the end

Online multiplayer — two players on different devices using WebSockets (e.g. via Pusher or Partykit)

Replay system — after a game ends, step through moves one by one to review the match

Animated ocean background — CSS/canvas waves that get stormier as the game progresses toward an endgame

**Polish**
Mobile swipe gestures — make the grid feel more native on touchscreens

Dark/light mode — a "day at sea" vs "night voyage" theme toggle

Accessibility — keyboard navigation for the grid and proper ARIA labels for screen readers
