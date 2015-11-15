// Load modules

var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var Tv = require('../');

// Declare internals

var internals = {};

internals.plugins = [Vision, Inert, Tv];

var server = new Hapi.Server();
server.connection({ port: 8000 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {

        return reply('1');
    }
});


server.register(internals.plugins, function (err) {

    if (err) {
        console.log(err);
        return;
    }

    server.start(function () {

        console.log('Server started at: ' + server.info.uri);
    });
});
