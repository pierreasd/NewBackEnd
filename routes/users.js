const con = require("../conn");

require("dotenv").config();

var express = require("express"),
  router = express.Router(),
  connection = require("../conn"),
  response = require("../res"),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken");

let refreshTokens = []

router.post("/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);

    var q = "INSERT INTO users (username, password) VALUES (?, ?);";

    connection.query(q, [req.body.username, hashed], (error, rows) => {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    });
  } catch {
    res.status(500).send();
  }
});

router.post("/token", (req, res) => {
  const refreshToken = req.body.token

  if (refreshToken == null) return res.json({
    status: 401,
    message: "Unauthorized"
  })
  
  var q = "SELECT COUNT(refresh_token) AS 'cnt' FROM token WHERE refresh_token = (?)"

  connection.query(q, [refreshToken], (error, rows) => {
    if(rows[0].cnt === 0 || error){
      res.json({
        status: 403,
        message: "Forbidden"
      })
    }else{
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
    
        const accessToken = generateAccessToken({ name: user.name })
    
        res.json({ accessToken: accessToken })
      })
    }
  })
});

router.delete("/logout", (req, res) => {
  var q = "DELETE FROM token WHERE refresh_token = (?)"

    connection.query(q, [req.body.token], (error) => {
      if(error){
        res.json({
          status: 502,
          message: error
        })
      }else{
        res.json({
          status: 200,
          message: "Logout successful!"
        })
      }

    })


})

router.post("/login", (req, res) => {
  var q = "SELECT * FROM users WHERE username = (?)";

  connection.query(q, [req.body.username], async (error, rows) => {
    try {
      if (await bcrypt.compare(req.body.password, rows[0].password)) {
        const username = req.body.username;
        const user = { name: username };

        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

        var q = "INSERT INTO token (access_token, refresh_token, username) VALUES (?, ? ,?);"
        connection.query(q, [accessToken, refreshToken, user.name])
        
        res.json({
          status: 200,
          message: "Login successful!",
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      } else {
        res.json({
          status: 401,
          message: "Wrong password!"
        })
      }
    } catch {
      res.json({
        status: 500,
        message: "User not found!"
      })
    }
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.send(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.send(403);

    req.user = user;

    next();
  });
}

module.exports = {
  router: router,
  authenticateToken: authenticateToken,
};
