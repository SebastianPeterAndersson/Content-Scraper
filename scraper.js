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


// Create data directory if there already isn't one
if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

fs.emptyDir('siteHTML', function(err) {
    if (err) {
        console.log(err);
    }
});



function req(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(err, res, body) {
            resolve(body);
        });
    });
}

var promises = req("http://www.shirts4mike.com/shirts.php");
promises
    .then(function(value) {
        var $ = cheerio.load(value);
        return $;
    })
    .then(function(nextValue) {
        // Here I am getting each url from the main site and returning
        // the array for the next "then":
        nextValue("ul.products li a").each(function() {
            var shirtUrl = nextValue(this).attr("href");
            arr.push("http://www.shirts4mike.com/" + shirtUrl);
        });
        return arr;
    })
    // Here I am creating one file for each page and storing the data within each one:
    .then(function(nextValue) {
        var finished = 0;
        for (var i = 0; nextValue.length > i; i++) {
            var stream = request(nextValue[i])
                .pipe(fs.createWriteStream("siteHTML/" + i + ".txt"));
            stream.on("finish", function() {
                console.log(i); // returns eight "8". Why I don't know.
            });
        }

    })
    // Here I am using what's now in the siteHTML folder
    .then(function(nextValue) {
        readFiles("siteHTML/", function(filename, content) {
            var data = {};
            // Here I'm getting the content each file
            data[filename] = content;
            console.log(content); // the content returns all 8 blank responses.

        }, function(err) {
            throw err;
        });
    })



    .catch(function(err) {
        console.log(err);
    });

// ----------------------- .
// FUNCTIONS-------------- .
// ----------------------- .

// This is the function where i get each file which I've generated, in the
// folder that contains them:
// I am calling the function below.
function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(dirname + filename, "utf8", function(err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}





console.log("Server running in the terminal");
