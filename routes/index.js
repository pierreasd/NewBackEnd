var express = require("express");
var router = express.Router();
var multer = require("multer");
var { v4: uuidv4 } = require("uuid");
var fs = require("fs");
var { promisify } = require("util");
var pipeline = promisify(require("stream").pipeline);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

var upload = multer();
router.post(
  "/uploadImage",
  upload.single("img_upload"),
  async function (req, res, next) {
    var {
      file,
      body: {},
    } = req;

    if (file.detectedFileExtension !== file.clientReportedFileExtension)
      next(new Error("why u trynna hack bro :("));

    var fileName =
      uuidv4() +
      "_" +
      Math.floor(Math.random() * 1000) +
      file.detectedFileExtension;

    console.log(file);
    await pipeline(
      file.stream,
      fs.createWriteStream(`${__dirname}/../public/images/${fileName}`)
    );

    res.send("Successfully uploaded file " + fileName);
  }
);
module.exports = router;
