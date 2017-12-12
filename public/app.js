$(document).on("click", "li", function() {

  $("#comments").empty();
  $("#notes").empty();
  $("#article-summary").empty();

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).done(function(data) {
      console.log(data);
      $("#article-summary").append("<h3>" + data.title + "</h3>");
      $("#article-summary").append("<p id ='summary-body'>" + data.summary + "</p>");
      $("#article-summary").append("<button data-id='" + data._id + "' id='view-comments'>View Comments</button>");
    });
});

$(document).on("click", "#view-comments", function() {
  var thisId = $(this).attr("data-id");
  showComments(thisId);
  
})

function showComments(thisId) {

  $("#notes").empty();
  $("#comments").empty();

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).done(function(data) {
      console.log(data);
      // An input to enter a new title
      $("#notes").append("Name: <input id='titleinput' name='title' label='Name'>");
      // A textarea to add a new note body
      $("#notes").append("Comment: <textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Submit</button>");

      // If there's a note in the article
      if (data.note[0]) {
        for (var i = 0; i < data.note.length; i++) {
          $("#comments").append("<li><h3 class='comment-title'>" + data.note[i].title + "</h3>" + "<p class='comment-body'>" + data.note[i].body + "</p></li><br>");
        }
        // Place the title of the note in the title input
      }
    });
}

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      showComments(thisId);
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#scrape", function() {
  console.log("test1");
  //$("#article-feed").html('');
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).done(function(scrape) {
    console.log("test2");
    $.ajax({
      method: "GET",
      url: "/articles"
    }).done(function(data) {
      console.log("test3");
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        var article = "<li data-id='" + data[i]._id + "'>" + data[i].title + "<br><span class='link'>" + data[i].link + "</span></li><br>";
        console.log(article);
        $("#article-feed").append(article);
      }
    })
  })
});

/*
 $.ajax({
      method: "GET",
      url: "/articles"
    }).done(function(data) {
      console.log("test3");
      console.log(data);
      for (var i = 0; i < 1; i++) {
        var article = "<li data-id='" + data._id + "'>" + data.title + "<br><span class='link'>" + data.link + "</span></li><br>";
        console.log(article);
        $("#article-feed").append(article);
      }
    })
*/