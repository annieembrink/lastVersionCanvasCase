Om någon laddar ner git repo lokalt, vad behövs för att använda applikationen?
Om git ignore behövs npm install
annars inte

1. If you want to use this repo locally on your computer, begin by copying this link: https://github.com/anniesandberg/lastVersionCanvasCase.git
2. Open the folder where you want to clone this project
3. Open your VSC terminal and type: git clone https://github.com/anniesandberg/lastVersionCanvasCase.git 
- press enter
4. In your terminal, type: cd lastversioncanvascase
- press enter
5. In your terminal, type: npm install
6. To see the app on your localhost, do the following
- File code.js, uncomment line 210, 216, 217, 218
- File code.js, comment line 214
- File express-ws-server.js, uncomment line 23
- File express-ws-server.js, comment line 22
7. To start your server, in your terminal, type: node express-ws-server.js
8. Visit your localhost

Now you should be able to use the application!