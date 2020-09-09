var http = require('http');

const requestsPerSecondPerfThreshold = 1; //When do we start breaking
const listenPort = 8080;

let requestsPerMinute = 0;
let requestsPerSecond = 0;
let countingMinute = getCurrentMinute();

//create a server object:
http.createServer(function (req, res) {

    //Extremely naive req/sec counter. Resets every minute, no rollowing window
    let currentMinute = getCurrentMinute();
    if (currentMinute != countingMinute) {
        countingMinute = currentMinute;
        requestsPerMinute = 0;        
    }

    requestsPerMinute = requestsPerMinute + 1;
    requestsPerSecond = Math.round(requestsPerMinute / 60);
    
    //Get a random response based on load
    let statusCode = getStatusCode(requestsPerSecond);
    res.writeHead(statusCode);
    res.write(`<!doctype html>
    <html>
      <head>
        <title>Target Web App</title>
      </head>      
      <body style="font-family: Arial, Helvetica, sans-serif, Open Sans">
        <h1>Target Web App</h1>
        <p>I'm a web app that struggles with requests over ${requestsPerSecondPerfThreshold} req/sec. I start responding with a mix of 200, 429 and 500 after that.</p>
        <p>I've had ${requestsPerMinute} requests for the current minute ${currentMinute}, which is:</p>
        <h2>${requestsPerSecond} req/sec</h2> 
        <p>I have responded with <h2>${statusCode}<h2></p>        
      </body>
    </html>`);     
    res.end()
}).listen(listenPort);

function getCurrentMinute() {
    let currDate = new Date();
    return currDate.getMinutes();
}

function getStatusCode() {
    if (requestsPerSecond < requestsPerSecondPerfThreshold) {
        return 200;
    }
    let randomIndex = getRandomInt(3);
    let responses = [200, 429, 500];
    return responses[randomIndex];
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
  