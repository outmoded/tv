// Load modules

var Url = require('url');
var Hoek = require('hoek');
var Tv = require('./tv');


// Declare internals

var internals = {};


internals.defaults = {
    debugEndpoint: '/debug/console',
    queryKey: 'debug'
};


exports.register = function (pack, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    var tv = new Tv(settings);
    tv.start(function () {

        pack.api({
            html: tv.getMarkup(),
            queryKey: settings.queryKey,
            uri: 'ws://' + tv.settings.host + ':' + tv.settings.port
        });

        next();
    });

    pack.route({
        method: 'GET',
        path: settings.debugEndpoint,
        config: {
            auth: false,                    // In case defaults are set otherwise
            handler: function (request) {

                return request.reply(request.server.plugins.tv.html);
            }
        }
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
};
