const mysql = require('mysql');



const host="localhost";
const port=8082;
const user="root";
const password="lmnyamen";
const socketPath = "/goinfre/lmnyamen/Desktop/MAMP/mysql/tmp/mysql.sock";

var conn = mysql.createConnection({
    host     : host,
    port     : port,
    user     : user,
    password : password,
    socketPath: socketPath
});

conn.connect((err) => { 
    if (err) throw err;
    console.log("database connected");
});

module.exports = conn;