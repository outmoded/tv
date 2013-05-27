// Load modules

var Url = require('url');
var Hoek = require('hoek');
var Handlebars = require('handlebars');
var Tv = require('./tv');


// Declare internals

var internals = {};


internals.defaults = {
    endpoint: '/debug/console',
    queryKey: 'debug',
    template: 'index'
};


exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});
    var tv = new Tv(settings);

    tv.start(function () {

        var context = {
            endpoint: settings.endpoint
        };

        plugin.views({
            engines: { html: { module: Handlebars } },
            path: './templates'
        });

        plugin.api({
            queryKey: settings.queryKey,
            uri: 'ws://' + tv.settings.host + ':' + tv.settings.port,
            endpoint: settings.endpoint
        });

        context.host = tv.settings.host;
        context.port = tv.settings.port;

        plugin.route({
            method: 'GET',
            path: settings.endpoint,
            config: {
                auth: false,                        // In case defaults are set otherwise
                handler: function () {

                    this.reply.view(settings.template, context);
                }
            }
        });

        plugin.route({
            method: 'GET',
            path: settings.endpoint + '/{file*2}',
            handler: { directory: { path: '../public', listing: false, index: false } }
        });

        plugin.ext('onRequest', function (request, extNext) {

            var key = request.server.plugins.tv.queryKey;
            if (!request.query[key]) {
                return extNext();
            }

            request.plugins.tv = { debugId: request.query[key] };
            delete request.query[key];

            delete request.url.search;
            delete request.url.query[key];

            request.setUrl(Url.format(request.url));

            return extNext();
        });

        plugin.events.on('request', function (request, report) {

            tv.report(report, request.plugins.tv && request.plugins.tv.debugId);
        });

        next();
    });
};
