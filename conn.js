var mysql = require('mysql');


// buat laptop

var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "password",
   database: "ptisb"
 });
  
  // buat di komputer kantor

//var con = mysql.createConnection({
//  host: "localhost",
//  user: "root",
//  password: "",
//  database: "ptisb_website"
//});

con.connect(function (err){
    if(err) throw err;
});

module.exports = con;
