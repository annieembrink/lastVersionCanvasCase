/* dependencies - imports
------------------------------- */
import express from "express";

// core module http - no npm install...
import http from "http";

// use websocket server
import {
    WebSocketServer
} from "ws";

import {
    v4 as uuidv4
} from "uuid";

import fs from 'fs';

/* application variables
------------------------------- */
// set port number >>> make sure client javascript uses same WebSocket port!
const port = 80;
// const port = 3000;

/* express
------------------------------- */
// express 'app' environment
const app = express();

// serve static files - every file in folder named 'public'
app.use(express.static("public"));

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

/* server(s)
------------------------------- */
// use core module http and pass express as an instance
const server = http.createServer(app);

// create WebSocket server - use a predefined server
const wss = new WebSocketServer({
    noServer: true
});

//Canvas X and Y coordinates
const state = [];

//All players
let nicknameHistory = [];

//Whos turn
let randomPlayerState = [];

//Data from json
let jsonData = [];

//Less than 3 players
let toFewPlayers = false;

//The chosen word (the word to paint)
let chosenWordArr = [];

//Is player allowed to paint (is this even used?)
let allowedToPaint = false;

//Is player allowed to guess
let allowedToGuess;

//How many players have guessed the right word
let guessedRight = 0

//get json data
fs.readFile('motive.json', 'utf8', function (err, data) {
    //Push json data to global variable
    jsonData.push(data)
});


//Generating three random words
const GenerateRandomWords = () => {
    //All json data
    let data = JSON.parse(jsonData);

    //All json word
    let words = data.words;

    //Array to push to (should this be global?)
    let arrOfWords = []

    //Counter för 3 words
    for (let i = 0; i < 3; i++) {
        //Get random words from all words in json, 3 every time
        arrOfWords[i] = words[Math.floor(Math.random() * words.length)]
    }

    //All clients
    wss.clients.forEach(client => {

        //There must be a random player chosen
        if (randomPlayerState[0].id !== undefined) {
            //Send this data to the chosen client
            if (randomPlayerState[0].id === client.id) {
                client.send(JSON.stringify({
                    type: 'getRandomWords',
                    //The random words (only displayed for chosen client)
                    data: arrOfWords
                }))
                //Send this data to every other client
                //Do I have to send anything to every other client?
            } else {
                client.send(JSON.stringify({
                    type: 'getRandomWords',
                    data: []
                }))
            }
        }
    });
}

//Generate the random player, from nicknameHistory (arr with all active clients)
const GenerateRandomPlayer = () => {
    //Pick random player, same player can be chosen in a row
    let randomPlayer = nicknameHistory[Math.floor(Math.random() * nicknameHistory.length)]

    //Push the chosen player to global variable
    randomPlayerState.push(randomPlayer);

    //All clients
    wss.clients.forEach(client => {

        //If a random player has been chosen
        if (randomPlayerState) {
            //And if YOU are the random player
            if (randomPlayerState[0].id === client.id) {
                client.send(JSON.stringify({
                    type: 'getRandomPlayer',
                    data: randomPlayerState,
                    //You are not allowed to guess word in chat
                    allowedToGuess: false
                }))
                //If you´re not the chosen player
            } else if (randomPlayerState[0].id !== client.id) {
                client.send(JSON.stringify({
                    type: 'getRandomPlayer',
                    data: randomPlayerState,
                    //You are allowed to guess word in chat
                    allowedToGuess: true
                }))
            }
        }
    });
}

function onInit(ws) {
    //Ev unnecessary?
    const id = ws.id;

    //Think this is enough?
    ws.send(JSON.stringify({
        type: "init",
        payload: {
            id,
            state
        }
    }))
}

//Break down into smaller functions
function onText(message, wss, ws) {
    //If data (the chosen word) from client is not undefined
    if (message.data !== undefined) {
        //Push the chosen word to global variable "chosenWordArr"
        chosenWordArr.push(message.data)
    }

    //If the message sent in chat IS the same as the chosen word
    if (message.msg === chosenWordArr[0]) {
        //Add +1 to variable "guessedRight"
        guessedRight += 1

        //Find the player who guessed the right word in the nicknamehistory-array
        let playerWhoGuessed = nicknameHistory.find(player => player.id === ws.id);

        //Get index of that player in array
        let getIndex = nicknameHistory.indexOf(playerWhoGuessed)

        //The second the player guessed is turned into points
        let addPoints = parseInt(message.sec)

        //And is added to 'points' in player obj
        nicknameHistory[getIndex].points += addPoints
    }

    //The player who paints
    let playerWhoPaints = randomPlayerState[0]

    //Index of that player in array of player-objects
    let getIndexOfPainter = nicknameHistory.indexOf(playerWhoPaints)

    //The player who paints get 5 points for every player who guessed the right word
    let pointsForPainter = 5 * guessedRight

    //Add the points to painter-player obj
    nicknameHistory[getIndexOfPainter].points += pointsForPainter;

    let objBroadcast = {
        type: "text",
        msg: message.msg,
        id: ws.id,
        nickname: message.nickname,
        chosenWordArr: chosenWordArr,
        nicknameHistory: nicknameHistory,
        allowedToGuess: allowedToGuess
    }

    wss.clients.forEach((client) => {

        //If your not the one painting...
        if (client.id !== randomPlayerState[0].id) {

            //If your msg is not the right word, send data to writing client
            if (message.msg !== chosenWordArr[0]) {
                //You're still allowed to guess...
                objBroadcast.allowedToGuess = true

                //Send data
                client.send(JSON.stringify(objBroadcast))
            } else if (message.msg === chosenWordArr[0] && client.id === ws.id) {
                //If your message is the right word and you're th eon who guessed

                //You're not allowed to guess anymore...
                objBroadcast.allowedToGuess = false

                //Send data
                client.send(JSON.stringify(objBroadcast))
            } else if (message.msg === chosenWordArr[0] && client.id !== ws.id) {

                //If you're not the one who guessed...

                //You're still allowed to guess...
                objBroadcast.allowedToGuess = true

                //Send data
                client.send(JSON.stringify(objBroadcast))
            }
        } else {
            //If your ARE the one painting
            objBroadcast.allowedToGuess = false
            client.send(JSON.stringify(objBroadcast))
        }
    });
}


/* allow websockets - listener
------------------------------- */
// upgrade event - websocket communication
server.on("upgrade", (req, socket, head) => {

    // start websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("let user use websocket...");

        wss.emit("connection", ws, req);
    });
});

//Generate unique ids
wss.getUniqueID = function () {
    let id = uuidv4();
    return id;
};

/* listen on new websocket connections
------------------------------- */
wss.on("connection", (ws) => {

    //Give every player an unique id
    ws.id = wss.getUniqueID();

    // WebSocket events (ws) for single client

    // message event
    ws.on("message", (data) => {

        //The message receive from client
        const message = JSON.parse(data);

        switch (message.type) {
            //For every player that connects with page
            case "init": {
                onInit(ws)
            }
            break;
        case "text": {
            onText(message, wss, ws)
        }
        break;
        case "start": {

            const id = ws.id
            const nickname = message.nickname

            let obj = {
                nickname: nickname,
                id: id,
                points: 0
            }
            nicknameHistory.push(obj)

            if (nicknameHistory.length > 2) {

                if (randomPlayerState.length === 0) {
                    GenerateRandomPlayer()
                    GenerateRandomWords()
                }

                console.log('ready to play')

                wss.clients.forEach((client) => {

                    client.send(JSON.stringify({
                        type: "start",
                        data: {
                            id,
                            nickname,
                            nicknameHistory,
                            randomPlayerState
                        }
                    }));
                });
            };
        };
        break;
        case "paint": {
            state.push(message)
            wss.clients.forEach((client) => {
                client.send(JSON.stringify(message))
            });
        }
        break;
        case "timerStarted": {

            guessedRight = 0

            if (!message.data) {
                randomPlayerState.splice(0)
                chosenWordArr.splice(0)
                GenerateRandomPlayer()
                GenerateRandomWords()
                let deletedItems = state.splice(0, state.length)
            }

            wss.clients.forEach((client) => {

                client.send(JSON.stringify({
                    type: 'timerStarted',
                    time: message.time,
                    id: ws.id,
                    message: message,
                    chosenWordArr: chosenWordArr,
                    timerOn: message.data,
                    allowedToPaint: allowedToPaint,
                    nicknameHistory: nicknameHistory
                }))

            });
        }
        break;
        case "clearCanvas": {

            let deletedItems = state.splice(0, state.length)

            if (ws.id === randomPlayerState[0].id) {
                wss.clients.forEach((client) => {

                    client.send(JSON.stringify({
                        type: 'clearCanvas',
                        data: message.data
                    }))
                });
            }

        }
        break;
        default: {
            console.log("Default");
        }
        }

    });

    // close event
    ws.on("close", () => {

        //Find client who disconnected
        let clientDisconnected = nicknameHistory.find(player => player.id === ws.id);

        if (clientDisconnected) {
            //Get index of the client who disconnected 
            let getIndex = nicknameHistory.indexOf(clientDisconnected)

            //Remove the client who disconnects from array
            nicknameHistory.splice(getIndex, 1)

            //The array nicknamehistory must be at least 3 players
            if (nicknameHistory.length < 3) {
                toFewPlayers = true;
            }

            if ((randomPlayerState.length > 0) && (randomPlayerState[0].id === ws.id)) {
                randomPlayerState.splice(0)
                chosenWordArr.splice(0)
                GenerateRandomPlayer()
                GenerateRandomWords()
            }

            wss.clients.forEach(client => {

                client.send(JSON.stringify({
                    type: 'disconnect',
                    active: nicknameHistory,
                    toFewPlayers: toFewPlayers,
                }))
            });
        };
    });
});


/* listen on initial connection
------------------------------- */
server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});