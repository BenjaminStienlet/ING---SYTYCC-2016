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



 
//a helper function to handle HTTP requests
function requestHandler(req, res) {
	var fileName = path.basename(req.url) || 'index.html';
 
		fs.readFile(fileName,function(err,contents){
				if(!err){
					//if there was no error
					//send the contents with the default 200/ok header
					res.writeHead(200);
					res.end(contents);
				} else {
					//for our own troubleshooting
					console.dir(err);
					res.writeHead(404);
					res.end("404 Not Found");
				};
			});
};
	

io.on('connection', function (socket) {
	socket.on('get', function(data){		
		socket.emit("data", {data:"test"});
	});
	
	//login(username) -> uid
    socket.on('login', function(data){
		socket.emit("loginResult", {uid:"LoginOK"});
	});
	
	//getUserInfo(uid)  -> name, pictureid, amount
	socket.on('getUserInfo', function(data){
		socket.emit("getUserInfoResult", {name:"GetUserDataOK", pictureid:"003", amount:"9999"});
	});
	
	//buyStock(sid, amount) -> boolean : buyStockResult
	socket.on('buyStock', function(data){
		socket.emit("buyStockResult", {buyStockSucceeded:"trueBuyStockTest"});
	});
	
	//getStocks() -> [strings] : stocksList
	socket.on('getStocks', function(data){
		socket.emit("getStocksResult", {stocksList : [string1 : "stockName1", string2 : "stockName2"]});
	});
	
	//getAchievement() -> [achievement] : listOfAchievements
	socket.on('getAchievement', function(data){
		socket.emit("getAchievementResult", {achievementSucceeded:"trueAchievementTest"});
	});
	
	//achieveAhievement(aid) -> ?
	//getHistoryForStock(sid) -> ?
	//getLeaderBoard() -> [name] : namesList, [amount] : valuesList
	//getFriendsList(uid) -> [name] : namesList
	//getProfile(uid) -> ?
	//getNewsFeed() -> ? 				// enkel relevante artikels of alles?
});

