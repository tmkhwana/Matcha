var express = require('express');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Matcha' });
// });

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', {page:'MATCHA', menuId:'MATCHA'});
// });

/* GET sigup page*/
// router.get('/register', function(re, res, next){
//   res.render('register', {page:'MATCHA', menuId:'MATCHA'});
// });

const con         = require('../models/connection.js');
var express = require('express');
var router = express.Router();
var validator = require('validator');
var bcrypt = require ('bcrypt');
var nodemailer = require('nodemailer');
var uniqid = require('uniqid');
const saltRounds = 10;
var regex = require('regex');
//---------------------------------------------signup page call------------------------------------------------------
function sendEmail(name, vcode, email) {
   var text = `Welcome to matcha , we are here to help you connect with your soul mate, please click on the link to activate your account <a href="http://localhost:3600/activate?name=${name}&vcode=${vcode}">link</a>`;
   transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
           user: 'matchamatch2@gmail.com',
           pass: 'matchme@123'
       }
   });
   mailOptions = {
       from: '"Matcha" <mmodisad@student.wethinkcode.co.za>',
       to: email,
       subject: 'Matcha registration',
       text: text,
       html: '<a>'+text+'</a>'
   };
   transporter.sendMail(mailOptions, function(error, info){
       if(error){
           return console.log(error);
       }
       console.log('Message sent: ' + info.response);
   });
}

exports.signup = function(req, res){
   message = '';
   error = '';
   if(req.method == "POST"){
      var post  = req.body;
      
      var name= post.user_name;
      var fname= post.first_name;
      var lname= post.last_name;
      var email= post.email;
      var pass= post.password;
      var vcode = uniqid();
      
      if (post.name == '' || post.fname == '' || post.lname == '' || post.email == '' || post.pass == '') {
         message = "All fileds are required.";
         res.render('signup.ejs', {error: message});
         return false;

      }else if (validator.isLength(fname, {min:3}) == false)
      {
         message =  "Firstname requires minimum of 3 characters";
         res.render('signup.ejs', {error: message});
         return true;
      }else if (validator.isLength(lname, {min:3}) == false)
      {
         message =  "Last Name requires minimum of 3 characters";
         res.render('signup.ejs', {error: message});
         return true;
      }else if (validator.isLength(pass, {min:6}) == false)
      {
         message =  "Password must be atleast 6 characters";
         res.render('signup.ejs', {error: message});
         return true;
      }else if (validator.isEmail(email) == false) {
         message = "Invalid email address";
         res.render('signup.ejs', {error: message});
      }

       // Store hash in your password DB.
      bcrypt.hash(pass, saltRounds, function(err, hash) {
         var sql ="INSERT INTO `users`(`username`,`firstname`,`lastname`,`email`, `password`,`vcode` ) VALUES ('" + name + "','" + fname + "','" + lname + "','" + email + "','" + hash + "','" + vcode + "')";
         var query = con.query(sql, function(err, result) {
           }); 
         
          message = "Succesfully! Your account has been created.";
          res.render('signup.ejs',{error: message});
            });
          sendEmail(name, vcode, email);
          //message = "A confirmation email has been sent to you";
          res.render('verify.ejs', {error:message })
          
    } else {
       res.render('signup');
    }
};
module.exports = router;
