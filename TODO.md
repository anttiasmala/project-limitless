# TODO:

1. Allow users to set a password? Make it be visible when "Private Game" is selected. If so, add it under "Private Game" just like in Sand Timer
2. In Light Mode, "Password Require!" and "Password" texts does not show. They're too light
   1. Adding just in case how to re-produce the error
   2. Create a room with password
   3. Change joining player's theme to Light
   4. Connect to the server
   5. Now you can hardly see the texts

# Ideas:

1. In Multiplayer theoretically a player could change their name longer than 20 characters by modifying the name in Local Storage
2. In Multiplayer allow only spectate rooms that have players / allowed spectating
3. Currently 10x10 is really small. Perhaps add a zoom button or something that helps seeing the board. Zooming the whole site works, but perhaps zoom button would be good?
4. Add login system and save winLossDraw stats to backend SQL database. Perhaps PostgreSQL and Prisma?
5. Save multiplayer settings to LocalStorage so player does not have to set the settings always again?
6. Show settings of a gameroom in Lobby list, so player knows that if there is for example turn timer and how long it is, etc
7. When site is going live, add somekind of feedback system?

8. If a player wins a game with Best Of Series scores activated, if a player leaves after the SeriesWinnerModal, game does not reset the scores.
   How to reproduce the issue:
   1. Create a room with Victories for action: 5, and Best of Series scores: Best of 3. Add the debugging values for score and Best of Series score in /party/games.ts
   2. Win the game with Player 1 so it will have 2 Best of Series scores.
   3. Click "New Series" with Player 1 and leave the game
   4. Points get stuck and do not reset
9. In Singleplayer (maybe in Multiplayer too) if Victories is set to 1 and Best of Series is off, when a player scores a point it immediately resets the game and for example Replay modal is not possible to be viewed
   How to reproduce issue:
   1. Set Victories: 1 and Best of Series: Off
   2. Win a round
10. Add to Game Lobbies a way to see game settings (like if it has Sand Timer enabled, etc)
11. Add a way to players to see if someone is spectating their game
12. Add Toastify for toasts (for example Error messages could be shown in Toastify's toasts)
13. Perhaps set a max amount in VictoriesForAction and Seconds per turn in Multiplayer?
14. Perhaps allow player to choose how many icons have to be inline for a win.
    1. For example: player could choose that 10x10 board would require 3 inline to win, is this a good idea?
15. If there are not any Multiplayer rooms, add "Create New Room"-button into the Lobby List
16. Make chat edits:
    1. window movable in X-axis?
    2. time in a message?
    3. Possibility to delete messages?
    4. Possibility to react messages?
    5. If player leaves game, remove messages or at least don't show them next player?
    6. Add an info button that tells 100 messages is max and then they will dissapear. Oldest dissapears first
    7. Perhaps in Smallest Screen Needed mobile view use full screen chat. At the moment the chat section is really small
    8. In Spectator mode, have messages to be two-sided instead of all messages being in left-side
17. In Spectator mode if player sends an emoji, it comes as "Opponent reacted:". Perhaps it should come as "Davy Jones reacted:" or something like that?
18. Add a list that lists players & spectators?
19. Perhaps make Enter-key to be "confirmation" in Create Lobby Modal?
20. Add Switch&Case system instead of multiple if-statements? For example in /hooks/multiplayer/usePartyRoom.ts
21. In Multiplayer Lobby, perhaps add possibility to player use the "Enter room code..." to join as a Spectator. Currently it is joining only as a player

# Notes

# Check if this is done already

### Maybe implement later

1. Sound effects for 10x10 - Maybe different sounds for the larger board
2. Custom board sizes - 4x4, 5x5, etc. (beyond just 3x3 and 10x10)
3. Change PartyKit to PartyServer — PartyKit is not updated in a long time
4. Tournament bracket — 4-player round-robin or knockout using the existing multiplayer rooms
