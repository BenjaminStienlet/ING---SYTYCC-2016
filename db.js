/**
 * Created by tom on 19/03/16.
 */

var nconf = require('nconf');
nconf.file('settings.json').env();

var username = nconf.get('username'),
    password = nconf.get('password');

