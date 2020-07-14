var express = require('express');
var router = express.Router();

router.login = function(req, res){
   var message;
   var sess = req.session; 

   // if (sess.loggedin){   
   //    res.render('homepage', {page:'MATCHA', menuId:'MATCHA', username : sess.user.username, data: sess.data});
   // }

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.username;
      var unhash_pass= post.password;
     
      var sql = `SELECT password FROM users WHERE username = '${name}' AND active = 1`;

      //gets the hashed password using the username
      con.query(sql, function(err, results){
         var hash_pass;
         if (err){
            message = err;
            res.render('login', {page: 'MATCHA', menuId:'MATCHA', msg: message});
         } else if (results.length){
            hash_pass = results[0].password;

            //compares hashed and unhashed passwrds to see if they match then return true if they are and false if they are not
            bcrypt.compare(unhash_pass, hash_pass, function(err, results) {
               if (err){
                  message = err;
                  res.render('login', {page: 'MATCHA', menuId:'MATCHA', msg: message});
               } else if (results){
                  var sql = `SELECT id, firstname, lastname, username FROM users WHERE username = '${name}'`;
                  con.query(sql, function(err, results){
                     if (err){
                        message = err;
                        res.render('login', {page: 'MATCHA', menuId:'MATCHA', msg: message});
                     } else {
                        sess.userId = results[0].id;
                        sess.user = results[0];
                        sess.loggedin = true;
                        var sql = "SELECT*FROM `profiles` WHERE `userID` = '" + sess.userId + "'";
                        con.query(sql, function (err, results) {
                           if (results.length) {
                              sess.data = results[0];
                              if (sess.data.sexualpref == "male") {
                                 //console.log("here")
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
                                                //console.log(users)
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
                  res.render('login', {page: 'MATCHA', menuId:'MATCHA', msg: message});
               }
            });
         } else {
            message = 'invalid login details';
            res.render('login', {page: 'MATCHA', menuId:'MATCHA', msg: message});
         }
      });
   } else {
      message = 'an error occured';
      res.render('login', {page: 'MATCHA', menuId:'MATCHA', msg: message});
   }
};

 //-----------------------------------------------profile update------------------------------------------------------
 router.login = function (req, res) {
   // console.log("log in here");
   var message = '';
   var sess = req.session;

   if (req.method == "POST") {
      var post = req.body;
      var name = post.username;
      var pass = post.password;

      if (sess.loggedin) {
         if (!sess.suggest)
            sess.suggest = [];
         // res.render('homepage', {page:'MATCHA', menuId:'MATCHA', username : sess.user.username, data: sess.data});
         res.render('homepage', { page: 'MATCHA', menuId: 'MATCHA', username: sess.user.username, data: sess.data, post: sess.post, suggest: sess.suggest });

      }

      const users = [];
      var sql = "SELECT id, firstname, lastname, username FROM `users` WHERE `username`='" + name + "' and password = '" + pass + "'";
      con.query(sql, function (err, results) {
         if (results.length) {
            sess.userId = results[0].id;
            sess.user = results[0];
            sess.loggedin = true;
            var sql = "SELECT*FROM `profiles` WHERE `userID` = '" + sess.userId + "'";
            con.query(sql, function (err, results) {
               if (results.length) {
                  sess.data = results[0];
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
         else {
            message = 'Wrong Credentials.';
            // res.render('index.ejs',{message: message});
            res.render('index', { page: 'MATCHA', menuId: 'MATCHA', msg: message });

         }

      });
   } else {
      // res.render('index.ejs',{message: message});
      res.render('index', { page: 'MATCHA', menuId: 'MATCHA', msg: message });

   }

};

module.exports = router;
