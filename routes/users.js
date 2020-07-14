var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const con = require('../models/connection.js');
var validator = require('validator');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var uniqid = require('uniqid');
const saltRounds = 10;
var regex = require('regex');
var sanitizer = require('sanitizer');
// var fileUpload = require('express-fileupload');


/* GET users listing. */
router.get('/', function (req, res, next) {
   res.send('respond with a resource');
});


//---------------------------------------------register page call------------------------------------------------------
function sendEmail(name, vcode, email) {
   var text = "Welcome to matcha , we are here to help you connect with your soul mate, please click on the link to activate your account http://localhost:8082/activate?name=" + name + "&vcode=" + vcode;
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
      html: '<a>' + text + '</a>'
   };
   transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
         return console.log(error);
      }
      console.log('Message sent: ' + info.response);
   });
}


router.signup = function (req, res) {
   message = '';
   console.log("register here");
   if (req.method == "POST") {
      var post = req.body;
      var name = sanitizer.sanitize(post.user_name).trim();
      var fname = sanitizer.sanitize(post.first_name).trim();
      var lname = sanitizer.sanitize(post.last_name).trim();
      var email = sanitizer.sanitize(post.email).trim();
      var pass = sanitizer.sanitize(post.password).trim();
      var birthd = sanitizer.sanitize(post.birthdate).trim();
      var vcode = uniqid();

      console.log(email);

      if (name == '' || fname == '' || lname == '' || email == '' || pass == '' || birthd == '') {
         message = "All fileds are required.";
         res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
         return false;

      } else if (validator.isLength(fname, { min: 3 }) == false) {
         message = "Firstname requires minimum of 3 characters";
         res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
         return true;
      } else if (validator.isLength(lname, { min: 3 }) == false) {
         message = "Last Name requires minimum of 3 characters";
         res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
         return true;
      } else if (validator.isLength(pass, { min: 6 }) == false) {
         message = "Password must be atleast 6 characters";
         res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
         return true;
      } else if (validator.isEmail(email) == false) {
         message = "Invalid email address";
         res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
      }
      con.query(`SELECT * FROM users WHERE username = '${name}' OR email = '${email}'`, (err, results) => {
         // console.log(results);
         if (err) throw err;
         else if (results.length){

            if(results[0].email == email){
              message = "email already exists";
              res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
           }
           else if (results[0].username == name) {
              message = "username already exists";
              res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
           }
         } else {
         
            bcrypt.hash(pass, saltRounds, function (err, hash) {
               var sql = "INSERT INTO `users`(`username`,`firstname`,`lastname`,`email`, `password`,`vcode`, `birthdate` ) VALUES ('" + name + "','" + fname + "','" + lname + "','" + email + "','" + hash + "','" + vcode + "','" + birthd + "')";
               // var query = con.query(sql, function(err, result) {
               //   }); 
               con.query(sql, function (err, result) {
                  // console.log(result);
                  // console.log(sql);
                  var sql = "SELECT *, YEAR(CURDATE()) -YEAR(birthdate) -IF(STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(birthdate), '-', DAY(birthdate)) ,'%Y-%c-%e') > CURDATE(), 1, 0)AS age FROM users WHERE id = '" + result.insertId + "'";
                  con.query(sql, function (err, result) {
                     if (err) throw err;
                     var sql = "UPDATE users SET age = '" + result[0].age + "' WHERE id = '" + result[0].id + "'";
                     con.query(sql, function (err, result) {
                        if (err) throw err;
                        // message = "Succesfully! Your account has been created.";
                        sendEmail(name, vcode, email);
                        res.render('verify.ejs', { error: message })
                        // res.render('index', { page: 'MATCHA', menuId: 'MATCHA' });
                     })
                  })

               });
               // message = "Succesfully! Your account has been created.";
               // res.render('signup.ejs', { error: message });
            });
         }
      })
      // Store hash in your password DB.
      //message = "A confirmation email has been sent to you";
   } else {
      res.render('register', { page: 'MATCHA', menuId: 'MATCHA', message: message });
   }
};

//-----------------------------------------------login page call------------------------------------------------------
router.login = function (req, res) {
   var message;
   var sess = req.session;

   // if (sess.loggedin){   
   //    res.render('homepage', {page:'MATCHA', menuId:'MATCHA', username : sess.user.username, data: sess.data});
   // }


   if (req.method == "POST") {
      var post = req.body;
      var name = sanitizer.sanitize(post.username).trim();
      var unhash_pass = sanitizer.sanitize(post.password).trim();

      var sql = `SELECT password FROM users WHERE username = '${name}' AND active = 1`;
      //gets the hashed password using the username
      con.query(sql, function (err, results) {
         var hash_pass;
         if (err) {
            message = err;
            res.render('login', { page: 'MATCHA', menuId: 'MATCHA', msg: message });
         } else if (results.length) {
            hash_pass = results[0].password;

            //compares hashed and unhashed passwrds to see if they match then return true if they are and false if they are not
            bcrypt.compare(unhash_pass, hash_pass, function (err, results) {
               if (err) {
                  message = err;
                  res.render('login', { page: 'MATCHA', menuId: 'MATCHA', msg: message });
               } else if (results) {
                  var sql = `SELECT id, firstname, lastname, username FROM users WHERE username = '${name}'`;
                  con.query(sql, function (err, results) {
                     if (err) {
                        message = err;
                        res.render('login', { page: 'MATCHA', menuId: 'MATCHA', msg: message });
                     } else {
                        sess.userId = results[0].id;
                        sess.user = results[0];
                        sess.loggedin = true;
                        con.query(`UPDATE users SET connection = "online" WHERE username ='${name}'`);
                        var sql = "SELECT*FROM `profiles` WHERE `userID` = '" + sess.userId + "'";
                        con.query(sql, function (err, results) {
                           if (results.length) {
                              sess.data = results[0];
                              var users = [];
                              if (sess.data.sexualpref == "male") {
                                 console.log("here")
                                 var sql = "SELECT * FROM profiles WHERE gender = 'male' AND sexualpref = '" + sess.data.gender + "' OR sexualpref ='both'";
                                 con.query(sql, function (err, results) {
                                    results.forEach(function (iterm) {
                                       users.push(iterm.userID);
                                       // console.log(users);
                                    })
                                    var sql = "SELECT * FROM locations WHERE user_id = '" + sess.userId + "'";
                                    con.query(sql, function (err, results) {
                                       // console.log(results);
                                       // console.log(users);
                                       if (err) throw err;
                                       var sql = "SELECT * FROM locations WHERE city = '" + results[0].city + "' AND user_id in (?)";
                                       con.query(sql, [[...users]], function (err, results) {
                                          // console.log(results);
                                          results.forEach(function (iterm) {
                                             users.push(iterm.id);
                                          })
                                          // console.log(users);
                                          var sql = "SELECT * FROM userinterest WHERE userId = '" + sess.userId + "'";
                                          con.query(sql, function (err, results) {
                                             var userinterests = results;
                                             const inteId = [];
                                             userinterests.forEach(function (iterm) {
                                                inteId.push(iterm.inteId);
                                             });
                                             // console.log(inteId);
                                             var sql = "SELECT * FROM interest WHERE id in (?)";
                                             con.query(sql, [[...inteId]], function (err, results) {
                                                var interest = results;
                                                const inte = [];
                                                interest.forEach(function (iterm) {
                                                   inte.push(iterm.name);
                                                });
                                                sess.post = inte;
                                                var sql = "SELECT* FROM userinterest WHERE inteId in (?)";
                                                console.log(users)
                                                // console.log(sql);
                                                con.query(sql, [[...inteId]], function (err, results) {
                                                   var peepz = results;
                                                   if (err) {
                                                      console.log(err);
                                                   }
                                                   peepz.forEach(function (iterm) {
                                                      users.push(iterm.userId);
                                                   })
                                                   // console.log(users);
                                                   var sql = "SELECT * FROM profiles  WHERE gender = 'male' AND sexualpref != 'female' AND userID in (?)"
                                                   con.query(sql, [[...users]], function (err, results) {
                                                      if (err) throw err;
                                                      // console.log(results);
                                                      const usrs = [];
                                                      results.forEach(function (iterm) {
                                                         usrs.push(iterm.userID);
                                                      })
                                                      var sql = "SELECT*FROM users WHERE id != '" + sess.userId + "' AND id in (?)";
                                                      con.query(sql, [[...usrs]], function (err, results) {
                                                         var suggest = results;
                                                         // console.log(suggest);
                                                         sess.suggest = suggest;
                                                         // console.log(sess.suggest);
                                                         res.render('homepage', { page: 'MATCHA', menuId: 'MATCHA', username: sess.user.username, data: sess.data, post: sess.post, suggest: sess.suggest });
                                                      })
                                                   })
                                                })
                                             })
                                          })
                                       })
                                    })
                                 })
                              }
                              else if (sess.data.sexualpref == "female") {
                                 var sql = "SELECT * FROM profiles WHERE gender = 'female' AND sexualpref = '" + sess.data.gender + "' OR sexualpref = 'both'";
                                 con.query(sql, function (err, results) {
                                    results.forEach(function (iterm) {
                                       users.push(iterm.userID);
                                    })
                                    var sql = "SELECT * FROM locations WHERE user_id = '" + sess.userId + "'";
                                    con.query(sql, function (err, results) {
                                       // console.log(results);
                                       // console.log(users);
                                       if (err) throw err;
                                       var sql = "SELECT * FROM locations WHERE city = '" + results[0].city + "' AND user_id in (?)";
                                       con.query(sql, [[...users]], function (err, results) {
                                          // console.log(results);
                                          results.forEach(function (iterm) {
                                             users.push(iterm.id);
                                          })
                                          // console.log(users);

                                          var sql = "SELECT * FROM userinterest WHERE userId = '" + sess.userId + "'";
                                          con.query(sql, function (err, results) {
                                             var userinterests = results;
                                             const inteId = [];
                                             userinterests.forEach(function (iterm) {
                                                inteId.push(iterm.inteId);
                                             });
                                             // console.log(inteId);
                                             var sql = "SELECT * FROM interest WHERE id in (?)";
                                             con.query(sql, [[...inteId]], function (err, results) {
                                                var interest = results;
                                                const inte = [];
                                                interest.forEach(function (iterm) {
                                                   inte.push(iterm.name);
                                                });
                                                sess.post = inte;
                                                var sql = "SELECT* FROM userinterest WHERE inteId in (?)";
                                                // console.log(sql);
                                                con.query(sql, [[...inteId]], function (err, results) {
                                                   var peepz = results;
                                                   if (err) {
                                                      console.log(err);
                                                   }
                                                   peepz.forEach(function (iterm) {
                                                      users.push(iterm.userId);
                                                   })
                                                   // console.log(users);
                                                   var sql = "SELECT * FROM profiles  WHERE gender != 'male' AND sexualpref != 'female' AND userID in (?)"
                                                   con.query(sql, [[...users]], function (err, results) {
                                                      if (err) throw err;
                                                      // console.log(results);
                                                      const usrs = [];
                                                      results.forEach(function (iterm) {
                                                         usrs.push(iterm.userID);
                                                         // console.log(usrs)
                                                      })
                                                      var sql = "SELECT*FROM users WHERE id != '" + sess.userId + "' AND id in (?)";
                                                      con.query(sql, [[...usrs]], function (err, results) {
                                                         var suggest = results;
                                                         // console.log(suggest);
                                                         sess.suggest = suggest;
                                                         // console.log(sess.suggest);
                                                         res.render('homepage', { page: 'MATCHA', menuId: 'MATCHA', username: sess.user.username, data: sess.data, post: sess.post, suggest: sess.suggest });
                                                      })
                                                   })
                                                })
                                             })
                                          })
                                       })
                                    })
                                 })
                              }
                              else {
                                 var sql = "SELECT * FROM profiles WHERE sexualpref = '" + sess.data.gender + "'";
                                 con.query(sql, function (err, results) {
                                    results.forEach(function (iterm) {
                                       users.push(iterm.userID);
                                       // console.log(users);
                                    })

                                    var sql = "SELECT * FROM locations WHERE user_id = '" + sess.userId + "'";
                                    con.query(sql, function (err, results) {
                                        console.log(results);
                                        console.log(users);
                                       if (err) throw err;
                                       var sql = "SELECT * FROM locations WHERE city = '" + results[0].city + "' AND user_id in (?)";
                                       con.query(sql, [[...users]], function (err, results) {
                                          // console.log(results);
                                        if(results) {  results.forEach(function (iterm) {
                                             users.push(iterm.id);
                                          })
                                       }
                                          // console.log(users);

                                          var sql = "SELECT * FROM userinterest WHERE userId = '" + sess.userId + "'";
                                          con.query(sql, function (err, results) {
                                             var userinterests = results;
                                             const inteId = [];
                                             userinterests.forEach(function (iterm) {
                                                inteId.push(iterm.inteId);
                                             });
                                             // console.log(inteId);
                                             var sql = "SELECT * FROM interest WHERE id in (?)";
                                             con.query(sql, [[...inteId]], function (err, results) {
                                                var interest = results;
                                                const inte = [];
                                                interest.forEach(function (iterm) {
                                                   inte.push(iterm.name);
                                                });
                                                sess.post = inte;
                                                var sql = "SELECT* FROM userinterest WHERE inteId in (?)";
                                                // console.log(users)
                                                // console.log(sql);
                                                con.query(sql, [[...inteId]], function (err, results) {
                                                   var peepz = results;
                                                   if (err) {
                                                      console.log(err);
                                                   }
                                                   peepz.forEach(function (iterm) {
                                                      users.push(iterm.userId);
                                                   })
                                                   // console.log(users);
                                                   var sql = "SELECT * FROM profiles WHERE userID in (?)"
                                                   con.query(sql, [[...users]], function (err, results) {
                                                      if (err) throw err;
                                                      // console.log(results);
                                                      const usrs = [];
                                                      results.forEach(function (iterm) {
                                                         usrs.push(iterm.userID);
                                                      })
                                                      // console.log(usrs);
                                                      var sql = "SELECT*FROM users WHERE id != '" + sess.userId + "' AND id in (?)";
                                                      con.query(sql, [[...usrs]], function (err, results) {
                                                         var suggest = results;
                                                         // console.log(suggest);
                                                         sess.suggest = suggest;
                                                         // console.log(sess.suggest);
                                                         res.render('homepage', { page: 'MATCHA', menuId: 'MATCHA', username: sess.user.username, data: sess.data, post: sess.post, suggest: sess.suggest });
                                                      })
                                                   })
                                                })
                                             })
                                          })
                                       })
                                    })
                                 })
                              }
                           }
                           else
                              res.render('homepage', { page: 'MATCHA', menuId: 'MATCHA', username: sess.user.username, data: sess.data, post: sess.post, suggest: [] });
                        });
                        // console.log(sess.userId);
                        // console.log(sess.user.firstname);
                     }
                  });
               } else {
                  message = 'invalid login details';
                  res.render('login', { page: 'MATCHA', menuId: 'MATCHA', msg: message });
               }
            });
         } else {
            message = 'invalid login details';
            res.render('login', { page: 'MATCHA', menuId: 'MATCHA', msg: message });
         }
      });
   } else {
      message = 'an error occured';
      res.render('login', { page: 'MATCHA', menuId: 'MATCHA', msg: message });
   }
};


//-----------------------------------------------profile update------------------------------------------------------

router.update = function (req, res) {
   var sess = req.session;
   // console.log(sess);
   var message = '';
   var data = sess.data;

   if (req.method == "POST") {

      // console.log("here");
      var post = req.body;
      var name = sanitizer.sanitize(post.user_name).trim();
      var fname = sanitizer.sanitize(post.first_name).trim();
      var lname = sanitizer.sanitize(post.last_name).trim();
      var email = sanitizer.sanitize(post.email).trim();
      var gender = sanitizer.sanitize(post.gender).trim();
      var sexualpref = sanitizer.sanitize(post.sexualpreference).trim();
      var biography = sanitizer.sanitize(post.biography[0]).trim();
      var extremeSport = post.extreme_sport;
      var outdoor = post.outdoor_activities;
      var geekSport = post.geek_sports;
      var foodie = post.foodie;
      var BDSM = post.BDSM;
      var otherinterest = sanitizer.sanitize(post.otherInterest).trim();
      var file = req.files;
      if (file) {
         var propic = req.files.avator;
         var image1 = req.files.image1;
         var image2 = req.files.image2;
         var image3 = req.files.image3;
         var image4 = req.files.image4;
      }

      // sess.post = req.body;
      // console.log(sess.post);


      var userID = sess.user.id;

      if (name) {
         var sql = "SELECT*FROM `users` WHERE `username`='" + name + "'";
         con.query(sql, function (err, results) {
            // console.log(results);
            if (!results.length) {

               var sql = "UPDATE `users` SET `username` ='" + name + "' WHERE id ='" + sess.user.id + "'";
               con.query(sql, function (err) {
                  var sql = "SELECT*FROM `users` WHERE id = '" + sess.user.id + "'";
                  con.query(sql, function (err, results) {
                     // console.log(results)
                     if (results.length) {
                        sess.userId = results[0].id;
                        sess.user = results[0];
                        sess.loggedin = true;
                        //  console.log("nothing helps");
                        // console.log(sess.user);
                        res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
                     }
                     else {
                        console.log(err)
                     }
                  });
                  if (err) { console.log(err) };
               })
            }
            else {
               message = "username already exist";
               console.log("username already exist");
               res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });

            }
         });
      }
      if (fname) {
         var sql = "UPDATE `users` SET `firstname` ='" + fname + "' WHERE id ='" + sess.user.id + "'";
         con.query(sql, function (err) {
            if (err) { console.log(err) };
         })
         var sql = "SELECT*FROM `users` WHERE id = '" + sess.user.id + "'";
         con.query(sql, function (err, results) {
            // console.log(results)
            if (results.length) {
               sess.userId = results[0].id;
               sess.user = results[0];
               sess.loggedin = true;
               //  console.log("nothing helps");
               // console.log(sess.user);
               res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
            }
            else {
               console.log(err)
            }
         });

      }
      if (lname) {
         var sql = "UPDATE `users` SET `lastname` ='" + lname + "' WHERE id ='" + sess.user.id + "'";
         con.query(sql, function (err) {
            if (err) { console.log(err) };
         })
         var sql = "SELECT*FROM `users` WHERE id = '" + sess.user.id + "'";
         con.query(sql, function (err, results) {
            // console.log(results)
            if (results.length) {
               sess.userId = results[0].id;
               sess.user = results[0];
               sess.loggedin = true;
               //  console.log("nothing helps");
               // console.log(sess.user);
               res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
            }
            else {
               console.log(err)
            }
         });
      }

      if (email) {
         var sql = "SELECT*FROM `users` WHERE `email`='" + email + "'";
         con.query(sql, function (err, results) {
            // console.log(results);
            if (!results.length) {

               var sql = "UPDATE `users` SET `email` ='" + email + "' WHERE id ='" + sess.user.id + "'";
               con.query(sql, function (err) {
                  if (err) { console.log(err) };
               })
               var sql = "SELECT*FROM `users` WHERE id = '" + sess.user.id + "'";
               con.query(sql, function (err, results) {
                  // console.log(results)
                  if (results.length) {
                     sess.userId = results[0].id;
                     sess.user = results[0];
                     sess.loggedin = true;
                     //  console.log("nothing helps");
                     // console.log(sess.user);
                     res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
                  }
                  else {
                     console.log(err)
                  }
               });
            }
            else {
               message = "email already exist";
               console.log("email already exist");
               res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });

            }
         });
      }

      if (extremeSport) {
         var sql = "SELECT* FROM `interest` WHERE  `name` = '" + extremeSport + "'"
         con.query(sql, function (err, result) {
            if (result.length) {
               // console.log(sess);
               var inteId = result[0].id;
               var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
               con.query(sql, function (err, result) {
                  if (err) {
                     console.log(err);
                  }
               });
            } else {
               var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + extremeSport + "')";
               con.query(sql, function (err, result) {
                  var inteId = result.insertId;
                  var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                  con.query(sql, function (err, result) {
                     if (err) {
                        console.log(err);
                     }
                  });
                  if (err) {
                     console.log(err);
                  }
               });
            }
            if (err) {
               console.log(err);
            }
         });
      }
      if (outdoor) {
         var sql = "SELECT* FROM `interest` WHERE  `name` = '" + outdoor + "'"
         con.query(sql, function (err, result) {
            if (result.length) {
               // console.log(sess);
               var inteId = result[0].id;
               var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
               con.query(sql, function (err, result) {
                  if (err) {
                     console.log(err);
                  }
               });
            } else {
               var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + outdoor + "')";
               con.query(sql, function (err, result) {
                  var inteId = result.insertId;
                  var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                  con.query(sql, function (err, result) {
                     if (err) {
                        console.log(err);
                     }
                  });
                  if (err) {
                     console.log(err);
                  }
               });
            }
            if (err) {
               console.log(err);
            }
         });
      }

      if (geekSport) {
         var sql = "SELECT* FROM `interest` WHERE  `name` = '" + geekSport + "'"
         con.query(sql, function (err, result) {
            if (result.length) {
               // console.log(sess);
               var inteId = result[0].id;
               var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
               con.query(sql, function (err, result) {
                  if (err) {
                     console.log(err);
                  }
               });
            } else {
               var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + geekSport + "')";
               con.query(sql, function (err, result) {
                  var inteId = result.insertId;
                  var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                  con.query(sql, function (err, result) {
                     if (err) {
                        console.log(err);
                     }
                  });
                  if (err) {
                     console.log(err);
                  }
               });
            }
            if (err) {
               console.log(err);
            }
         });
      }

      if (foodie) {
         var sql = "SELECT* FROM `interest` WHERE  `name` = '" + foodie + "'"
         con.query(sql, function (err, result) {
            if (result.length) {
               // console.log(sess);
               var inteId = result[0].id;
               var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
               con.query(sql, function (err, result) {
                  if (err) {
                     console.log(err);
                  }
               });
            } else {
               var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + foodie + "')";
               con.query(sql, function (err, result) {
                  var inteId = result.insertId;
                  var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                  con.query(sql, function (err, result) {
                     if (err) {
                        console.log(err);
                     }
                  });
                  if (err) {
                     console.log(err);
                  }
               });
            }
            if (err) {
               console.log(err);
            }
         });
      }

      if (BDSM) {
         var sql = "SELECT* FROM `interest` WHERE  `name` = '" + BDSM + "'"
         con.query(sql, function (err, result) {
            if (result.length) {
               // console.log(sess);
               var inteId = result[0].id;
               var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
               con.query(sql, function (err, result) {
                  if (err) {
                     console.log(err);
                  }
               });
            } else {
               var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + BDSM + "')";
               con.query(sql, function (err, result) {
                  var inteId = result.insertId;
                  var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                  con.query(sql, function (err, result) {
                     if (err) {
                        console.log(err);
                     }
                  });
                  if (err) {
                     console.log(err);
                  }
               });
            }
            if (err) {
               console.log(err);
            }
         });
      }

      if (otherinterest) {
         var sql = "SELECT* FROM `interest` WHERE  `name` = '" + otherinterest + "'"
         con.query(sql, function (err, result) {
            if (result.length) {
               // console.log(sess);
               var inteId = result[0].id;
               var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
               con.query(sql, function (err, result) {
                  if (err) {
                     console.log(err);
                  }
               });
            } else {
               var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + otherinterest + "')";
               con.query(sql, function (err, result) {
                  var inteId = result.insertId;
                  var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                  con.query(sql, function (err, result) {
                     if (err) {
                        console.log(err);
                     }
                  });
                  if (err) {
                     console.log(err);
                  }
               });
            }
            if (err) {
               console.log(err);
            }
         });
      }

      if (gender && sexualpref && biography) {
         // var userID = sess.user.userID;
         // console.log(userID) ;
         var sql = "INSERT INTO `profiles` (`userID`,`gender`,`sexualpref`,`biography`) VALUES ( '" + userID + "','" + gender + "','" + sexualpref + "','" + biography + "')";

         var query = con.query(sql, function (err, result) {
            if (err) throw err;
            var sql = "UPDATE users SET gender = '" + gender + "' WHERE  id = '" + userID + "'";
            con.query(sql, function (err, result) {
               if (err) throw err;
            })
         });
         var sql = "SELECT `id` FROM `profiles` WHERE userId = '" + userID + "'";
         con.query(sql, function (err, results) {
            // console.log(results)
            if (results.length) {
               sess.profileId = results[0].id;
               var profileId = sess.profileId;
               // // console.log(profileId);            

               // var propic = post.avator;
               if (propic) {
                  var avator = propic.name;
                  // console.log(propic);
                  if (propic.mimetype == "image/jpeg" || propic.mimetype == "image/png" || propic.mimetype == "image/gif") {
                     propic.mv('public/images/upload_images/' + propic.name, function (err) {
                        if (err)
                           return res.status(500).send(err);
                        var sql = "UPDATE `profiles` SET `avator` = '" + avator + "' WHERE `id` = '" + profileId + "'";

                        var query = con.query(sql, function (err, result) {
                           var sql = "UPDATE `users` SET `avator` = '" + avator + "' WHERE `id` = '" + userID + "'";
                           con.query(sql, function (err, results) {
                           })
                           // res.redirect('profile/'+result.insertId);
                        });
                     });
                  } else {
                     message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
                     //  res.render('index.ejs',{message: message});
                  }
               }

               if (image1) {
                  var pic1 = image1.name;
                  // console.log(propic);
                  if (image1.mimetype == "image/jpeg" || image1.mimetype == "image/png" || image1.mimetype == "image/gif") {
                     image1.mv('public/images/upload_images/' + image1.name, function (err) {
                        if (err)
                           return res.status(500).send(err);
                        var sql = "UPDATE `profiles` SET `image1` = '" + pic1 + "' WHERE `id` = '" + profileId + "'";

                        var query = con.query(sql, function (err, result) {
                           // res.redirect('profile/'+result.insertId);
                        });
                     });
                  } else {
                     message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
                     //  res.render('index.ejs',{message: message});
                  }
               }
               if (image2) {
                  var pic2 = image2.name;
                  // console.log(propic);
                  if (image2.mimetype == "image/jpeg" || image2.mimetype == "image/png" || image2.mimetype == "image/gif") {
                     image2.mv('public/images/upload_images/' + image2.name, function (err) {
                        if (err)
                           return res.status(500).send(err);
                        var sql = "UPDATE `profiles` SET `image2` = '" + pic2 + "' WHERE `id` = '" + profileId + "'";

                        var query = con.query(sql, function (err, result) {
                           // res.redirect('profile/'+result.insertId);
                        });
                     });
                  } else {
                     message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
                     //  res.render('index.ejs',{message: message});
                  }
               }

               if (image3) {
                  var pic3 = image3.name;
                  // console.log(propic);
                  if (image3.mimetype == "image/jpeg" || image3.mimetype == "image/png" || image3.mimetype == "image/gif") {
                     image3.mv('public/images/upload_images/' + image3.name, function (err) {
                        if (err)
                           return res.status(500).send(err);
                        var sql = "UPDATE `profiles` SET `image3` = '" + pic3 + "' WHERE `id` = '" + profileId + "'";

                        var query = con.query(sql, function (err, result) {
                           // res.redirect('profile/'+result.insertId);
                        });
                     });
                  } else {
                     message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
                     //  res.render('index.ejs',{message: message});
                  }
               }

               if (image4) {
                  var pic4 = image4.name;
                  // console.log(propic);
                  if (image4.mimetype == "image/jpeg" || image4.mimetype == "image/png" || image4.mimetype == "image/gif") {
                     image4.mv('public/images/upload_images/' + image4.name, function (err) {
                        if (err)
                           return res.status(500).send(err);
                        var sql = "UPDATE `profiles` SET `image4` = '" + pic4 + "' WHERE `id` = '" + profileId + "'";

                        var query = con.query(sql, function (err, result) {
                           // res.redirect('profile/'+result.insertId);
                        });
                        var sql = "SELECT*FROM `profiles` WHERE `id` = '" + profileId + "'";
                        var query = con.query(sql, function (err, results) {
                           if (results.length) {
                              sess.data = results[0];
                              //   console.log(sess);
                              //   alert("profile updated");
                              res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
                           }
                        })
                     });
                  } else {
                     message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
                     //  res.render('index.ejs',{message: message});
                  }

               }

            }
            else {
               console.log(err)
            }
         });
         // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , userId : sess.userId, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data});

      }
      // console.log(sess.data);
      // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , userId : sess.userId, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data});
   }
   else
      res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
};

//-----------------------------------------------profile update2------------------------------------------------------
router.update2 = function (req, res) {
   var sess = req.session;
   // console.log(sess);
   var message = '';
   var data = sess.data;

   if (req.method == "POST") {

      // console.log("here");
      var post = req.body;
      var gender = post.gender;
      var sexualpref = sanitizer.sanitize(post.sexualpreference).trim();
      var biography = sanitizer.sanitize(post.biography[0]).trim();
      var extremeSport = post.extreme_sport;
      var outdoor = post.outdoor_activities;
      var geekSport = post.geek_sports;
      var foodie = post.foodie;
      var BDSM = post.BDSM;
      var otherinterest = sanitizer.sanitize(post.otherInterest).trim();
      var file = req.files;
      if (file) {
         var propic = req.files.avator;
         var image1 = req.files.image1;
         var image2 = req.files.image2;
         var image3 = req.files.image3;
         var image4 = req.files.image4;
      };

      var profileId = sess.data.id;
      if (gender) {
         var sql = "UPDATE `profiles` SET `gender` ='" + gender + "' WHERE id ='" + profileId + "'";
         con.query(sql, function (err, results) {
            var sql = "SELECT*FROM `profiles` WHERE `userID` = '" + sess.userId + "'";
            con.query(sql, function (err, results) {
               if (results.length) {
                  sess.data = results[0];
                  // console.log(typeof sess.data)
                  res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
               }
               else
                  res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
            });
         })
      }

      if (sexualpref) {
         var sql = "UPDATE `profiles` SET `sexualpref` ='" + sexualpref + "' WHERE id ='" + profileId + "'";
         con.query(sql, function (err, results) {
            var sql = "SELECT*FROM `profiles` WHERE `userID` = '" + sess.userId + "'";
            con.query(sql, function (err, results) {
               if (results.length) {
                  sess.data = results[0];
                  // console.log(typeof sess.data)
                  res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
               }
               else
                  res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
            });
         })

      }

      if (biography) {
         var sql = "UPDATE `profiles` SET `biography` ='" + biography + "' WHERE id ='" + profileId + "'";
         con.query(sql, function (err, results) {
            var sql = "SELECT*FROM `profiles` WHERE `userID` = '" + sess.userId + "'";
            con.query(sql, function (err, results) {
               if (results.length) {
                  sess.data = results[0];
                  // console.log(typeof sess.data)
                  res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
               }
               else
                  res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
            });
         })
      }

      if (extremeSport || outdoor || geekSport || foodie || BDSM || otherinterest) {
         var sql = "DELETE FROM userinterest WHERE  userID = '" + sess.userId + "'";
         con.query(sql, function (err, result) {
            if (extremeSport) {
               var sql = "SELECT* FROM `interest` WHERE  `name` = '" + extremeSport + "'"
               con.query(sql, function (err, result) {
                  if (result.length) {
                     // console.log(sess);
                     var inteId = result[0].id;
                     var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                     con.query(sql, function (err, result) {
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                     });
                  } else {
                     var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + extremeSport + "')";
                     con.query(sql, function (err, result) {
                        var inteId = result.insertId;
                        var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                        con.query(sql, function (err, result) {
                           if (err) {
                              console.log(err);
                           }
                           // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                        });
                        if (err) {
                           console.log(err);
                        }
                     });
                  }
                  if (err) {
                     console.log(err);
                  }
               });
            }
            if (outdoor) {
               var sql = "SELECT* FROM `interest` WHERE  `name` = '" + outdoor + "'"
               con.query(sql, function (err, result) {
                  if (result.length) {
                     // console.log(sess);
                     var inteId = result[0].id;
                     var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                     con.query(sql, function (err, result) {
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                     });
                  } else {
                     var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + outdoor + "')";
                     con.query(sql, function (err, result) {
                        var inteId = result.insertId;
                        var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                        con.query(sql, function (err, result) {
                           if (err) {
                              console.log(err);
                           }
                        });
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                     });
                  }
                  if (err) {
                     console.log(err);
                  }
               });
            }

            if (geekSport) {
               var sql = "SELECT* FROM `interest` WHERE  `name` = '" + geekSport + "'"
               con.query(sql, function (err, result) {
                  if (result.length) {
                     // console.log(sess);
                     var inteId = result[0].id;
                     var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                     con.query(sql, function (err, result) {
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                     });
                  } else {
                     var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + geekSport + "')";
                     con.query(sql, function (err, result) {
                        var inteId = result.insertId;
                        var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                        con.query(sql, function (err, result) {
                           if (err) {
                              console.log(err);
                           }
                        });
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                     });
                  }
                  if (err) {
                     console.log(err);
                  }
               });
            }

            if (foodie) {
               var sql = "SELECT* FROM `interest` WHERE  `name` = '" + foodie + "'"
               con.query(sql, function (err, result) {
                  if (result.length) {
                     // console.log(sess);
                     var inteId = result[0].id;
                     var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                     con.query(sql, function (err, result) {
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});                         
                     });
                  } else {
                     var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + foodie + "')";
                     con.query(sql, function (err, result) {
                        var inteId = result.insertId;
                        var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                        con.query(sql, function (err, result) {
                           if (err) {
                              console.log(err);
                           }
                        });
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                     });
                  }
                  if (err) {
                     console.log(err);
                  }
               });
            }

            if (BDSM) {
               var sql = "SELECT* FROM `interest` WHERE  `name` = '" + BDSM + "'"
               con.query(sql, function (err, result) {
                  if (result.length) {
                     // console.log(sess);
                     var inteId = result[0].id;
                     var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                     con.query(sql, function (err, result) {
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                     });
                  } else {
                     var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + BDSM + "')";
                     con.query(sql, function (err, result) {
                        var inteId = result.insertId;
                        var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                        con.query(sql, function (err, result) {
                           if (err) {
                              console.log(err);
                           }
                        });
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                     });
                  }
                  if (err) {
                     console.log(err);
                  }
               });
            }

            if (otherinterest) {
               var sql = "SELECT* FROM `interest` WHERE  `name` = '" + otherinterest + "'"
               con.query(sql, function (err, result) {
                  if (result.length) {
                     // console.log(sess);
                     var inteId = result[0].id;
                     var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                     con.query(sql, function (err, result) {
                        if (err) {
                           console.log(err);
                        }
                        // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});                         
                     });
                  } else {
                     var sql = "INSERT INTO  `interest` (`name`) VALUES ( '" + otherinterest + "')";
                     con.query(sql, function (err, result) {
                        var inteId = result.insertId;
                        var sql = "INSERT INTO  `userinterest` (`userId`, `inteId`) VALUES ( '" + sess.userId + "', '" + inteId + "')";
                        con.query(sql, function (err, result) {
                           if (err) {
                              console.log(err);
                           }
                        });
                        if (err) {
                           console.log(err);
                        }
                     });
                     // res.render('profile', {page:'MATCHA', menuId:'MATCHA' , post : sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data : sess.data});
                  }
                  if (err) {
                     console.log(err);
                  }
               });
            }
            res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
         })

      }
      if (file) {
         if (propic) {
            var avator = propic.name;
            // console.log(propic);
            if (propic.mimetype == "image/jpeg" || propic.mimetype == "image/png" || propic.mimetype == "image/gif") {
               propic.mv('public/images/upload_images/' + propic.name, function (err) {
                  if (err)
                     return res.status(500).send(err);
                  var sql = "UPDATE `profiles` SET `avator` = '" + avator + "' WHERE `id` = '" + profileId + "'";

                  var query = con.query(sql, function (err, result) {
                     // res.redirect('profile/'+result.insertId);
                  });
               });
            } else {
               message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
               //  res.render('index.ejs',{message: message});
            }
         }

         if (image1) {
            var pic1 = image1.name;
            // console.log(propic);
            if (image1.mimetype == "image/jpeg" || image1.mimetype == "image/png" || image1.mimetype == "image/gif") {
               image1.mv('public/images/upload_images/' + image1.name, function (err) {
                  if (err)
                     return res.status(500).send(err);
                  var sql = "UPDATE `profiles` SET `image1` = '" + pic1 + "' WHERE `id` = '" + profileId + "'";

                  var query = con.query(sql, function (err, result) {
                     // res.redirect('profile/'+result.insertId);
                  });
               });
            } else {
               message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
               //  res.render('index.ejs',{message: message});
            }
         }
         if (image2) {
            var pic2 = image2.name;
            // console.log(propic);
            if (image2.mimetype == "image/jpeg" || image2.mimetype == "image/png" || image2.mimetype == "image/gif") {
               image2.mv('public/images/upload_images/' + image2.name, function (err) {
                  if (err)
                     return res.status(500).send(err);
                  var sql = "UPDATE `profiles` SET `image2` = '" + pic2 + "' WHERE `id` = '" + profileId + "'";

                  var query = con.query(sql, function (err, result) {
                     // res.redirect('profile/'+result.insertId);
                  });
               });
            } else {
               message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
               //  res.render('index.ejs',{message: message});
            }
         }

         if (image3) {
            var pic3 = image3.name;
            // console.log(propic);
            if (image3.mimetype == "image/jpeg" || image3.mimetype == "image/png" || image3.mimetype == "image/gif") {
               image3.mv('public/images/upload_images/' + image3.name, function (err) {
                  if (err)
                     return res.status(500).send(err);
                  var sql = "UPDATE `profiles` SET `image3` = '" + pic3 + "' WHERE `id` = '" + profileId + "'";

                  var query = con.query(sql, function (err, result) {
                     // res.redirect('profile/'+result.insertId);
                  });
               });
            } else {
               message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
               //  res.render('index.ejs',{message: message});
            }
         }

         if (image4) {
            var pic4 = image4.name;
            // console.log(propic);
            if (image4.mimetype == "image/jpeg" || image4.mimetype == "image/png" || image4.mimetype == "image/gif") {
               image4.mv('public/images/upload_images/' + image4.name, function (err) {
                  if (err)
                     return res.status(500).send(err);
                  var sql = "UPDATE `profiles` SET `image4` = '" + pic4 + "' WHERE `id` = '" + profileId + "'";

                  var query = con.query(sql, function (err, result) {
                     // res.redirect('profile/'+result.insertId);
                  });
                  var sql = "SELECT*FROM `profiles` WHERE `id` = '" + profileId + "'";
                  var query = con.query(sql, function (err, results) {
                     if (results.length) {
                        sess.data = results[0];
                        //   console.log(sess);
                        //   alert("profile updated");
                        res.render('profile', { page: 'MATCHA', menuId: 'MATCHA', post: sess.post, firstname: sess.user.firstname, lastname: sess.user.lastname, username: sess.user.username, message: message, data: sess.data });
                     }
                  })
               });
            } else {
               message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
               //  res.render('index.ejs',{message: message});
            }

         }

      }

   }
};


module.exports = router;
