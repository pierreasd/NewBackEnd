var express = require('express'),
 router = express.Router(),
 connection = require('../conn'),
 response = require('../res'),
 bcrypt = require('bcrypt')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get("/", (req, res) => {
  var q = "SELECT * FROM users";

  connection.query(q, [], (error, rows) => {
    if (error) {
      console.log(error);
    } else {
      response.ok(rows, res);
    }
  });
});

router.post("/", async (req, res) => {
  try{
    const hashed = await bcrypt.hash(req.body.password, 10);

    var q = "INSERT INTO users (username, password) VALUES (?, ?);"

    connection.query(q, [
      req.body.username,
      hashed
    ], (error, rows) => {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    });
  }catch{
    res.status(500).send();
  }
});

router.post("/login", async (req, res) => {
  var q = "SELECT * FROM users WHERE username = (?)";

  connection.query(q, [req.body.username], async (error, rows) => {
    try{
      await bcrypt.compare(req.body.password, rows[0].password) ? res.status(200).send("Login successful!") : res.status(401).send("Wrong password!");
    }catch{
      res.status(500).send();
    }
  });

  
});

module.exports = router;
