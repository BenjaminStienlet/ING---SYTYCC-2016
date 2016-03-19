/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var app = require('http').createServer(requestHandler);
var io = require('socket.io')(app);
var fs = require('fs');
var port = process.env.port || 1337;
var path = require('path');



app.listen(port);


//helper function handles file verification
function getFile(filePath,res,page404){
	//does the requested file exist?
	
			//read the fiule, run the anonymous function
			fs.readFile(filePath,function(err,contents){
				if(!err){
					//if there was no error
					//send the contents with the default 200/ok header
					res.end(contents);
				} else {
					//for our own troubleshooting
					console.dir(err);
				};
			});
		
	});
};
 
//a helper function to handle HTTP requests
function requestHandler(req, res) {
	var
	fileName = path.basename(req.url) || 'index.html',
	page404 =  '404.html';
 
	//call our helper function
	//pass in the path to the file we want,
	//the response object, and the 404 page path
	//in case the requestd file is not found
	getFile(fileName,res,page404);
};
	

io.on('connection', function (socket) {
	socket.on('get', function(data){
		socket.emit("data", {data:"test"});
	});
});

