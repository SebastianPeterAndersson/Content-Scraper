var http = require('http'),
    request = require("request"),
    cheerio = require("cheerio"),
    fs = require("fs"),
    json2csv = require('json2csv');


    // Create data directory if there already isn't one
    if (!fs.existsSync("data")) {
        fs.mkdirSync("data");
    }
