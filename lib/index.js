// Load modules

var Url = require('url');
var Ws = require('ws');
var Hoek = require('hoek');
var Handlebars = require('handlebars');


// Declare internals

var internals = {};


internals.defaults = {
    endpoint: '/debug/console',
    queryKey: 'debug',
    template: 'index',
    host: undefined,
    port: 0
};


exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    plugin.views({
        engines: { html: { module: Handlebars } },
        path: './templates'
    });

    plugin.route({
        method: 'GET',
        path: settings.endpoint + '/{file*2}',
        handler: { directory: { path: __dirname + '/../public', listing: false, index: false } }
    });

    var subscribers = {};                                                   // Map: debug session -> [ subscriber ]
    var server = new plugin.hapi.Server(settings.host, settings.port);
    server.start(function () {

        var ws = new Ws.Server({ server: server.listener });
        ws.on('connection', function (socket) {

            socket.on('message', function (message) {

                if (message) {
                    subscribers[message] = subscribers[message] || [];
                    if (subscribers[message].indexOf(socket) === -1) {
                        subscribers[message].push(socket);
                    }
                }
            });
        });

        var context = {
            endpoint: settings.endpoint,
            host: server.info.host,
            port: server.info.port
        };

        plugin.route({
            method: 'GET',
            path: settings.endpoint,
            config: {
                auth: false,                        // In case defaults are set otherwise
                handler: function (request, reply) {

                    reply.view(settings.template, context);
                }
            }
        });

        plugin.ext('onRequest', function (request, extNext) {

            var key = settings.queryKey;
            if (request.query[key]) {
                request.plugins.tv = { debugId: request.query[key] };

                delete request.query[key];
                delete request.url.search;
                delete request.url.query[key];

                request.setUrl(Url.format(request.url));
            }

            return extNext();
        });

        plugin.events.on('request', function (request, report) {

            var transmit = function (key) {

                var subs = subscribers[key];
                if (!subs) {
                    return;
                }

                var valid = [];
                for (var i = 0, il = subs.length; i < il; ++i) {
                    try {
                        if (subs[i].readyState === Ws.OPEN) {
                            subs[i].send(JSON.stringify(report, null, 4));
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
        });

        return next();
    });
};

