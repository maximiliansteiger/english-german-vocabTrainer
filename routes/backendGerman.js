// import external modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const {
    OK,
    CREATED,
    NO_CONTENT,
    BAD_REQUEST,
    NOT_FOUND
} = require('http-status-codes');

// create router
const router = express.Router();

//sends the json data to the link provided in app.js
router.get('/', (req, res) => {
    let german = fs.readFileSync(path.join(__dirname, 'german.txt'), 'utf8');
    res.status(200).json(german.split("\r\n"));
});

// export router
module.exports = router;