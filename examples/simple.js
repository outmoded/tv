// Load modules

var Hapi = require('hapi');


// Declare internals

var internals = {};


var server = new Hapi.Server(8080);

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {

        return reply('1');
    }
});


server.pack.require('../', function (err) {

    if (err) {
        console.log(err);
        return;
    }

    server.start(function () {

        console.log('Server started at: ' + server.info.uri);
    });
});