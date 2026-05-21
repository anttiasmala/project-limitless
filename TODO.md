# TODO:

A lot of ideas below:

**Medium Effort**
5×5 board (4-in-a-row) — a natural middle ground between 3×3 and 10×10; also gives the AI a meaningful challenge without being overwhelming
Computer vs Computer — a "watch" mode where two AIs play each other, fun to observe with the storm/kraken animations
Custom emoji symbols — let players pick their pirate token (🦜, 🗡️, 💀, 🐙…) instead of always ☠️ / ⚓

**Bigger Features**
Tournament bracket — 4-player round-robin or knockout using the existing multiplayer rooms
Spectator mode in multiplayer — others can watch an ongoing game live
Emoji reactions in multiplayer — tap to send 🏴‍☠️ 💥 😤 during opponent's turn
Move timer on opponent in multiplayer — currently only in single-player, but the server could enforce it
Change PartyKit to PartyServer — PartyKit is not updated in a long time

**Polish**
Transition animation when switching board sizes — right now it snaps; a fade/scale would feel smoother
Responsive 10×10 on very small screens — the board might get tight on 320px phones; a horizontal scroll wrapper or zoom-to-fit would help
PartyKit → PartyServer migration — already on your TODO, PartyKit is unmaintained

Ideas:

1. Add 10x10, maybe smaller, 10x10 is 100 gametiles
2. Win streak tracking - Track how many games won in a row
3. Tournament mode - Play against multiple AI opponents in a bracket
4. AI difficulty improvements for 10x10 - Better AI with threat detection
5. Sound effects for 10x10 - Maybe different sounds for the larger board
6. Undo move - Allow undoing the last move in PvP mode
7. Board themes - Different visual themes (darker/lighter, different emoji sets)
8. Confetti/celebration effects - When you win
9. Chat in multiplayer - Simple emoji reactions or chat
10. Share/export game - Export the game as a shareable link or image
11. Custom board sizes - 4x4, 5x5, etc. (beyond just 3x3 and 10x10)
12. Time-based scoring - Bonus points for winning quickly
13. Computer vs Computer - Watch AI play itself
14. Hint system - Show the best move for beginners
15. 5x5 board with 4-in-a-row - A middle ground between 3x3 and 10x10
16. In Multiplayer "Replay Game" uses old hardcoded icons instead of player selected icons
17. In Multiplayer SeriesWinnerModal doesn't show custom icons. That is because of "const displayIcon = isHuman ? playerOne.icon : playerTwo.icon;", fix would be to take the icon as a parameter?
18. In Single-player name does not get instantly changes, requires a refresh to change

# Notes

1. In Multiplayer theoretically a player could change their name longer than 20 characters by modifying the name in Local Storage
2. In Multiplayer Pirate Profile the selected icon is not centered with "Smallest screen needed" mobile view
