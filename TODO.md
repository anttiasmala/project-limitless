# TODO:

1. Perhaps Spectators should not see chat?

# Ideas:

1. Chat in multiplayer - Simple emoji reactions or chat || Emoji reactions in multiplayer — tap to send 🏴‍☠️ 💥 😤 during opponent's turn
2. Time-based scoring - Bonus points for winning quickly
3. In Multiplayer theoretically a player could change their name longer than 20 characters by modifying the name in Local Storage
4. In Multiplayer allow only spectate rooms that have players / allowed spectating
5. Currently 10x10 is really small. Perhaps add a zoom button or something that helps seeing the board. Zooming the whole site works, but perhaps zoom button would be good?
6. Add login system and save winLossDraw stats to backend SQL database. Perhaps PostgreSQL and Prisma?
7. Save multiplayer settings to LocalStorage so player does not have to set the settings always again?
8. Show settings of a gameroom in Lobby list, so player knows that if there is for example turn timer and how long it is, etc
9. When site is going live, add somekind of feedback system?

10. If a player wins a game with Best Of Series scores activated, if a player leaves after the SeriesWinnerModal, game does not reset the scores.
    How to reproduce the issue:
    1. Create a room with Victories for action: 5, and Best of Series scores: Best of 3. Add the debugging values for score and Best of Series score in /party/games.ts
    2. Win the game with Player 1 so it will have 2 Best of Series scores.
    3. Click "New Series" with Player 1 and leave the game
    4. Points get stuck and do not reset
11. In Singleplayer (maybe in Multiplayer too) if Victories is set to 1 and Best of Series is off, when a player scores a point it immediately resets the game and for example Replay modal is not possible to be viewed
    How to reproduce issue:
    1. Set Victories: 1 and Best of Series: Off
    2. Win a round
12. Allow following keys to do stuff in Replay Modal:
    1. Left and Right arrows, go one backwards and forward
    2. Escape close the modal
    3. Perhaps Up arrow go to last move
    4. Perhaps Down arrow go to start
13. Add to Game Lobbies a way to see game settings (like if it has Sand Timer enabled, etc)
14. Add a way to players to see if someone is spectating their game
15. Add Toastify for toasts (for example Error messages could be shown in Toastify's toasts)
16. Perhaps set a max amount in VictoriesForAction and Seconds per turn in Multiplayer?
17. Perhaps allow player to choose how many icons have to be inline for a win.
    1. For example: player could choose that 10x10 board would require 3 inline to win, is this a good idea?
18. If there are not any Multiplayer rooms, add "Create New Room"-button into the Lobby List
19. Make chat edits:
    1. window movable in X-axis?
    2. time in a message?
    3. Possibility to delete messages?
    4. Possibility to react messages?

# Notes

# Check if this is done already

1. AI difficulty improvements for 10x10 - Better AI with threat detection

### Maybe implement later

1. Sound effects for 10x10 - Maybe different sounds for the larger board
2. Custom board sizes - 4x4, 5x5, etc. (beyond just 3x3 and 10x10)
3. Change PartyKit to PartyServer — PartyKit is not updated in a long time
4. Tournament bracket — 4-player round-robin or knockout using the existing multiplayer rooms
