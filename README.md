@andsju

# WebSocket tutorial
How to setup a websocket chat application in a Nodejs environment. Laborative approach, step-by step, using ES6 modules server side.
**Express** server serving static files, and **ws** acting as websocket server.

In order to authenticate user and use things like express sessions - nodejs core module **http** handles websocket upgrade event (handshake).
Authentication not implemented...

[Checkout WebSocket library ws documentation](https://www.npmjs.com/package/ws)

### Todo
Figure out a way to handle websocket messages between client <-> server

Send and receive stringified objects:

```javascript
    let obj = {
        type: "text",
        msg: "Hello world",
        nickname: ""
    }

    // or...
    obj = {
        type: "action",
        playerX: ;
        playerY: ;
        nickname: ""
    }

```
---

```javascript

    // todo server AND client side
    // use obj property 'type' to handle message event
    switch (obj.type) {
        case "text":
            break;
        case "somethingelse":
            break;
        default:
            break;
    }

```

---

### Run application

#### Install 

`npm install`

#### Start server
`node express-ws-server`

#### Enter url (default port 80) 
localhost

See more instructions in browser...