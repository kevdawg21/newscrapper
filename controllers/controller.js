var express = require("express");
var request = require("request");
var cheerio = require("cheerio");


var router = express.Router();

// Import the model (cat.js) to use its database functions.
var db = require("../models");

router.get("/", function(req, res) {
  db.Article.find({}).then(function(dbArticle) {
    var hbsObject = {
      news: dbArticle
    };
    console.log("hbsObject: ");
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://basketball.realgm.com/news", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".article").each(function(i, element) {
      // Save an empty result object
      var summary = "";
      var grafs = [];
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element)
        .children("a")
        .text();
      result.link = $(element)
        .children("a")
        .attr("href");
      $(element).children(".article-content").children(".article-body").children("p").each(function(i, copy) {
        var cont = $(copy).text();
        cont = cont.replace(/""/g, '"');
        grafs.push(cont);
      })
      for (var i = 0; i < grafs.length; i++) {
        summary += grafs[i];
      }
      result.summary = summary;
      result.photo = '';
      result.note = [];

      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("scrape complete");
        })
    });
  });
})

// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({}).sort({date: 'descending'})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.send(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Export routes for server.js to use.
module.exports = router;
