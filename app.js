// import module(s)
const express = require('express');
var bodyParser = require('body-parser')
// import router(s)
const backendRouter = require('./routes/backend.js');
const backendRouterGerman = require('./routes/backendGerman.js');
const statsRouter = require('./routes/stats.js');

// specify http server port
const port = 3000;

// create express application
const app = express();

// mount middleware
app.use(express.static('public')); //serve static files
app.use(express.json()); // parse JSON payload and place result in req.body
// mount router(s)
app.use('/words', backendRouter);
app.use('/german', backendRouterGerman);
app.use('/stats', statsRouter);


// start http server
app.listen(port, () => {
    console.log(`Server listening on port ${3000}`);
});