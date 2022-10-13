/* dependencies - imports
------------------------------- */
import express from "express";

// core module http - no npm install...
import http from "http";

// use websocket server
import {
    WebSocketServer
} from "ws";

// import functions
import {
    parseJSON,
    broadcast,
    broadcastButExclude
} from "./libs/functions.js";

import {
    v4 as uuidv4
} from "uuid";

import fs from 'fs';

/* application variables
------------------------------- */
// set port number >>> make sure client javascript uses same WebSocket port!
const port = 80;

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
app.set('view engine', 'ejs');

app.get('/game', function (req, res) {
    res.render('game')
});

/* server(s)
------------------------------- */
// use core module http and pass express as an instance
const server = http.createServer(app);

// create WebSocket server - use a predefined server
const wss = new WebSocketServer({
    noServer: true
});

const state = [];
// const history = [];
let nicknameHistory = [];
let randomPlayerState = [];
// let newArr = []
let jsonData = [];
let toFewPlayers = false;
// let arrOfWords = [];

fs.readFile('motive.json', 'utf8', function (err, data) {
    jsonData.push(data)
});

//Generating three random words
const GenerateRandomWords = () => {
    let data = JSON.parse(jsonData);
    let words = data.words;

    console.log('randomplayerstate', randomPlayerState[0].id)

    let arrOfWords = []
    for (let i = 0; i < 3; i++) {
        arrOfWords[i] = words[Math.floor(Math.random() * words.length)]
    }

    wss.clients.forEach(client => {

        if (randomPlayerState[0].id === client.id) {
            client.send(JSON.stringify({
                type: 'getRandomWords',
                data: arrOfWords
            }))
        }
    });
}

const GenerateRandomPlayer = () => {
    let randomPlayer = nicknameHistory[Math.floor(Math.random() * nicknameHistory.length)]
    console.log('random player', randomPlayer)
    randomPlayerState.push(randomPlayer);

    wss.clients.forEach(client => {

        client.send(JSON.stringify({
            type: 'getRandomPlayer',
            data: randomPlayerState
        }))
    });
}



// //Filling the wordDiv with three random wordTags
// function createRandomWordElement(data) {
//     data.map((tag) => {
//         let pTag = document.createElement('p');
//         pTag.classList = "randomWordTag"
//         pTag.innerText = tag;
//         wordDiv.appendChild(pTag)
//     })
// }


/* allow websockets - listener
------------------------------- */
// upgrade event - websocket communication
server.on("upgrade", (req, socket, head) => {
    // console.log("Upgrade event client: ", req.headers);

    // use authentication - only logged in users allowed ?
    // socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n');
    // socket.destroy();
    // return;

    // start websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("let user use websocket...");

        wss.emit("connection", ws, req);
    });
});

wss.getUniqueID = function () {
    let id = uuidv4();
    return id;
};

/* listen on new websocket connections
------------------------------- */
wss.on("connection", (ws) => {

    // console.log('this is json data', JSON.parse(jsonData))

    //shouldnt do this on each connection

    ws.id = wss.getUniqueID();

    // wss.clients.forEach(client => {
    //     console.log('Client.ID: ' + client.id);
    // });

    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log("Number of connected clients: ", wss.clients.size);

    // WebSocket events (ws) for single client

    // message event
    ws.on("message", (data) => {

        const message = JSON.parse(data);

        switch (message.type) {
            case "init": {
                console.log("Attempting to send init data to client");

                const id = ws.id;
                // history.push(id)
                wss.clients.forEach((client) => {

                    client.send(JSON.stringify({
                        type: "init",
                        payload: {
                            id,
                            state,
                            // history,
                            // nicknameHistory
                        }
                    }));
                });
            }
            break;
        case "text": {
            console.log('client trying to write')

            // message to clients
            let objBroadcast = {
                type: "text",
                msg: message.msg,
                id: ws.id,
                nickname: message.nickname,
            };

            // broadcast to all but this ws...
            broadcastButExclude(wss, ws, objBroadcast);
        }
        break;
        case "start": {

            const id = ws.id
            const nickname = message.nickname

            let obj = {
                nickname: nickname,
                id: id,
            }
            nicknameHistory.push(obj)

            if (randomPlayerState.length === 0) {
                GenerateRandomPlayer()
                GenerateRandomWords()
            }

            if (nicknameHistory.length > 2) {
                console.log('ready to play')

                wss.clients.forEach((client) => {

                    client.send(JSON.stringify({
                        type: "start",
                        data: {
                            id,
                            nickname,
                            nicknameHistory,
                            randomPlayerState
                            // newArr
                        }
                    }));
                });

            }
        }
        break;
        case "paint": {
            state.push(message)
            wss.clients.forEach((client) => {

                client.send(JSON.stringify(message))
            });
        }
        break;
        case "timerStarted": {

            console.log('timermsg', message)

            if(!message.data) {
                randomPlayerState.splice(0)
                GenerateRandomPlayer()
                GenerateRandomWords()
            }
            

            // wss.clients.forEach((client) => {

            //     client.send(JSON.stringify(message))
            // });
        }
        break;
        case "enoughPlayers": {

        }
        break;
        default: {
            console.log("Default");
        }
        }

    });

    // close event
    ws.on("close", () => {

        // console.log('nicknameshistory before slice', nicknameHistory)

        let clientDisconnected = nicknameHistory.find(player => player.id === ws.id);
        // console.log('clientDisconnected', clientDisconnected)

        let getIndex = nicknameHistory.indexOf(clientDisconnected)
        // console.log('getIndex', getIndex)

        nicknameHistory.splice(getIndex, 1)
        // console.log('nicknameistory after splice', nicknameHistory)

        if (nicknameHistory.length < 3) {
            toFewPlayers = true;
        }

        wss.clients.forEach(client => {

            client.send(JSON.stringify({
                type: 'disconnect',
                active: nicknameHistory,
                toFewPlayers: toFewPlayers
            }))
        });

        console.log("Client disconnected");
        console.log(
            "Number of remaining connected clients: ",
            wss.clients.size
        );
    });
});


/* listen on initial connection
------------------------------- */
server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});