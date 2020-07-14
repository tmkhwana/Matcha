var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const con = require('../models/connection.js');


/* GET users listing. */
router.get('/', function (req, res, next) {
   
        var username = req.query.username;
        var userID = req.query.uid
        console.log(username)
    
    // rs.send('respond with a resource');
 });
 
module.exports = router;