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
10. Allow change difficulty when game has started, if difficulty is changed, reset game?
11. Add 10x10 to Watch mode
12. Currently 10x10 Watch mode does not work. It might get stuck and gives this to move log: "Turn 22 · ☠️ Davy Jones seized NaN" and adds one point per move
13. Currently 10x10 is really small. Perhaps add a zoom button or something that helps seeing the board. Zooming the whole site works, but perhaps zoom button would be good?
14. Add a button that focuses to Squares?
15. Add login system and save winLossDraw stats to backend SQL database. Perhaps PostgreSQL and Prisma?
16. Save multiplayer settings to LocalStorage so player does not have to set the settings always again?
17. Sand timer in multiplayer does not start immediately, it takes half a second to start rolling, perhaps it could be fixed?
18. Show settings of a gameroom in Lobby list, so player knows that if there is for example turn timer and how long it is, etc
19. Seconds per turn in Multiplayer (Check singleplayer as well) does not allow setting it to 0 or empty. Perhaps it should be allowed to be empty, but don't allow room creation and add a check to backend that does not allow number 0 or empty

20. Change Multiplayer's Room Setting's order. Perhaps something like this:
    1. Board Size
    2. Best of Series
    3. Sand timer
    4. Private game
    5. Allow spectators
21. Add Victories from Singleplayer to Multiplayer. So player can choose how many wins before reseting scores
22. When site is going live, add somekind of feedback system?
23. In Singleplayer (why not in Multiplayer too), if Point System is Treasure Chest and Victories is set lower than 5. There is going to be still 5 placeholder coins instead of real value. Perhaps it should show the amount set in Victories?

24. If a player wins a game with Best Of Series scores activated, if a player leaves after the SeriesWinnerModal, game does not reset the scores.
    How to reproduce the issue:
    1. Create a room with Victories for action: 5, and Best of Series scores: Best of 3. Add the debugging values for score and Best of Series score in /party/games.ts
    2. Win the game with Player 1 so it will have 2 Best of Series scores.
    3. Click "New Series" with Player 1 and leave the game
    4. Points get stuck and do not reset
25. Allow ENTER-button to accept Reset Score in Singleplayer? Add simple EventListener when Modal is open
26. In Singleplayer (maybe in Multiplayer too) if Victories is set to 1 and Best of Series is off, when a player scores a point it immediately resets the game and for example Replay modal is not possible to be viewed
    How to reproduce issue:
    1. Set Victories: 1 and Best of Series: Off
    2. Win a round

# Notes

# Check if this is done already

1. AI difficulty improvements for 10x10 - Better AI with threat detection

### Maybe implement later

1. Sound effects for 10x10 - Maybe different sounds for the larger board
2. Custom board sizes - 4x4, 5x5, etc. (beyond just 3x3 and 10x10)
