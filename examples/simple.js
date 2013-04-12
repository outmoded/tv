// Load modules

var Hapi = require('hapi');


// Declare internals

var internals = {};


var server = new Hapi.Server(8080);

server.route({
    method: 'GET',
    path: '/',
    handler: function () {

        return this.reply('1');
    }
});


server.plugin.allow({ ext: true }).require('../', null, function (err) {

    if (err) {
        console.log(err);
        return;
    }

    server.start(function () {

        console.log('Server started at: ' + server.settings.uri);
        console.log('Debug console started at: ' + server.settings.uri + server.plugins.tv.endpoint);
    });
});