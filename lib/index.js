// Load modules

var Url = require('url');
var Hoek = require('hoek');
var Path = require('path');
var Tv = require('./tv');


// Declare internals

var internals = {};


internals.defaults = {
    endpoint: '/debug/console',
    queryKey: 'debug',
    basePath: Path.join(__dirname, '..', 'templates'),
    template: 'index'
};


exports.register = function (pack, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});
    var tv = new Tv(settings);
    tv.start(function () {

        pack.api({
            context: {
                host: tv.settings.host,
                port: tv.settings.port
            },
            queryKey: settings.queryKey,
            uri: 'ws://' + tv.settings.host + ':' + tv.settings.port,
            endpoint: settings.endpoint
        });

        next();
    });

    pack.route({
        method: 'GET',
        path: settings.endpoint,
        config: {
            auth: false,                        // In case defaults are set otherwise
            handler: function (request) {

                return request.reply.view(settings.template, request.server.plugins.tv.context, { path: '' }).send();
            }
        }
    });

    pack.route({
        method: 'GET',
        path: settings.endpoint + '/{file*2}',
        handler: { directory: { path: Path.join(__dirname, '..', 'public'), listing: false, index: false }}
    });

    pack.ext('onRequest', function (request, callback) {

        var key = request.server.plugins.tv.queryKey;
        if (!request.query[key]) {
            return callback();
        }

        request.plugins.tv = { debugId: request.query[key] };
        delete request.query[key];

        delete request.url.search;
        delete request.url.query[key];

        request.setUrl(Url.format(request.url));

        return callback();
    });

    pack.events.on('request', function (request, report) {

        tv.report(report, request.plugins.tv && request.plugins.tv.debugId);
    });

    pack.views({ basePath: settings.basePath });
};
