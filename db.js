/**
 * Created by tom on 19/03/16.
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
    options: { encrypt: true, database: 'stock'}
};

/*connection.on('connect', function(err) {
    console.log("connected");
    insertNewUser("Tom", "tom.jpg", -500);
    //executeStatement();

}); */

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

executeStatement();

function insertNewUser(name, pictureid, amount) {
    var connection = new Connection(config);
    connection.on('connect',function(err) {
        request = new Request('INSERT INTO users (name,pictureid,amount) VALUES (@name,@pictureid,@amount)', function(err,rowCount) {
            if(err) {
                console.log(err);
            } else {
                console.log(rowCount);
            }
            connection.close();
        });
        request.addParameter("name", TYPES.VarChar, name);
        request.addParameter("pictureid", TYPES.VarChar, pictureid);
        request.addParameter("amount", TYPES.Float, amount);
        connection.execSql(request);
    });

}



function executeStatement() {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        request = new Request("SELECT * FROM users", function(err) {
            if(err) {
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