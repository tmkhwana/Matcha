var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const con = require('../models/connection.js');
var nodemailer = require('nodemailer');
var sanitizer = require('sanitizer');

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Matcha' });
// });

/* GET index page. */
router.get('/', function (req, res, next) {
  // console.log("????")
  res.render('index', { page: 'MATCHA', menuId: 'MATCHA' });
});

/* GET home page. */
router.get('/homepage', function (req, res, next) {
  var sess = req.session;
  // console.log(sess);
  //  var fame = fame();
  //  console.log(fame)
  //  console.log("hello")
  if (!sess.suggest)
    sess.suggest = [];
  res.render('homepage', { page: 'MATCHA', menuId: 'MATCHA', username: sess.user.username, data: sess.data, post: sess.post, suggest: sess.suggest });

  // res.render('homepage', {page:'MATCHA', menuId:'MATCHA', username: sess.user.username});
});

/* GET login page*/
router.get('/login', function (req, res, next) {
  // console.log("logged in");
  message = '';
  res.render('login', { page: 'MATCHA', menuId: 'MATCHA', msg: message });
});

/* GET reister page*/
router.get('/register', function (req, res, next) {
  // console.log("register");
  var message = '';
  res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
});

/* GET logout page*/
router.get('/logout', function (req, res, next) {
  var sess = req.session;
  // console.log(sess);
  // var rate = fame();
  con.query(`SELECT * FROM views WHERE viewee = "${sess.user.username}"`, (err, results) => {
    var v = results.length
    con.query(`SELECT * FROM likes WHERE likes = "${sess.user.username}"`, (err, results) => {
      var l = results.length
      con.query(`SELECT * FROM users WHERE active = "1"`, (err, results) => {
        var u = results.length
        var fame = Math.trunc([(v + l) / u] * 100) + "%"
        //  console.log(fame);
        con.query(`UPDATE users SET fame = "${fame}", connection = "offline", lastseen = CURRENT_TIMESTAMP WHERE username = "${sess.user.username}"`)
      })
    })
  })
  // con.query(``)
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      //  Response.errorResponse(err.message,res); 
    }
    else {
      // sess.loggedin = false;
      console.log('User logged out successfully!');
    }
  });

  //  if(sess !== null)       
  //        res.render('index', {page: 'MATCHA', menuId: 'MATCHA'}); 
  res.render('index', { page: 'MATCHA', menuId: 'MATCHA' });
  //  console.log(sess);
});

/* GET profile page*/
router.get('/profile', function (req, res, next) {
  var sess = req.session;
  // console.log(sess);
  res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, data: sess.data, });
});

/* GET profile update*/
router.get('/update', function (req, res, next) {
  // console.log("jonga");
  var sess = req.session
  // console.log(sess);
  res.render('update', { page: 'MATCHA', menuId: 'MATCHA', data: sess.data });
});

router.get('/update2', function (req, res, next) {
  // console.log("jonga");
  var sess = req.session
  // console.log(sess);
  res.render('update2', { page: 'MATCHA', menuId: 'MATCHA', data: sess.data });
});

router.post('/saveLocation', function (req, res, next) {
  var address = req.body;
  var sess = req.session
   //console.log(address);
  //change the user id to the one in the session or something
  con.query("SELECT * FROM locations WHERE user_id = '" + sess.userId + "'", (err, results) => {
    if (err) {
      // console.log(err);
      res.sendStatus(500);
    } else if (results.length === 0) {
      con.query(`INSERT INTO locations (user_id, Longitude, Latitude,StreetName,City,postal_code) VALUES("${sess.userId}", "${address.lon}", "${address.lat}","${address.street}","${address.city}","${address.postal_code}")`);
      // alert("no");
      con.query(`UPDATE users SET city = "${address.city}" WHERE id ="${sess.userId}"`);
      res.sendStatus(200);
    } else {
      // console.log("lona ");
      con.query(`UPDATE locations SET user_id = "${sess.userId}", longitude = "${address.lon}", latitude = "${address.lat}", StreetName = "${address.street}",City = "${address.city}",postal_code = "${address.postal_code}" WHERE user_id ="${sess.userId}"`);
      con.query(`UPDATE users SET city = "${address.city}" WHERE id = "${sess.userId}"`);
      res.sendStatus(200);
    }
  });
});

function sendEmail(name, email) {
  var text = "Hello there your  matcha profile was viewed by" + " " + name
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

router.get('/view', function (req, res, next) {
  // console.log("Here Here");
  var sess = req.session;
  var username = req.query.username;
  var userID = req.query.uid;
  var name = sess.user.username

  con.query(`SELECT * FROM views WHERE viewee ="${username}" AND viewer ="${sess.user.username}"`, (err, results) => {
    if (results.length == 0) {
      con.query(`INSERT INTO views (user_id, viewer, viewee) VALUES ("${sess.userId}", "${sess.user.username}", "${username}")`)
    }
  })

  con.query(`SELECT * FROM users WHERE id ="${userID}"`, function (err, results) {
    if (err) throw err
    var user = results[0];
    //  console.log(user);
    var email = user.email
    sendEmail(name, email);
    con.query(`SELECT * FROM profiles WHERE userId ="${userID}"`, function (err, results) {
      var data = results[0];
      // console.log(data)
      con.query(`SELECT * FROM userinterest WHERE userId = "${userID}"`, function (err, results) {
        const inte = [];
        results.forEach(function (iterm) {
          inte.push(iterm.inteId)
        })
        // console.log(post);
        var sql = `SELECT * FROM interest WHERE id in (?)`;
        con.query(sql, [[...inte]], function (err, results) {
          // console.log(results);
          const post = []
          results.forEach(function (iterm) {
            post.push(iterm.name)
          })
          // console.log(post);
          // console.log(data);
          // console.log(user);
          res.render('view', { page: 'MATCHA', menuId: 'MATCHA', post: post, user: user, data: data, username: sess.user.username });
        })
      })
    })
  })
});

function sendmail(name, email) {
  var text = "Hello there, " + name + " has liked you back on matcha"
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

router.get('/like', (req, res) => {
  var target_like = req.query.username;
  var sess = req.session;
  // console.log(target_like);
  // exit() 
  var name = sess.user.username
  con.query(`SELECT * FROM likes WHERE liker="${target_like}" AND likes="${sess.user.username}"`, (err, results) => {
    if (results.length == 0) {
      con.query(`INSERT INTO likes (user_id,liker, likes) VALUES ("${sess.userId}","${sess.user.username}", "${target_like}")`);
      con.query(`SELECT email FROM users WHERE username ="${target_like}"`, (err, results) => {
        // console.log(results)
        var email = results[0].email;
        sendEmail(name, email);
      })
      // res.render('like', { page: 'MATCHA', menuId: 'MATCHA', data: sess.data, username: sess.user.username })
      res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, data: sess.data, })
    }
    else {
      con.query(`UPDATE likes SET likes_back=true WHERE liker="${target_like}" and likes="${sess.user.username}"`);
      con.query(`SELECT email FROM users WHERE username ="${target_like}"`, (err, results) => {
        var email = results[0].email;
        sendmail(name, email);
      })
      res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, data: sess.data, })
    }
  });
});

router.get('/activate', function (req, res, next) {

  var username = req.query.name;
  var vcode = req.query.vcode;
  console.log(username + " " + vcode)

  var sql = `UPDATE users SET active = "1" WHERE username = "${username}" AND vcode = "${vcode}"`;
  con.query(sql, (err, results) => {
    if (err) throw err
    res.render('index', { page: 'MATCHA', menuId: 'MATCHA' });
  })
})

function sendll(name, email) {
  var text = "Hello there your  matcha profile was uliked by" + " " + name + "."
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
router.get('/ulike', (req, res, next) => {
  
  var username = req.query.username;
  var uid = req.query.uid;
  var sess = req.session;
  var name = sess.user.username;
  con.query(`SELECT email FROM users WHERE username = "${username}"`, (err, results) => {
    var email = results[0].email;
    con.query(`SELECT * FROM likes WHERE liker="${sess.user.username}" OR liker="${username}"`, (err, results) => {
      var entree = results[0];
      if (entree.likes_back == true) {
        // console.log(entree);
        con.query(`UPDATE likes SET likes_back=false WHERE user_id = "${entree.user_id}"`);
        sendll(name, email);
        res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, data: sess.data, })
      }else{
          con.query(`DELETE FROM likes WHERE user_id = "${entree.user_id}"`);
          sendll(name, email);
          res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, data: sess.data, })
      }
    })
  })
})

function sendmll(name, email) {
  var text = "Hello there your  matcha profile was blocked by" + " " + name + " please contact matcha admin for review."
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

router.get('/block', (req, res, next) => {
  var username = req.query.username;
  var uid = req.query.uid;
  var sess = req.session;
  // console.log(sess);
  var sql = `UPDATE users SET active = "0" WHERE username = "${username}" AND id = "${uid}"`;
  con.query(sql, (err, results) => {
    if (err) throw err
    sql = `SELECT email FROM users WHERE id = "${uid}"`;
    con.query(sql, (err, results) => {
      email = results[0].email
      name = sess.user.username;
      sendmll(name, email);
      res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, data: sess.data, })
    })
  })
})

router.get('/views', (req, res, next)=>{
  var sess = req.session;
  var username = sess.user.username
  // console.log(username);
 message = '';
 likes = [];
 con.query(`SELECT viewer FROM views WHERE viewee = "${ username}"`, (err, results) =>{
   if (err) throw err
   views = results;
   con.query(`SELECT likes FROM likes WHERE liker = "${username}" AND likes_back =true`, (err, results)=>{
     if (err) throw err
     results.forEach(function(iterm){
       likes.push(iterm.likes)
     })
    //  console.log(likes);
    con.query(`SELECT liker FROM likes WHERE likes = "${username}"`, (err, results) =>{
      if (err) throw err;
      results.forEach(function(iterm){
        likes.push(iterm.liker)
      })
      // console.log(likes);
      
      res.render('views.ejs', { error: message, views : views, likes : likes})
    })
     
   })
 })
})
module.exports = router;
