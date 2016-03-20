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
var db = require('./db');
var socketList = [];



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
		//socket.emit("loginResult", {uid : 1});
		//socketList.push(socket);
		db.login(data.username,socket);
			//socketList[0].emit("loginResult", {uid : res.uid});
			//socket.emit("loginResult", {"uid": res.uid});
			//socketList.pop();
		//});
		//socket.emit("loginResult", {uid : "LoginOK"});

	});
	
	//getUserInfo(uid)  -> name, pictureid, amount
	socket.on('getUserInfo', function(data){
		console.log("++++++ getUserInfoResult");
		socketList.push(socket);
		db.getUserInfo(data.uid, function(res){ 
			socketList[0].emit("getUserInfoResult", {name : res.name, pictureid : res.pictureid, amount: res.amount});
			//socketList.pop();
		});
		
		console.log("------ getUserInfoResult");
		//var = getUserInfo();
		//socket.emit("getUserInfoResult", {name:"GetUserDataOK", pictureid:"003", amount:"9999"});
	});
	
	//buyStock(uid, sid, amount) -> boolean : buyStockResult
	socket.on('buyStock', function(data){
		//TODO: checken of ge genoeg geld hebt => nog functie voor nodig in db.js
		var price = 99; //opzoeken
		//var timestamp = Date.now() / 1000 | 0;
		var enoughMoney = true;
		if(enoughMoney){
			db.buytStocks(data.uid, stockId, Date.now() / 1000 | 0, price, data.amount); //TIMESTAMP OPVRAGEN, amount is het AANTAL STOCKS
		}
		else{
			socket.emit("buyStocksResult", true);
		}
		
		//socket.emit("buyStockResult", {buyStockSucceeded:"trueBuyStockTest"});
	});
	
	//getStocks() -> [strings] : stocksList
	socket.on('getStocks', function(data){
		db.getStocks(function(res){ 
			socket.emit("getStocksResult", {stocksList : res});
		});
		
		//var result = [];
		//result.push("stockName1");
		//result.push("stockName2");
		//socket.emit("getStocksResult", {stocksList : result});
	});
	
	//getAchievement(uid) -> [achievement] : listOfAchievements
	socket.on('getAchievement', function(data){
		var result = [];
		result.push("achievementName1");
		result.push("achievementName2");
		socket.emit("getAchievementResult", {achievementList : result});
	});
	
	//achieveAhievement(aid) -> boolean
	socket.on('achieveAchievement', function(data){
		socket.emit("achieveAchievementResult", {achievementSucceeded : "trueAchievementTest"});
	});
	
	//getHistoryForStock(sid) -> list van data?
	socket.on('getHistoryForStock', function(data){
		var result = [];
		result.push("stockHistoryItem1");
		result.push("stockHistoryItem2");
		socket.emit("getHistoryForStockResult", {stockHistoryList : result});
	});
	
	//getLeaderBoard() -> [name] : namesList, [amount] : valuesList
	socket.on('getLeaderBoard', function(data){
		/////// DIT WSS BETER IN 1 LIJST TERUGGEVEN, DUS 1 LIJST MET TUPLES {name, amount} MAAR AMOUNT MOET DAN EIGENLIJK AMOUNT + valueOF(Shares) ZIJN!!!
		var result1 = [];
		result.push("user1");
		result.push("user2");
		var result2 = [];
		result.push("amount1");
		result.push("amount2");
		socket.emit("getLeaderBoardResult", {usersList : result1, amountsList : result2});
	});
	
	//getFriendsList(uid) -> [name] : namesList
	socket.on('getFriendsList', function(data){
		/////// DIT WSS BETER IN 1 LIJST TERUGGEVEN, DUS 1 LIJST MET TUPLES {name, amount} MAAR AMOUNT MOET DAN EIGENLIJK AMOUNT + valueOF(Shares) ZIJN!!!
		db.getFriendList(data, function(res) {
			socket.emit("getFriendsListResult", res);
		});
	});
	
	//getProfile(uid) -> ?
	socket.on('getProfile', function(data){
		socket.emit("getProfileResult", {profile : "getProfileTest"});
	});

	//getNewsFeed() -> [articles] 				// alle artikels
	socket.on('getNewsFeed', function(data){
		var result = [];
		result.push("article1");
		result.push("article2");
		socket.emit("getNewsFeedResult", {articlesList : result});
	});

	//getStocksForUser() -> [{sid, uid, amount}] 				// alle artikels
	socket.on('getStocksForUser', function(data){
		db.getStocksForUser(data, function(res) {
			socket.emit("getStocksForUserResult", res);
		});
	});
});

