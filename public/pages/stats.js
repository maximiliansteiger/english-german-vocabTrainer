google.charts.load('current', {
    'packages': ['corechart']
});

google.charts.setOnLoadCallback(drawChartDifficulty);
google.charts.setOnLoadCallback(drawChartCorrectness);

function drawChartCorrectness() {
    let statsData = getStatsData();
    statsData.then(jsonDataWareHouse => {
        let data = google.visualization.arrayToDataTable([
            ['Difficulty', 'count', {
                role: 'style'
            }],
            ['correct', jsonDataWareHouse.correct, 'green'],
            ['wrong', jsonDataWareHouse.wrong, 'red']
        ]);

        // Set chart options
        let options = {
            'title': 'distribution of correctly spelled words',
            'width': 1200,
            'height': 800
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.ColumnChart(document.getElementById('drawChartDifficulty'));
        chart.draw(data, options);
    });
}


function drawChartDifficulty() {
    let statsData = getStatsData();
    statsData.then(jsonDataWareHouse => {
        let data = google.visualization.arrayToDataTable([
            ['Difficulty', 'count', {
                role: 'style'
            }],
            ['easy', jsonDataWareHouse.easy, '#4CAF50'],
            ['medium', jsonDataWareHouse.medium, '#c3ce63'],
            ['hard', jsonDataWareHouse.hard, '#ca3a27']
        ]);

        // Set chart options
        let options = {
            'title': 'distribution of correctly spelled words',
            'width': 1200,
            'height': 800
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.ColumnChart(document.getElementById('drawChartCorrectness'));
        chart.draw(data, options);
    });
}

async function getStatsData() {
    return await fetchRestEndpoint('/stats', 'GET');
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