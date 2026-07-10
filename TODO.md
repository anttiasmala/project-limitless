# Currently Implementing:

1. Windows are movable when pressing any of the Window controls. If for example minimize-button is clicked, don't allow window drag

# TODO:

1. Fix Mobile view in index-page

# Ideas:

1. Add login system and save winLossDraw stats to backend SQL database. Perhaps PostgreSQL and Prisma?
2. Show settings of a gameroom in Lobby list, so player knows that if there is for example turn timer and how long it is, etc || 7. Add to Game Lobbies a way to see game settings (like if it has Sand Timer enabled, etc)
3. When site is going live, add somekind of feedback system?
4. If a player wins a game with Best Of Series scores activated, if a player leaves after the SeriesWinnerModal, game does not reset the scores.
   How to reproduce the issue:
   1. Create a room with Victories for action: 5, and Best of Series scores: Best of 3. Add the debugging values for score and Best of Series score in /party/games.ts
   2. Win the game with Player 1 so it will have 2 Best of Series scores.
   3. Click "New Series" with Player 1 and leave the game
   4. Points get stuck and do not reset
5. In Singleplayer (maybe in Multiplayer too) if Victories is set to 1 and Best of Series is off, when a player scores a point it immediately resets the game and for example Replay modal is not possible to be viewed
   How to reproduce issue:
   1. Set Victories: 1 and Best of Series: Off
   2. Win a round
6. Add a way to players to see if someone is spectating their game
7. Perhaps set a max amount in VictoriesForAction and Seconds per turn in Multiplayer?
8. Perhaps allow player to choose how many icons have to be inline for a win.
   1. For example: player could choose that 10x10 board would require 3 inline to win, is this a good idea?
9. If there are not any Multiplayer rooms, add "Create New Room"-button into the Lobby List
10. Make chat edits:
    1. window movable in X-axis?
    2. time in a message?
    3. Possibility to delete messages?
    4. Possibility to react messages?
    5. If player leaves game, remove messages or at least don't show them next player?
    6. Add an info button that tells 100 messages is max and then they will dissapear. Oldest dissapears first
    7. Perhaps in Smallest Screen Needed mobile view use full screen chat. At the moment the chat section is really small
    8. In Spectator mode, have messages to be two-sided instead of all messages being in left-side
11. Add a list that lists players & spectators?
12. Perhaps make Enter-key to be "confirmation" in Create Lobby Modal?
13. Add Switch&Case system instead of multiple if-statements? For example in /hooks/multiplayer/usePartyRoom.ts
14. In Multiplayer Lobby, perhaps add possibility to player use the "Enter room code..." to join as a Spectator. Currently it is joining only as a player
15. Add a possibility to Spectators to react?
16. When #11 is done, perhaps add a way to mute player (suppress chats / emoji reactions)
17. Perhaps add a "cooldown" on chat messages / send emojis?
18. Perhaps change inputs' focus border color from white to yellowish?

# Notes

# Check if this is done already

### Maybe implement later

1. Sound effects for 10x10 - Maybe different sounds for the larger board
2. Custom board sizes - 4x4, 5x5, etc. (beyond just 3x3 and 10x10)
3. Change PartyKit to PartyServer — PartyKit is not updated in a long time
4. Tournament bracket — 4-player round-robin or knockout using the existing multiplayer rooms
