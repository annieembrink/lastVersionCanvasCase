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

/* listen on new websocket connections
------------------------------- */
wss.on("connection", (ws) => {

    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log("Number of connected clients: ", wss.clients.size);

    // ws.id = uuidv4();
    // ws.send(JSON.stringify(ws.id))

    // WebSocket events (ws) for single client

    // close event
    ws.on("close", () => {
        console.log("Client disconnected");
        console.log(
            "Number of remaining connected clients: ",
            wss.clients.size
        );
    });

    // message event
    ws.on("message", (data) => {
        // console.log(`${ws.id} sent a message`)
        // console.log('data', JSON.parse(data))

        const message = JSON.parse(data);
        ws.id = uuidv4();
        ws.send(JSON.stringify(ws.id))

        // message.payload.id = ws.id;

        // console.log("Message received: ", message.type);
        // console.log("message id : ", message.payload.id);

        switch (message.type) {
            case "init": {
                console.log("Attempting to send init data to client");
                const id = ws.id;
                ws.send(
                    JSON.stringify({
                        type: "init",
                        payload: {
                            id,
                            state
                        }
                    })
                );
            }
            break;
        case "text": {
            console.log('client trying to write')
            // message to clients
            let objBroadcast = {
                type: "text",
                msg: message.msg,
                id: ws.id,
                nickname: message.nickname
            };

            // broadcast to all but this ws...
            broadcastButExclude(wss, ws, objBroadcast);
        }
        break;
        case "paint": {
            // console.log("Broadcasting: ", message);
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

        // let obj = parseJSON(data);
        // console.log('obj', obj)

        // todo
        // use obj property 'type' to handle message event
        // switch (obj.type) {
        //     case "text":
        //         break;
        //     case "somethingelse":
        //         break;
        //     default:
        //         break;
        // }

    });
});



/* listen on initial connection
------------------------------- */
server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});