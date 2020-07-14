var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var validator = require('validator');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var uniqid = require('uniqid');
var sanitizer = require('sanitizer');
var passwordValidator = require('password-validator');
var mysql = require('mysql');
var schema = new passwordValidator();


var routes = require('./routes');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var regRouter = require('./routes/register');
var viewRouter = require('./routes/view');


var app = express();
var mysql = require('mysql');
var bodyParser = require("body-parser");
var con = require('./models/connection.js');

var session = require('express-session');
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { maxAge: 60000000}
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/view', viewRouter);
// app.use('/login', loginRouter);
// app.use('/register', regRouter);


// app.get('/', routes.index);//call for main index page
// app.get('/login', routes.index);//call for login page
// app.get('/signup', usersRouter.signup);//call for signup page

app.get('/login', usersRouter.login);//call for login post
app.post('/login', usersRouter.login);//call for login post
app.post('/signup', usersRouter.signup);//call for signup post
app.post('/update', usersRouter.update);//call for upload post
app.post('/update2', usersRouter.update2);//call for upload2 post

function sendEmail(name, email) {
  var text = "Hello there your  matcha profile was like by" + " " + name
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
    subject: 'Matcha Notification',
    text: text,
    html: '<a>' + text + '</a>'
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}

app.get('/forgot', (req, res) => {
  console.log('hello')
  res.render('forgot', {page: 'Forgot Password', menuId: 'Forgot Password'})
});

app.post('/forgot', function (require, response) {
  var email = sanitizer.sanitize(require.body.email);

  sql = `SELECT vcode FROM users WHERE email = '${email}'`;
  con.query(sql, function(err, results){
      if(err){
          message = err;
      } else if(results.length){
          var vcode = results[0].vcode;
          
          let transporter = nodemailer.createTransport({
              service: 'gmail.com',
              auth: {
              user: 'tmkhwana@student.wethinkcode.co.za',
              pass: 'Honeyberry@1'
              }
          });
          
          var mailOptions = {
              from: 'matcha@gmail.com',
              to: require.body.email,
              subject: 'reset password',
              html: `
                      <h1>Click below link to reset password!</h1>
                      <a href=http://localhost:8082/reset?email=${require.body.email}&vcode=${vcode}>Reset password<a>
                      `
          };
          
          transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              response.send(error);
          } else {
              response.send(`<p><strong>Please check your email for further instructions</strong></p>`);
          }
          });
      } else {
          response.send(email + ' does not exist');
      }
  });
});

app.get('/reset', function (require, response) {
  var sql = 'select id from users where email = ? and vcode = ?';
  con.query(sql, [require.query.email, require.query.vcode], function(err, results){
      if(err){
          response.send(`error: ${err}`);
      } else if(results.length){
          var id = results[0].id;
          response.render('reset', {page: 'RESET', menuId:'RESET', id});
      } else {
          response.send(`Invalid or expired link`);
      }
  });
});

app.post('/reset', (require, response) => {
  var id = require.body.id,
      pass1 = require.body.pass1,
      pass2 = require.body.pass2;

      console.log(id);
  schema
      .is().min(6)
      .has().uppercase()
      .has().lowercase()
      .has().digits()
      .has().symbols();

  if (pass1 !== pass2){
      response.render('reset', {page: 'RESET', menuId:'RESET', id, msg: 'Passwords do not match'});
  } else if (schema.validate(pass1) === false) {
      msg = `Password needs to meet: ${schema.validate(pass1, { list: true })}`;
      response.render('reset', {page: 'RESET', menuId:'RESET', id, msg});
  } else {
      const saltRounds = 10;
      bcrypt.hash(pass1, saltRounds, function(err, hash) {
          if (err){
              msg = err;
              response.render('reset', {page: 'RESET', menuId:'RESET', id, msg});
          } else {
              var pass = hash;
              var sql = 'update users set password = ? where id = ?';
              con.query(sql, [pass,id], (err, res) => {
                  if(err){
                      response.send(`error: ${err}`);
                  } else {
                      var sql = 'update users set vcode = ? where id = ?';
                      con.query(sql, [null,id], (err, res) => {});
                      response.render('login', {page: 'LOGIN', menuId:'LOGIN', msg: 'Password updated successfully'});
                  }
              });
          }
      });
  } 
});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(8082, (err) => {
  if (err) throw err;
  else {
    console.log("Server running on port: 8082");
  }
});

module.exports = app;
