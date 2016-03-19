/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var port = process.env.port || 1337;

app.listen(port);

function handler(req, res) {
    fs.readFile(req.uri,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.on('connection', function (socket) {
	socket.on('get', function(data){
		socket.emit("data", {data:"test"});
	});
});

