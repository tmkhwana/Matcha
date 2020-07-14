const faker = require('faker'),
	//   util 			= require('util'),
	con = require('../models/connection.js'),
	//   ft_util 		= require('../includes/ft_util.js'),
	count = 100;

function generate_user(i) {
	if (i === count) {
		console.log('Inserted ' + count + ' profile records.');
		process.exit();
	}

	function ranint(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
	const user = [
		faker.name.findName().replace(/\s/g, ''),				//0
		faker.name.firstName(),				//1
		faker.name.lastName(),				//2
		faker.internet.email(),				//3
		'Password1',							//4
		'1',
		faker.date.between('1940-01-01', '2002-12-31'),	//5
		ranint(100) + '%',
		'online' 
	];
	//console.log(user);
	let sql = "SELECT id FROM users WHERE username = ? OR email = ?",
		id;

	con.query(sql, [user[0], user[3]], (err, result) => {
		if (err) throw err;
		if (result.length > 0) {
			console.log('Username or email already exists');
			generate_user(i);
			return;
		}
		sql = "INSERT INTO users (username, firstname, lastname, email, password, active, birthdate, fame, connection) VALUES (?)";
		con.query(sql, [[...user]], (err, result) => {
			if (err) throw err;
			id = result.insertId;
			sql = "SELECT *, YEAR(CURDATE()) -YEAR(birthdate) -IF(STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(birthdate), '-', DAY(birthdate)) ,'%Y-%c-%e') > CURDATE(), 1, 0)AS age FROM users WHERE id = '" + id + "'";
			con.query(sql, function (err, result) {
				if (err) throw err;
				//   console.log(result);
				sql = "UPDATE users SET age = '" + result[0].age + "' WHERE id = '" + result[0].id + "'";
				con.query(sql, function (err, result) {
					if (err) throw err;
				})
			})
			sql = "INSERT INTO profiles (userID, gender, sexualpref, biography, avator, image1, image2, image3, image4) VALUES (?)";
			con.query(sql, [[
				id,
				['female', 'male', 'female', 'male'][ranint(3)],		//3
				['both', 'female', 'male'][ranint(2)],	//4
				faker.lorem.sentence(),
				['42.png', 'dog.png', 'test2.jpg', 'test3.jpg', 'lona.png'][ranint(4)],	//4	
				['42.png', 'dog.png', 'test2.jpg', 'test3.jpg', 'lona.png'][ranint(4)],	//4	
				['42.png', 'dog.png', 'test2.jpg', 'test3.jpg', 'lona.png'][ranint(4)],	//4	
				['42.png', 'dog.png', 'test2.jpg', 'test3.jpg', 'lona.png'][ranint(4)],	//4	
				['42.png', 'dog.png', 'test2.jpg', 'test3.jpg', 'lona.png'][ranint(4)],	//4	

			]], (err, result) => {
				if (err) throw err;
				// console.log(result);
				sql = "SELECT avator, gender FROM profiles WHERE id = '" + result.insertId + "'";
				con.query(sql, function (err, result) {
					if (err) throw err;
					// console.log(result)
					sql = "UPDATE `users` SET `avator` ='" + result[0].avator + "', gender ='" + result[0].gender + "' WHERE id ='" + id + "'";
					con.query(sql, function (err, result) {
						if (err) throw err
					})

				})
				// exit();
				sql = "INSERT INTO locations (user_id,  longitude, latitude, streetName, city, postal_code) VALUES (?)";
				con.query(sql, [[
					id,
					faker.address.longitude(countryCode = "ZA"),
					faker.address.latitude(countryCode = "ZA"),
					faker.address.streetName(countryCode = "ZA"),
					['johannesburg', 'Cape Town', 'Pretoria', 'Durban', 'Bloemfontein', 'Port Elizabeth'][ranint(5)],
					// faker.address.state(),
					faker.address.zipCode(countryCode = "2001"),
				]], (err, result) => {
					if (err) throw err;
					sql = "SELECT city FROM locations WHERE id ='" + result.insertId + "'";
					con.query(sql, function (err, result) {
						if (err) throw err;
						sql = "UPDATE  users SET city = '" + result[0].city + "' WHERE id ='" + id + "'";
						con.query(sql, function (err, result) {
							if (err) throw err;

							sql = "INSERT INTO userinterest (userId, inteId) VALUES (?)";
							con.query(sql, [[
								id,
								ranint(13),
							]], (err, result) => {
								if (err) throw err;
								generate_user(i + 1);
							});
						});
					});
				});
			});
		});
	});
}
generate_user(0);