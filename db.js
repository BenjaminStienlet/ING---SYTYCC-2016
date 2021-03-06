/**
 * Created by Benjamin on 19/03/16.
 */

var nconf = require('nconf');
nconf.file('settings.json').env();

var username =
    password = nconf.get('password');

var Connection = require("tedious").Connection;
var config = {
    userName: nconf.get('username'),
    password: nconf.get('password'),
    server: 'ing.database.windows.net',
    options: {
        encrypt: true,
        database: 'stock',
        rowCollectionOnDone: true,
        rowCollectionOnRequestCompletion: true
    }
};

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;


module.exports =  {
    insertNewUser : insertNewUser,
    getUserInfo : getUserInfo,
    getUsers : getUsers,
    login : login,
    getFriendList : getFriendList,
    addFriendship : addFriendship,

    getAchievementIds : getAchievementIds,
    getAchievementInfo : getAchievementInfo,
    achieveAchievement : achieveAchievement,
    getAchievedIds : getAchievedIds,

    getStocks : getStocks,
    buyStock : buyStock,
    sellStock : sellStock,

    increaseUserAmount : increaseUserAmount,
    getHistoryForUser : getHistoryForUser,
    getNewsfeed : getNewsfeed,
    getStocksForUser : getStocksForUser
};


// ===============
// ==== TESTS ====
// ===============
// increaseUserAmount(1, 500);
// getUserInfo(1, function(result){ console.log("Result: "); console.log(result); });
// printTable("users");
// buyStock(1, "GOOG", 36000, 50, 3);
// sellStock(1, "GOOG", 36000, 50, 1);
// printTable("history");
// printTable("users");
// printTable("owenedshares");
// login("Tom", function(res) { console.log(res); });
// getUsers(function(res) { console.log(res); });
// insertNewUser("Ben", "ben.jpg", 1000);
// addFriendship(4, 7, 15);
// getFriendList(7, function(res) { console.log(res) });
// getStocksForUser(1, function(res) { console.log(res) });

// ===============
// ==== USERS ====
// ===============
function insertNewUser(name, pictureid, amount) {
    var connection = new Connection(config);
    connection.on('connect',function(err) {
        request = new Request('INSERT INTO users (name,pictureid,amount) ' +
                            'VALUES (@name,@pictureid,@amount)', function(err) {
            if (err) {
                console.log(err);
            }
            connection.close();
        });
        request.addParameter("name", TYPES.VarChar, name);
        request.addParameter("pictureid", TYPES.VarChar, pictureid);
        request.addParameter("amount", TYPES.Float, amount);
        connection.execSql(request);
    });
}

function getUserInfo(userId, callback) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        request = new Request('SELECT * FROM users WHERE uid = @userId', function(err, rc, rows) {
            if (err) {
                console.log(err);
            }
            callback(columnsToJson(rows[0]));
            connection.close();
        });
        request.addParameter("userId", TYPES.Int, userId);
        connection.execSql(request);
    });
}

function getUsers(callback) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        request = new Request('SELECT * FROM users', function(err, rc, rows) {
            if (err) {
                console.log(err);
            }
            callback(rowsToJson(rows));
            connection.close();
        });
        connection.execSql(request);
    });
}

function login(username, socket) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        request = new Request('SELECT * FROM users WHERE name = @username', function(err, rc, rows) {
            if (err) {
                console.log(err);
            }
            socket.emit("loginResult",columnsToJson(rows[0]));
            connection.close();
        });
        request.addParameter("username", TYPES.VarChar, username);
        connection.execSql(request);
    });
}

function getFriendList(userId, callback) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        request = new Request('SELECT * FROM users WHERE uid IN ' +
                            '(SELECT uid1 FROM friend WHERE uid2 = @userId)', function(err, rc, rows) {
            if (err) {
                console.log(err);
            }
            callback(rowsToJson(rows));
            connection.close();
        });
        request.addParameter("userId", TYPES.VarChar, userId);
        connection.execSql(request);
    });
}

function addFriendship(userId1, userId2, timestamp) {
    var connection = new Connection(config);
    connection.on('connect',function(err) {
        request = new Request('INSERT INTO friend (uid1,uid2,timestamp) ' +
                            'VALUES (@userId1,@userId2,@timestamp)', function(err) {
            if (err) {
                console.log(err);
            }
            request = new Request('INSERT INTO friend (uid1,uid2,timestamp) ' +
                'VALUES (@userId1,@userId2,@timestamp)', function(err) {
                if (err) {
                    console.log(err);
                }
                connection.close();
            });
            request.addParameter("userId1", TYPES.Int, userId2);
            request.addParameter("userId2", TYPES.Int, userId1);
            request.addParameter("timestamp", TYPES.Int, timestamp);
            connection.execSql(request);
        });
        request.addParameter("userId1", TYPES.Int, userId1);
        request.addParameter("userId2", TYPES.Int, userId2);
        request.addParameter("timestamp", TYPES.Int, timestamp);
        connection.execSql(request);
    });
}


// ======================
// ==== ACHIEVEMENTS ====
// ======================
function getAchievementIds() {
    // TODO
}

function getAchievementInfo(achievementId) {
    // TODO
}

function achieveAchievement(achievementId) {
    // TODO
}

function getAchievedIds(userId) {
    // TODO
}


// ================
// ==== STOCKS ====
// ================
function getStocks(socket) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        request = new Request('SELECT * FROM stock', function(err, rc, rows) {
            if (err) {
                console.log(err);
            }
            socket.emit("getStocksResult", rowsToJson(rows));
            connection.close();
        });
        connection.execSql(request);
    });
}

function buyStock(userId, stockId, timestamp, price, amount) {
    insertHistory(userId, stockId, timestamp, price, amount);
    increaseUserAmount(userId, -1 * amount * price);
    increaseStockAmount(userId, stockId, amount);
}

function sellStock(userId, stockId, timestamp, price, amount) {
    insertHistory(userId, stockId, timestamp, price, -1 * amount);
    increaseUserAmount(userId, amount * price);
    increaseStockAmount(userId, stockId, -1 * amount);
}

function insertHistory(userId, stockId, timestamp, price, amount) {
    var connection = new Connection(config);
    connection.on('connect',function(err) {
        request = new Request('INSERT INTO history (uid,sid,timestamp,price,amount)' +
                            'VALUES (@userId,@stockId,@timestamp,@price,@amount)', function(err) {
            if (err) {
                console.log(err);
            }
            connection.close();
        });
        request.addParameter("userId", TYPES.Int, userId);
        request.addParameter("stockId", TYPES.VarChar, stockId);
        request.addParameter("timestamp", TYPES.Int, timestamp);
        request.addParameter("price", TYPES.Float, price);
        request.addParameter("amount", TYPES.Int, amount);
        connection.execSql(request);
    });
}

function increaseUserAmount(userId, amount) {
    var connection = new Connection(config);
    connection.on('connect',function(err) {
        request = new Request('UPDATE users ' +
                            'SET amount=(@amount+(' +
                            'SELECT amount FROM users WHERE uid=@userId)) ' +
                            'WHERE uid=@userId', function(err) {
            if (err) {
                console.log(err);
            }
            connection.close();
        });
        request.addParameter("userId", TYPES.Int, userId);
        request.addParameter("amount", TYPES.Float, amount);
        connection.execSql(request);
    });
}

function increaseStockAmount(userId, stockId, amount) {
    var connection = new Connection(config);

    connection.on('connect',function(err) {
        request1 = new Request('SELECT * FROM owenedshares WHERE uid=@userId AND sid=@stockId', function(err, rc, rows) {
            if (err) {
                console.log(err);
            }
            if (rc == 0) {
                request2 = new Request('INSERT INTO owenedshares (uid,sid,amount)VALUES (@userId,@stockId,@amount)', function(err) {
                    if (err) {
                        console.log(err);
                    }
                    connection.close();
                });
                request2.addParameter("userId", TYPES.Int, userId);
                request2.addParameter("stockId", TYPES.VarChar, stockId);
                request2.addParameter("amount", TYPES.Float, amount);
                connection.execSql(request2);
            } else {
                request3 = new Request('UPDATE owenedshares ' +
                    'SET amount=(@amount+(' +
                    'SELECT amount FROM owenedshares WHERE uid=@userId AND sid=@stockId)) ' +
                    'WHERE uid=@userId AND sid=@stockId', function(err) {
                    if (err) {
                        console.log(err);
                    }
                    connection.close();
                });
                request3.addParameter("userId", TYPES.Int, userId);
                request3.addParameter("stockId", TYPES.VarChar, stockId);
                request3.addParameter("amount", TYPES.Float, amount);
                connection.execSql(request3);
            }
        });
        request1.addParameter("userId", TYPES.Int, userId);
        request1.addParameter("stockId", TYPES.VarChar, stockId);
        request1.addParameter("amount", TYPES.Float, amount);
        connection.execSql(request1);
    });
}

function getHistoryForUser(userID) {
    // TODO
}

function getStocksForUser(userId, callback) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        request = new Request('SELECT * FROM owenedshares WHERE uid = @userId', function(err, rc, rows) {
            if (err) {
                console.log(err);
            }
            callback(rowsToJson(rows));
            connection.close();
        });
        request.addParameter("userId", TYPES.Int, userId);
        connection.execSql(request);
    });
}


// ==================
// ==== NEWSFEED ====
// ==================
function getNewsfeed() {
    // TODO
}


// =====================================================================================================================

function rowsToJson(rows) {
    var result = [];
    rows.forEach(function(row) {
        result.push(columnsToJson(row));
    });
    return { "result": result }
}

function columnsToJson(columns) {
    var result = { };
    columns.forEach(function(col) {
        result[col.metadata.colName] = col.value;
    });
    return result;
}

function printTable(table) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        request = new Request("SELECT * FROM " + table, function(err) {
            if (err) {
                console.log(err);
            }
            connection.close();
        });

        var result = "";
        request.on('row', function(columns) {
            columns.forEach(function(column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    result += column.value + " ";
                }
            });
            console.log(result);
            result = "";
        });

        request.on('done', function(rowCount, more) {
            console.log(rowCount + ' rows returned');
        });

        connection.execSql(request);
    })
}