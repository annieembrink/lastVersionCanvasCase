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



/* allow websockets - listener
------------------------------- */
// upgrade event - websocket communication
server.on("upgrade", (req, socket, head) => {
    console.log("Upgrade event client: ", req.headers);

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

const state = [];
const history = [];
let nicknameHistory = [];
let newArr = []

wss.getUniqueID = function () {
    let id = uuidv4();
    return id;
};

/* listen on new websocket connections
------------------------------- */
wss.on("connection", (ws) => {
    
    let howManyClients = wss.clients.size;

    ws.id = wss.getUniqueID();

    wss.clients.forEach(client => {
        console.log('Client.ID: ' + client.id);
    });

    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log("Number of connected clients: ", wss.clients.size);

    // WebSocket events (ws) for single client

    // message event
    ws.on("message", (data) => {

        const message = JSON.parse(data);
        // ws.send(JSON.stringify(ws.id))
        // ws.send(JSON.stringify(howManyClients))

        switch (message.type) {
            case "init": {
                console.log("Attempting to send init data to client");

                const id = ws.id;
                history.push(id)
                wss.clients.forEach((client) => {

                    client.send(JSON.stringify({
                        type: "init",
                        payload: {
                            id,
                            state,
                            history,
                            nicknameHistory,
                            newArr,
                            howManyClients
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
                arrayOfPlayersLeft: newArr,
                nr: howManyClients
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

            wss.clients.forEach((client) => {

                client.send(JSON.stringify({
                    type: "start",
                    data: {
                        id,
                        nickname,
                        nicknameHistory,
                        newArr
                    }
                }));
            });
        }
        break;
        case "paint": {
            state.push(message)
            wss.clients.forEach((client) => {

                client.send(JSON.stringify(message))
            });
        }
        break;
        default: {
            console.log("Default");
        }
        }

    });

    // close event
    ws.on("close", () => {
        wss.clients.forEach(client => {

            let playerLeft = nicknameHistory.find(player => player.id === client.id)
            newArr.push(playerLeft)
            console.log('newarr', newArr)
            client.send(JSON.stringify({type: 'disconnect', data: newArr}))
          
        });
        console.log('history', nicknameHistory)
        
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