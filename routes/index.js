
const express = require("express"),
  router = express.Router(),
  connection = require("../conn"),
  response = require("../res"),
  users = require("./users"),
  { v4: uuidv4 } = require("uuid"),
  fs = require("fs"),
  uuid = uuidv4(),
  multiparty = require("connect-multiparty"),
  multipartyMiddleware = multiparty({uploadDir:"./public/temp/"}),
  path = require('path')

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" })
})

// get article list for home page
router.get('/getArticles', function (req, res){

  var q =
    "SELECT * FROM articles ORDER BY created_datetime DESC LIMIT 6"

  connection.query(q, [], function (error, rows) {
    if (error) {
      console.log(error)
    } else {
      response.ok(rows, res)
    }
  })

})

// Get article list by user
router.get('/getMyArticles', users.authenticateToken, function (req, res){
  var author = req.user.username
  
  var q =
    "SELECT * FROM articles WHERE (author = ? || ? = '') ORDER BY created_datetime DESC"

  connection.query(q, [
    author, author
  ], function (error, rows) {
    if (error) {
      console.log(error)
    } else {
      response.ok(rows, res)
    }
  })
})

// get article by id
router.get('/getArticleDetails/:article_id/', function (req, res){
  var id = req.params.article_id

  var q =
    "SELECT title, body, author, created_datetime FROM articles WHERE id = ?"

  connection.query(q, [id], function (error, rows) {
    if (error) {
      console.log(error)
    } else {
      response.ok(rows, res)
    }
  })

})

// post article
router.post('/postArticle', users.authenticateToken, function (req, res){
  var title = req.body.title
  var body = req.body.body
  var author = req.body.author

  var q =
    "INSERT INTO articles (title, body, author, created_datetime) VALUES (?, ?, ?, NOW())"
  
  connection.query(q, [title, body, author], function (error, rows) {
    if (error) {
      console.log(error)
    } else {
      response.ok(rows, res)
    }
  })

})

// upload images. semoga bisa anjrit

router.post('/uploadImages', multipartyMiddleware, (req, res) => {
  var tempFile = req.files.upload
  var tempFilePath  = tempFile.path

  const targetPathUrl = path.join(__dirname, "../public/images/" + tempFile.name)

  if(path.extname(tempFile.originalFilename).toLowerCase() === ".png" || ".jpg" || ".jpeg"){

    fs.rename(tempFilePath, targetPathUrl, err => {
      if(err) return console.log(err)
    })
    
    res.json({
      uploaded: true,
      url: `http://localhost:8080/images/${tempFile.originalFilename}`
    })
  }
  
  else{
    res.json({
      uploaded: false,
      error: {
        message: "could not upload this image"
      }
    })
  }
})

module.exports = router