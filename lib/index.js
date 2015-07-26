// Load modules

var Os = require('os');
var Path = require('path');
var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Url = require('url');
var Ws = require('ws');


// Declare internals

var internals = {};


internals.defaults = {
    endpoint: '/debug/console',
    queryKey: 'debug',
    template: 'index',
    host: undefined,
    authenticateEndpoint: false,
    port: 0
};


exports.register = function (server, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);

    server.views({
        engines: { html: { module: Handlebars } },
        path: Path.join(__dirname, '../templates')
    });

    server.route({
        method: 'GET',
        path: settings.endpoint + '/{file*2}',
        config: {
            auth: settings.authenticateEndpoint,
            handler: {
                directory: {
                    path: Path.join(__dirname, '../public'),
                    listing: false,
                    index: false
                }
            },
            plugins: {
                lout: false
            }
        }
    });

    var subscribers = {};                                                   // Map: debug session -> [ subscriber ]
    var tv = new Hapi.Server();
    tv.connection({ host: settings.host, port: settings.port });

    tv.start(function () {

        var ws = new Ws.Server({ server: tv.listener });
        ws.on('connection', function (socket) {

            var subscriptions = {};

            socket.on('message', function (rawMessage) {

                var message = rawMessage.split(':');
                var action = message[0];
                var channel = message[1];

                if (action === 'subscribe') {
                    // only add socket to subscribers if no existing subscription found for socket
                    if (subscriptions[channel] === undefined) {
                        subscribers[channel] = subscribers[channel] || [];
                        subscribers[channel].push(socket);

                        subscriptions[channel] = subscribers[channel].length - 1;   // index of socket in subscribers array
                    }
                }

                if (action === 'unsubscribe') {
                    subscribers[channel].splice(subscriptions[channel], 1);
                    delete subscriptions[channel];
                }
            });
        });

        var host = settings.publicHost || settings.host || tv.info.host;
        if (host === '0.0.0.0') {
            host = Os.hostname();
        }

        server.route({
            method: 'GET',
            path: settings.endpoint,
            config: {
                auth: settings.authenticateEndpoint,
                handler: function (request, reply) {

                    var context = {
                        endpoint: request.path,
                        host: host,
                        port: tv.info.port
                    };

                    return reply.view(settings.template, context);
                },
                plugins: {
                    lout: false
                }
            }
        });

        server.ext('onRequest', function (request, reply) {

            if (request.plugins.tv && request.plugins.tv.debugId) {

                var key = settings.queryKey;

                delete request.query[key];
                delete request.url.search;
                delete request.url.query[key];

                request.setUrl(Url.format(request.url));
            }

            return reply.continue();
        });

        var onLog = function (request, event, tags) {

            var transmit = function (key) {

                var subs = subscribers[key];
                if (!subs) {
                    return;
                }

                var valid = [];
                for (var i = 0, il = subs.length; i < il; ++i) {
                    try {
                        if (subs[i].readyState === Ws.OPEN) {
                            subs[i].send(JSON.stringify(event, null, 4));
                            valid.push(subs[i]);
                        }
                    }
                    catch (err) { }
                }

                subscribers[key] = valid;                         // Removes subscriber on any send error
            };

            var session = request.plugins.tv && request.plugins.tv.debugId;
            if (session) {
                transmit(session);
            }

            transmit('*');
        };

        server.on('request', onLog );
        server.on('request-internal', function (request, event, tags) {

            var key = settings.queryKey;
            if (tags.received && request.query[key] && !request.plugins.tv) {            // first internal event has tag received: true
                request.plugins.tv = { debugId: request.query[key] };
            }

            onLog(request, event, tags);
        });
        server.on('response', function (request) {

            var event = {
                timestamp: Date.now(),
                request: request.id,
                server: request.connection.info.uri,
                response: true,
                data: {
                    statusCode: request.response.statusCode,
                    payload: request.response.variety === 'plain' ? request.response.source : null
                }
            };

            onLog(request, event);
        });

        return next();
    });
};


exports.register.attributes = {
    pkg: require('../package.json')
};
