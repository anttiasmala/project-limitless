1. After a game change starting player (multiplayer)
2. Add somekind of hook to see if game was forfeited (a player runs out of time)
3. In multiplayer, starting player changes only changes on win, not everytime
4. Just an idea, add replay to multiplayer
5. Change winner modal's "New Series" button to like "Close Window" or something like that
6. Series winner gets a popup that tells they have won. Maybe add a similiar popup for the losing player
7. When in mobile view (Smallest screen needed (320x420)) in Replay, the winline is quite a bit off the center. Same in multiplayer game when winline is 3,6,9 squares (top right, middle right, bottom right)
8. Add 10x10 or even bigger gamemode

A lot of ideas below:

**Quick**
_Sound effects — a cannon blast when you win, splash when you draw, creak on each move (using the Web Audio API or small .mp3 files)_

_Animated winning line — draw a crossed-out line through the winning three squares instead of just highlighting them_

_First player toggle — let players choose who goes first before each round, rather than always starting with ☠️_

_Move history — show a log like "Turn 3: Davy Jones played center" in a pirate scroll-style sidebar_

**Medium Effort**
_Kraken avatar reactions — show a small Kraken illustration that changes expression (calm → angry → victorious) based on game state_

_Local storage persistence — remember scores across page refreshes so a session survives an accidental reload_

_Timed moves — optional sand timer (e.g. 10 seconds per move) that auto-forfeits if time runs out, with a pirate hourglass UI_

_Treasure chest win counter — replace numeric scores with a row of treasure chest icons that fill up as you win rounds_

**Bigger Features**
_Best-of series mode — play a best-of-3 or best-of-5 series with a grand champion announcement at the end_

_Online multiplayer — two players on different devices using WebSockets (e.g. via Pusher or Partykit)_

_Replay system — after a game ends, step through moves one by one to review the match_

_Animated ocean background — CSS/canvas waves that get stormier as the game progresses toward an endgame_

Change PartyKit to PartyServer — PartKit is not updated in a long time

**Polish**
_Mobile swipe gestures — make the grid feel more native on touchscreens_

_Dark/light mode — a "day at sea" vs "night voyage" theme toggle_

_Accessibility — keyboard navigation for the grid and proper ARIA labels for screen readers_
