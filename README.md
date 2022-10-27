HOW TO CLONE THE REPO
1. If you want to use this repo locally on your computer, begin by copying this link: https://github.com/anniesandberg/lastVersionCanvasCase.git
2. Open VSC on your computer
3. In VSC, open the folder where you want to clone this project
4. Open your VSC terminal and type: git clone https://github.com/anniesandberg/lastVersionCanvasCase.git 
5. In your terminal, type: cd lastVersionCanvasCase
6. In your terminal, type: npm install
7. To start your server, in your terminal, type: node express-ws-server.js
8. Visit your localhost

Now you should be able to use the application!

HOW TO USE THE GAME
1. You have to be at least 3 players to be able to play the game
2. One of the players will randomly be chosen as "painter"
3. The painter choses a word and try to paint it on the canvas as good as possible (because the painter gets points for every player that guesses the right word)
4. The other players guess the right word in the chat
5. When the timer (30sec) is out a new player will randomly be chosen to paint
6. The painter is not allowed to write in the chat (so they can´t get points because the know the word)
7. If someone has guessed the right word, they can´t write in the chat (so they can´t get points multiple times for the same word)