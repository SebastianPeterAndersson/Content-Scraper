var http = require('http'),

    // For sending request to a website:
    request = require("request"),

    // For scraping the website with jQuery-familiar syntax:
    cheerio = require("cheerio"),

    fs = require('fs-extra'),

    // For converting list of objects to a CSV file:
    json2csv = require('json2csv'),

    // For nice date displaying:
    moment = require('moment');

// CSV fields:
var fields = ["title", "price", "imgurl", "url", "time"],

// The main url to visit:
mainurl = "http://www.shirts4mike.com/shirts.php",

// The array that are to be filled by all the urls:
urlArr = [];

// Create data directory if there already isn't one
if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

// DATES:
var now = new Date()
var year = now.getFullYear()
var month = now.getUTCMonth()
var date = now.getDate()

// DATE:
var now = moment()
var currentTime = now.format('llll')

// Name of file:
var fullDate = year + "-" + month + "-" + date + ".csv"

// Return a the body of the main page url as a promise.
// This because the task is not synced originally.
function returnBody(url) {
    return new Promise(function(resolve, reject){
        request(url, function(error, response, body) {
            if (error) {
                reject("\n" + currentTime + " - Page could not be found. The main URL is invalid.")
                console.log(error)
            }
            resolve(body)
        })
    })
}

// Get each body of each link provided by the returnBody function
// This is run in a for loop and push each instance to an array.
// Then return the array in a Promise.all()
function getShirts(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, response, body) {
            if (error) {
                reject("\n" + currentTime + " - One or more pages could not be found. Please try again.")
                console.log(error)
            }
            resolve(body)

        })
    })
}

//Construct the json with

function constructJSON(arr, i) {
    return new Promise(function(resolve, reject) {
        var json = {}
        if (!arr) {
            reject("\n" + currentTime + " - Could not construct JSON. Please try again")
        }
        json.title = $(".shirt-details h1").text().slice(4)
        json.price = $("span.price").text()
        json.imgurl = $(".shirt-picture span img").attr("src")
        json.url = "http://www.shirts4mike.com/" + urlArr[i]
        json.time = currentTime
        resolve (arr.push(json))


    })

}

// Disable this if you wish to only keep the current information about the state of the website:

fs.readdir("./data", function(err, files) {
    if(err) {
        console.log(err)
    }
    for (var i = 0; files.length > i; i++) {
        fs.unlink("./data/" + files[i], function(){
            console.log("All files within the Data folder removed. Now waiting to create a fresh one.")
        })
    }
})

// ––––––––––––––––––––|
// PROMISES START HERE:|
returnBody(mainurl)//––|

// Passing the information returned from the returnBody function,
// i.e. the body of the main page:
.then(function(html){

    // Load the HTML to the cheerio object:
    var $ = cheerio.load(html)

    // Declare scope array:
    var arr = []

    // Loop through each link on the main page, each as a promise, and store it in the scoped array:
    $("ul.products li a").each(function(){
        arr.push(($(this).attr("href")))
        urlArr.push(($(this).attr("href")))

    })

    // Return the promises ONLY when if they were all resolved:
    return Promise.all(arr)

})

// The array of shirt URL's go in here:
.then(function(shirts) {

    // Declare scope array:
    var arr = []

    // Loop through the array, run the getShirts function which returns the body of each url:
    for (var i = 0; shirts.length > i; i++) {

        // Push each HTML body:
        arr.push(getShirts("http://www.shirts4mike.com/" + shirts[i]))

    }

    // Return the body of each page ONLY if they are all finished
    return Promise.all(arr)

})

// Array of bodies:
.then(function(body) {

    // Declare scope array:
    var arr = []

    //For each body, construct a json file, but only when cheerio has loaded it:
    for (var i = 0; body.length > i; i++) {
        if ($ = cheerio.load(body[i])) {
            constructJSON(arr, i)
        }
    }

    // Return the array filled with JSON:
    return Promise.all(arr)

})

// The json array:
.then(function(realjson) {

    // Convert the json to a csv file:
    var csv = json2csv({ data: realjson, fields: fields })
    fs.writeFile("./data/" + fullDate, csv, function(err) {
        if (err) {
            console.log(err)
        }
        console.log("File successfully created. It's located inside the 'data' folder.")
    })
})

// Catch all errors and log it to the error logger file:
.catch(function(err) {
    fs.appendFile("error.log", err, function(){
        console.log("Error logged")
    })
})

console.log("Server running in the terminal")
