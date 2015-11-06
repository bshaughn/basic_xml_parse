
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var basicXMLParse = require('./basic-xml-parse.js').basicXMLParse;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/xml-input.html');
});

io.on('connection', function(socket){
	socket.on('toParse', function(msg){
		console.log(__filename + " started parse on " + msg);
		io.emit('parsedData', basicXMLParse(msg));
		console.log("finished parse\n");
  })
	.on('sign-on', function(){
		console.log('User connected');
	});
});

http.listen(8081, function(){
	console.log('listening on *.8081');
});