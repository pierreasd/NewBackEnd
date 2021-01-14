
var express = require("express"),
  router = express.Router(),
  connection = require("../conn"),
  response = require("../res"),
  users = require("./users")

var multer = require("multer"),
  { v4: uuidv4 } = require("uuid"),
  fs = require("fs"),
  { promisify } = require("util"),
  pipeline = promisify(require("stream").pipeline);

var uuid = uuidv4();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Get article list
router.get('/getArticle', users.authenticateToken, function (req, res){
  var author = req.user.name;
  console.log(req.user)
  var q =
    "SELECT * FROM articles WHERE (author = ? || ? = '') ORDER BY created_datetime DESC LIMIT 6";

  connection.query(q, [
    author, author
  ], function (error, rows) {
    if (error) {
      console.log(error);
    } else {
      response.ok(rows, res);
    }
  })

});

// get article by id
router.get('/getArticleDetails/:article_id/', function (req, res){
  var id = req.params.article_id;

  var q =
    "SELECT title, body, author, created_datetime FROM articles WHERE id = ?";

  connection.query(q, [id], function (error, rows) {
    if (error) {
      console.log(error);
    } else {
      response.ok(rows, res);
    }
  })

});

// post article
router.post('/postArticle', function (req, res){
  var title = req.body.title;
  var body = req.body.body;
  // var author = req.body.author;
  var author = "Pierre G";

  var q =
    "INSERT INTO articles (title, body, author, created_datetime, uuid) VALUES (?, ?, ?, NOW(), ?);";
  
  connection.query(q, [title, body, author, uuid], function (error, rows) {
    if (error) {
      console.log(error);
    } else {
      response.ok(rows, res);
    }
  })

})


var upload = multer();
// router.post(
//   "/uploadImage",
//   upload.single("img_upload"),
//   async function (req, res, next) {
//     var {
//       file,
//       body: {},
//     } = req;

//     if (file.detectedFileExtension !== file.clientReportedFileExtension)
//       next(new Error("why u trynna hack bro :("));

//     var fileName =
//       uuidv4() +
//       "_" +
//       Math.floor(Math.random() * 1000) +
//       file.detectedFileExtension;

//     console.log(file);
//     await pipeline(
//       file.stream,
//       fs.createWriteStream(`${__dirname}/../public/images/${fileName}`)
//     );

//     res.send("Successfully uploaded file " + fileName);
//   }
// );

module.exports = router;
