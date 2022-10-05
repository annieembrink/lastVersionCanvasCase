import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from "uuid";

// import functions
import { parseJSON, broadcast, broadcastButExclude } from './libs/functions.js';

// create WebSocket server
const wss = new WebSocketServer({port: 8081});

// Create state of canvas
const state = [];
const log = (message) => console.log(`[SERVER] ${message}`);

// listen on new connections
wss.on('connection', (ws) => {
    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log('Number of connected clients: ', wss.clients.size);

    // WebSocket events (ws) for single client

    // close event
    ws.on('close', () => {
        console.log('Client disconnected');
        console.log('Number of remaining connected clients: ', wss.clients.size);
    });

    // message event
    ws.on('message', (data) => {
        // console.log('Message received: %s', data);

        let obj = parseJSON(data);

        // message to clients
        let objBroadcast = {
            type: "text",
            msg: obj.msg,
            nickname: obj.nickname
        }

        // broadcast to all but this ws...
        broadcastButExclude(wss, ws, objBroadcast);
    });
});