//buttons
let diffButtons = document.querySelectorAll('.difficulty-button');
let submitButton = document.querySelector('#submitButton');
let startButtons = document.querySelector('#start');
let resetButton = document.querySelector('#resetButton')
//html elements 
let word = document.querySelector('#word');
let afterStartElements = document.querySelector('#afterStart');
let submitField = document.querySelector('#translationTry');

let currentWordPosition = 0;
let translatedWordsGerman = [];
let jsonWordList = [];
let difficulty = "";

start();

//verify word
function verifyWord() {
    let inputText = document.querySelector('#translationTry').value.toLowerCase();
    let content = document.querySelector(".content");
    let currentWordObject = jsonWordList[currentWordPosition];
    let difficulty = +Object.values(jsonWordList[currentWordPosition])
    let change = false;

    if (inputText === translatedWordsGerman[currentWordPosition].toLowerCase()) {
        content.style.backgroundColor = "green";
        if (difficulty > 0) {
            change = true;
            currentWordObject[Object.keys(currentWordObject)] = difficulty - 1;
        }
    } else {
        content.style.backgroundColor = "red";
        if (difficulty < 2) {
            change = true;
            currentWordObject[Object.keys(currentWordObject)] = difficulty + 1;
        }
        submitField.value = translatedWordsGerman[currentWordPosition];
        submitField.style.color = "red";
    }
    submitField.disabled = true;
    setTimeout(() => {
        changeWordInHtml();
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
    });
}

function start() {
    //init JsonWordList
    updateJsonWordList();
    //init translatedWordsGerman
    getDataGerman().then(data => {
        translatedWordsGerman = data;
    });
    //start buttons
    diffButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficulty = button.value;
            changeWordInHtml();
            changeDisplay(afterStartElements);
            changeDisplay(startButtons);
        });
        //listen to "Enter" key
        submitField.addEventListener('keypress', (event) => {
            if (event.key === "Enter") {
                verifyWord();
            }
        });
    });
    resetButton.addEventListener('click', () => {
        Object.keys(jsonWordList).forEach(key => {
            jsonWordList[key][Object.keys(jsonWordList[key])] = 2;
        });
        updateJsonWordList();
        updateData(jsonWordList);
    })
}

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