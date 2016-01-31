//Using Express.js for frontend
var app = require('express')();

//Static files served through the webfiles directory
var express = require('express');
app.use(express.static('webfiles'));
app.use('/box', express.static(__dirname + '/webfiles'));

//Storing user data in postgres
var pg = require('pg');
var connection = "postgres://postgres:mydemo@localhost/little9678booth";

//Password encryption is SHA 512
var sha512 = require('js-sha512');

//Sessions
var session = require('express-session');
app.use(session({ secret: 'bueno', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }));

//Read POST data for accounts
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Binding HTTP to this app server
var http = require('http').Server(app);

//Using socket.io for single page app
var io = require('socket.io')(http);

//Creates new account
function newAccount(emailAddress, password, callback){	
	pg.connect(connection, function(error, conn, cb) {
	  conn.query('INSERT INTO Users (emailAddress, password) VALUES ($1, $2)', [emailAddress, password], function(error, res) {
	    //May fail if email not unique
		if(error){
			if(error.code == '23505'){
				callback(1, cb);
			}
		}
		else{
			callback(0, cb);
		}
	  });
	});
}

//Logs the user in
function login(emailAddress, password, req, callback){
	pg.connect(connection, function(error, conn, cb) {
	  conn.query('SELECT userID FROM Users WHERE emailAddress = $1 AND password = $2 LIMIT 1', [emailAddress, password], function(error, res) {
		if(res.rows.length > 0){
			req.session.user = res.rows[0].userid;
			callback(0, cb);
		}
		else{
			callback(1, cb);
		}
	  });
	});
}

//Sets access level depending on who's logged in
function setAccessLevel(boxName, req){
	pg.connect(connection, function(error, conn, cb) {
	  conn.query('SELECT accessLevel FROM Access WHERE boxID IN (SELECT boxID FROM Boxes WHERE boxName = $1) AND userID = $2', [boxName, req.session.user], function(error, res) {
		cb();
		if(result.rows.length > 0){
			req.session.access = result.rows[0].accesslevel;
			return 0;
		}
		else{
			return 1;
		}
	  });
	});
}

//Logs user out
function logout(req){
	req.session = null;
}

//Serves the initial landing page
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//Serves the index.html page, the main page of the app
app.get('/index', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//Serves the login page
app.get('/login', function(req, res){
	res.sendFile(__dirname + '/login.html');
});

//Serves the account creation page
app.get('/createaccount', function(req, res){
	res.sendFile(__dirname + '/createaccount.html');
});

//When a user logs in, credentials are checked here
app.post('/login', function(req, res){
	hashedPass = sha512(req.body.password);
	login(req.body.emailAddress, hashedPass, req, function(rc, cb){
		if(rc == 0){
				res.redirect("/index");
		}
		else{
				res.redirect("/login");
		}		
		cb();
	});
});

//When a user creates an account, they are either successful or unsuccessful at this check
app.post('/createaccount', function(req, res){
	if(req.body.password == req.body.confirmPassword){
		hashedPass = sha512(req.body.password);
		newAccount(req.body.emailAddress, hashedPass, function(rc, cb){
			if(rc == 0){
					res.redirect("/login");
			}
			else{
					res.redirect("/createaccount");
			}
			cb();
		});
	}
	else{
		res.redirect("/createaccount");
	}
});

//Get the specific box and set the access level too depending on the user
app.get('/box/:boxname', function(req, res){
	//setAccessLevel();
	//console.log(req.params.boxname);
	res.setHeader('Set-Cookie', 'Box=' + req.params.boxname);
	res.sendFile(__dirname + '/index.html');
});

//404 default
app.use(function(req, res, next) {
  res.status(404).sendFile(__dirname + '/404.html');
});

//When a new user connects...
//Contains all events
io.on('connection', function(socket){
	//A new piece of data is added!
	socket.on('newCharacter', function(msg){
		io.emit('newCharacter', msg);
		console.log('newchar: ' + msg);
	});
});

//Runs the server.
http.listen(80, function(){
	console.log('The Data Tutorial app is up and running!');
});