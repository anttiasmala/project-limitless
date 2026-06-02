# TODO:

A lot of ideas below:

**Bigger Features**
Tournament bracket — 4-player round-robin or knockout using the existing multiplayer rooms
Emoji reactions in multiplayer — tap to send 🏴‍☠️ 💥 😤 during opponent's turn
Change PartyKit to PartyServer — PartyKit is not updated in a long time

# Ideas:

1. Confetti/celebration effects - When you win
2. Chat in multiplayer - Simple emoji reactions or chat
3. Share/export game - Export the game as a shareable link or image
4. Time-based scoring - Bonus points for winning quickly
5. In Single-player name does not get instantly changes, requires a refresh to change
6. In Multiplayer theoretically a player could change their name longer than 20 characters by modifying the name in Local Storage
7. In Multiplayer Pirate Profile the selected icon is not centered with "Smallest screen needed" mobile view
8. In Multiplayer allow only spectate rooms that have players / allowed spectating
9. Move winLossDraw to useGameSettings.ts from Board.tsx
10. Replay modal does not show latest move with yellow border
11. Allow change difficulty when game has started, if difficulty is changed, reset game?
12. Add 10x10 to Watch mode
13. Currently 10x10 Watch mode does not work. It might get stuck and gives this to move log: "Turn 22 · ☠️ Davy Jones seized NaN" and adds one point per move
14. Currently 10x10 is really small. Perhaps add a zoom button or something that helps seeing the board. Zooming the whole site works, but perhaps zoom button would be good?
15. Add a button that focuses to Squares?
16. Add login system and save winLossDraw stats to backend SQL database. Perhaps PostgreSQL and Prisma?
17. Save multiplayer settings to LocalStorage so player does not have to set the settings always again?
18. Sand timer in multiplayer does not start immediately, it takes half a second to start rolling, perhaps it could be fixed?
19. Show settings of a gameroom in Lobby list, so player knows that if there is for example turn timer and how long it is, etc
20. Seconds per turn in Multiplayer (Check singleplayer as well) does not allow setting it to 0 or empty. Perhaps it should be allowed to be empty, but don't allow room creation and add a check to backend that does not allow number 0 or empty

21. Change Multiplayer's Room Setting's order. Perhaps something like this:
    1. Board Size
    2. Best of Series
    3. Sand timer
    4. Private game
    5. Allow spectators
22. Add Victories from Singleplayer to Multiplayer. So player can choose how many wins before reseting scores
23. When site is going live, add somekind of feedback system

# Notes

# Check if this is done already

1. AI difficulty improvements for 10x10 - Better AI with threat detection

### Maybe implement later

1. Sound effects for 10x10 - Maybe different sounds for the larger board
2. Custom board sizes - 4x4, 5x5, etc. (beyond just 3x3 and 10x10)
