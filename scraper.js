var http = require('http'),

    // For sending request to a website:
    request = require("request"),
    // For scraping the website with jQuery-familiar syntax:
    cheerio = require("cheerio"),
    fs = require("fs"),
    // For converting list of objects to a CSV file:
    json2csv = require('json2csv');


    // Create data directory if there already isn't one
    if (!fs.existsSync("data")) {
        fs.mkdirSync("data");
    }
