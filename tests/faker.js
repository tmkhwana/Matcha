const faker = require('faker');

// const user = [
//     faker.name.findName(),
//     faker.name.firstName(),
//     faker.name.lastName(),
//     faker.internet.email(),
//     // faker.date.past()
// ];

// const profile = [
//     //result.insertId,
//     ['Male', 'Female'][ft_ranint(1)],
//     ['Male', 'Female', 'Both'][ft_ranint(2)],
//     faker.lorem.sentence()

// ];

// console.log(user);




console.log("INSERT INTO 'users' ('username', 'firstname', 'lastname', 'email', 'password', 'active', 'vcode') VALUES");
var id = 10;
function fakeruser(){
var uname = faker.name.findName();
var fname = faker.name.firstName();
var lname = faker.name.lastName();
var email = faker.internet.email();
var passwprd = "Password1";
var active = 0;
var vcode = "NULL";

console.log("('"+ uname.replace(/\s/g, '') + "', '"+ fname +"', '" + lname + "', '" 
+ email +"', '" + passwprd +"', " + active + " , " + vcode + " ),");

}
var  count = 0;
while (count < 5){
    fakeruser();
    id++;
    count++;
}