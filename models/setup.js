 const con = require('./connection.js');


 var sql = "CREATE TABLE IF NOT EXISTS users(id INT AUTO_INCREMENT PRIMARY KEY,\
    username VARCHAR(255) NOT NULL,\
    firstname VARCHAR(255) NOT NULL,\
    lastname VARCHAR(255) NOT NULL,\
     email VARCHAR(255) NOT NULL,\
     password VARCHAR(255) NOT NULL,\
     active INT NOT NULL DEFAULT '0',\
     vcode VARCHAR(255),\
     avator VARCHAR(255),\
     birthdate DATE,\
     age INT(11),\
     gender VARCHAR(255),\
     city VARCHAR(255),\
     fame VARCHAR(35),\
     connection VARCHAR(255),\
     lastseen DATETIME)"
 con.query(sql, function(err, result){
    if (err)  throw err;
    console.log("Table users created");
 });

 con.query(`CREATE TABLE IF NOT EXISTS profiles ( id int(11) NOT NULL AUTO_INCREMENT  PRIMARY KEY,\
   userID int(11) NOT NULL,\
   gender varchar(100) ,\
   sexualpref varchar(100) ,\
   biography varchar(255) ,\
   avator varchar(255) ,\
   image1 varchar(255) ,\
   image2 varchar(255) ,\
   image3 varchar(255) ,\
   image4 varchar(255) \
)`, (err, result) => {
   if (err) throw err;
   console.log("Table profiles created");
});

con.query(`CREATE TABLE IF NOT EXISTS locations (id int(11) NOT NULL AUTO_INCREMENT  PRIMARY KEY,\
   user_id int(11), longitude varchar(255), latitude varchar(255), streetName varchar(255), city varchar(255), postal_code varchar(255))`, (err, result) => {
      if (err) throw err;
      console.log("TAble location created");
   });

con.query(`CREATE TABLE IF NOT EXISTS interest (id int(11) NOT NULL AUTO_INCREMENT  PRIMARY KEY, name VARCHAR(255))`, (err, result) => {
   if (err) throw err;
   console.log("Table interest created");
});

con.query(`CREATE TABLE IF NOT EXISTS userinterest (id int(11) NOT NULL AUTO_INCREMENT  PRIMARY KEY, userId int(11), inteId int(11))`, (err, result) => {
   if (err) throw err;
   console.log("Table userinterest created");
});
con.query(`CREATE TABLE IF NOT EXISTS views(user_id int(11) NOT NULL,viewer varchar(255),viewee varchar(255) NOT NULL)`, (err, result) => {
   if (err) throw err;
   console.log("Table views created");
});

con.query(`CREATE TABLE IF NOT EXISTS likes(id int(11) NOT NULL AUTO_INCREMENT  PRIMARY KEY,user_id int(11) NOT NULL,liker varchar(255),likes varchar(255) NOT NULL, likes_back boolean)`, (err, result) => {
   if (err) throw err;
   console.log("Table likes created");
   process.exit();
});
