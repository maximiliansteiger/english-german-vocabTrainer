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
    let words = JSON.parse(fs.readFileSync(path.join(__dirname, 'stats.json'), 'utf8'));
    res.status(200).json(words);
});

router.put('/',function (req, res) {
    fs.writeFile('./routes/stats.json', JSON.stringify(req.body), (err) => {
        if (err) {
            res.status(400).json({
                error: err
            });
        } else {
            res.status(200).json({
                message: 'Word updated'
            });
        }
    });
    res.status(204)
})



// export router
module.exports = router;