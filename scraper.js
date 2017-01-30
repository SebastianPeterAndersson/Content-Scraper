var http = require('http'),
    // For sending request to a website:
    request = require("request"),
    // For scraping the website with jQuery-familiar syntax:
    cheerio = require("cheerio"),
    fs = require('fs-extra'),
    // For converting list of objects to a CSV file:
    json2csv = require('json2csv');

    var shirtArr = [];
    var arr = [];
    var fields = ["title", "price", "imgurl", "url", "time"];





console.log("Server running in the terminal");
