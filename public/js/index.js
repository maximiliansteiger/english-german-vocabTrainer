//buttons
let diffButtons = document.querySelectorAll('.difficulty-button');
let submitButton = document.querySelector('#submitButton');
let startButtons = document.querySelector('#start');
let resetButton = document.querySelector('#resetButton')

//start Buttons
let easyButton = document.querySelector("#easyB");
let mediumButton = document.querySelector("#mediumB");
let hardButton = document.querySelector("#hardB");

//html elements 
let word = document.querySelector('#word');
let afterStartElements = document.querySelector('#afterStart');
let submitField = document.querySelector('#translationTry');

let currentWordPosition = 0;
let translatedWordsGerman = [];
let jsonWordList = [];
let difficulty = "";

let streak = 0;

start();

//verify word
function verifyWord() {
    let inputText = document.querySelector('#translationTry').value.toLowerCase();
    let content = document.querySelector(".content");
    let currentWordObject = jsonWordList[currentWordPosition];
    let difficulty = +Object.values(jsonWordList[currentWordPosition])
    let change = false;
    if (translatedWordsGerman[currentWordPosition].split(",").map(word => word.toLowerCase()).includes(inputText)) {
        streak++;
        getStatsData().then(data => {
            let stats = data;
            if (difficulty == 0) {
                stats.easy++;
            }
            if (difficulty == 1) {
                stats.medium++;
            }
            if (difficulty == 2) {
                stats.hard++;
            }
            if (streak > stats.streak) {
                stats.streak = streak;
            }
            stats.correct++;
            updateStatsData(stats);
        });
        content.style.backgroundColor = "green";
        if (difficulty > 0) {
            change = true;
            currentWordObject[Object.keys(currentWordObject)] = difficulty - 1;
        }
    } else {
        streak = 0;
        getStatsData().then(data => {
            let stats = data;
            stats.wrong++;
            updateStatsData(stats);
        });
        content.style.backgroundColor = "red";
        if (difficulty < 2) {
            change = true;
            currentWordObject[Object.keys(currentWordObject)] = difficulty + 1;
        }
        //if difficulty was empty after guessed wrong
        if(currentWordObject[Object.keys(currentWordObject)] == 1){
            window.location = "../index.html";
        }
        submitField.value = translatedWordsGerman[currentWordPosition];
        submitField.style.color = "red";
    }
    submitField.disabled = true;
    setTimeout(() => {
        changeWordInHtml();
        content.style.backgroundColor = "gray";
        submitField.style.color = "black";
        submitField.disabled = false;
        submitField.focus();
    }, 2000);
    if (change) {
        updateData(jsonWordList);
        updateJsonWordList();
    }
}

function updateJsonWordList() {
    getData().then(data => {
        jsonWordList = data;
        easyButton.value = "easy \n" + wordsPerDifficulty("easy").length
        mediumButton.value = "medium \n" + wordsPerDifficulty("medium").length
        hardButton.value = "hard \n" + wordsPerDifficulty("hard").length

        if (wordsPerDifficulty("easy").length == 0) {
            document.querySelector("#easyB").disabled = true;
            document.querySelector("#easyB").style.backgroundColor = "gray";
        }

        if (wordsPerDifficulty("medium").length == 0) {
            document.querySelector("#mediumB").disabled = true;
            document.querySelector("#mediumB").style.backgroundColor = "gray";
        }

        if (wordsPerDifficulty("hard").length == 0) {
            document.querySelector("#hardB").disabled = true;
            document.querySelector("#hardB").style.backgroundColor = "gray";
        }
    });
}

function start() {
    //init JsonWordList
    updateJsonWordList();
    //init translatedWordsGerman
    getDataGerman().then(data => {
        translatedWordsGerman = data;
    });
}

//start buttons
diffButtons.forEach(button => {
    button.addEventListener('click', () => {
        difficulty = button.value.split("\n")[0].trim();
        changeWordInHtml();
        changeDisplay(afterStartElements);
        changeDisplay(startButtons);
    });
});
//listen to "Enter" key
submitField.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        verifyWord();
    }
});
resetButton.addEventListener('click', () => {
    Object.keys(jsonWordList).forEach(key => {
        jsonWordList[key][Object.keys(jsonWordList[key])] = 2;
    });
    updateJsonWordList();
    updateData(jsonWordList);
    window.location = "../index.html";
})
//change word in html
function changeWordInHtml() {
    let words = jsonWordList.map(word => Object.keys(word)[0]);
    let diff = jsonWordList.map(word => Object.values(word)[0]);
    if (currentWordPosition < words.length - 1 && wordsPerDifficulty(difficulty).length > 0) {
        do {
            currentWordPosition = Math.floor(Math.random() * words.length - 1) + 1;
        } while (diff[currentWordPosition] != getNumPerDiff(difficulty));
        submitField.value = "";
        word.innerHTML = words[currentWordPosition];
        document.querySelector(".content").style.backgroundColor = "gray";
    }
}

function getNumPerDiff(difficulty) {
    let value = 0;
    switch (difficulty) {
        case 'easy':
            value = 0;
            break;
        case 'medium':
            value = 1;
            break;
        case 'hard':
            value = 2;
            break;
        default:
            break;
    }
    return value;
}

function wordsPerDifficulty(diff) {
    return jsonWordList.filter(word => Object.values(word)[0] == getNumPerDiff(diff));
}
async function getData() {
    return await fetchRestEndpoint('/words', 'GET');
}
async function getDataGerman() {
    return await fetchRestEndpoint('/german', 'GET');
}
//update word in json file
async function updateData(obj) {
    return await fetchRestEndpoint('/words', 'PUT', obj);
}

//stats
async function getStatsData() {
    return await fetchRestEndpoint('/stats', 'GET');
}
//update word in json file
async function updateStatsData(obj) {
    return await fetchRestEndpoint('/stats', 'PUT', obj);
}

function changeDisplay(element) {
    let display = element.style.display;
    element.style.display = (display === 'none') ? 'block' : 'none';
}
/**
 * Sends a HTTP request to the REST API endpoint.
 * @param {string} route 
 * @param {'GET' |'POST' |'PUT' |'DELETE'} method 
 * @param {Object} data 
 */
async function fetchRestEndpoint(route, method, data) {
    const options = {
        method
    };
    if (data) {
        options.headers = {
            'Content-Type': 'application/json'
        }
        options.body = JSON.stringify(data);
    }
    const res = await fetch(route, options);
    if (!res.ok) {
        const error = new Error(`${method} ${res.url} ${res.status} (${res.statusText})`);
        error.response = res;
        throw error;
    }
    if (res.status !== 204) {
        return await res.json();
    }
}