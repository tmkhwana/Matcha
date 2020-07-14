const fs 		= require('fs'),
      util 		= require('util'),
      dbc 	    = require('./connection.js');
    //   dbc = require('../models/connection.js');
    //   users 	= require('../model/credentials.js'),
    //   ft_util 	= require('../includes/ft_util.js');

// dbc = mysql.createConnection({
// 	host		: 'localhost',
// 	user 		: 'root',
//     password	: 'lmnyamen',
//     socketPath: "/goinfre/lmnyamen/Desktop/MAMP/mysql/tmp/mysql.sock"
// });

// dbc.connect((err) => {
// 	if (err) throw err;
	fs.readFile('./setup.sql', 'utf8', (err, data) => {
        if (err) throw err;
        //test
        // console.log(data);
        // return;
        //endof test

		data.trim().split(';').forEach((value, index, arr) => {
			dbc.query(value, (err, result) => {
				if (err) throw err;
				if (index === arr.length - 1) {
					console.log("Created matcha database");
					console.log("Inserting profiles...");
					// require('./profile_generator.js');
				}
			});
		});
	});
// });