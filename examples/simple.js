// Load modules

var Hapi = require('hapi');
var Tv = require('../');

// Declare internals

var internals = {};


var server = new Hapi.Server();
server.connection({ port: 8000 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {

        return reply('1');
    }
});


server.register(Tv, function (err) {

    if (err) {
        console.log(err);
        return;
    }

    server.start(function () {

        console.log('Server started at: ' + server.info.uri);
    });
});
