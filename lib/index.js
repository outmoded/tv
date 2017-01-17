'use strict';
// Load modules

const Os = require('os');
const Path = require('path');
const Handlebars = require('handlebars');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Url = require('url');
const Ws = require('ws');


// Declare internals

const internals = {};


internals.defaults = {
    endpoint: '/debug/console',
    queryKey: 'debug',
    template: 'index',
    host: undefined,
    address: undefined,
    authenticateEndpoint: false,
    port: 0
};


exports.register = function (server, options, next) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);

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

    const subscribers = {};                                                   // Map: debug session -> [ subscriber ]
    const tv = new Hapi.Server();
    tv.connection({ host: settings.host, address: settings.address, port: settings.port });

    tv.start(() => {

        const ws = new Ws.Server({ server: tv.listener });
        ws.on('connection', (socket) => {

            const subscriptions = {};

            socket.on('message', (rawMessage) => {

                const message = rawMessage.split(':');
                const action = message[0];
                const channel = message[1];

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

        let host = settings.publicHost || settings.host || tv.info.host;
        if (host === '0.0.0.0') {
            host = Os.hostname();
        }

        server.route({
            method: 'GET',
            path: settings.endpoint,
            config: {
                auth: settings.authenticateEndpoint,
                handler: function (request, reply) {

                    const context = {
                        endpoint: request.path,
                        host,
                        port: tv.info.port
                    };

                    return reply.view(settings.template, context);
                },
                plugins: {
                    lout: false
                }
            }
        });

        server.ext('onRequest', (request, reply) => {

            if (request.plugins.tv && request.plugins.tv.debugId) {

                const key = settings.queryKey;

                delete request.query[key];
                delete request.url.search;
                delete request.url.query[key];

                request.setUrl(Url.format(request.url));
            }

            return reply.continue();
        });

        const onLog = function (request, event, tags) {

            const transmit = function (key) {

                const subs = subscribers[key];
                if (!subs) {
                    return;
                }

                const valid = [];
                subs.forEach((sub, i) => {

                    try {
                        if (subs[i].readyState === Ws.OPEN) {
                            subs[i].send(JSON.stringify(event, null, 4));
                            valid.push(subs[i]);
                        }
                    }
                    catch (err) { }
                });

                subscribers[key] = valid;                         // Removes subscriber on any send error
            };

            const session = request.plugins.tv && request.plugins.tv.debugId;
            if (session) {
                transmit(session);
            }

            transmit('*');
        };

        server.on('request', onLog );
        server.on('request-internal', (request, event, tags) => {

            const key = settings.queryKey;
            if (tags.received && request.query[key] && !request.plugins.tv) {            // first internal event has tag received: true
                request.plugins.tv = { debugId: request.query[key] };
            }

            onLog(request, event, tags);
        });
        server.on('response', (request) => {

            const event = {
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
