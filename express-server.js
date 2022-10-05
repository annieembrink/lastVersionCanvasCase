import express from 'express';

// express 'app' environment
const app = express();

// set port number
const port = 8081;

// serve static files - every file in folder named 'public'
app.use(express.static('public'));

// use method listen - server start
app.listen(port, (req, res) => {
    console.log(`Express server running on port ${port}`);
});