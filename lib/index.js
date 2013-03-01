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
    var html = tv.getMarkup();

    pack.route({
        method: 'GET',
        path: settings.debugEndpoint,
        config: {
            auth: { mode: 'none' },                 // In case defaults are set otherwise
            handler: function () {

                return this.reply(html);
            }
        }
    });

    pack.ext('onRequest', function (request, next) {

        var key = settings.queryKey;
        if (!request.query[key]) {
            return next();
        }

        request.plugins.tv = { debugId: request.query[key] };
        delete request.query[key];

        delete request.url.search;
        delete request.url.query[key];

        request.setUrl(Url.format(request.url));

        return next();
    });

    pack.events.on('request', function (request, report) {

        tv.report(report, request.plugins.tv && request.plugins.tv.debugId);
    });

    return next();
};




