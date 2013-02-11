// Load modules

var Os = require('os');
var Fs = require('fs');
var Handlebars = require('handlebars');
var Websocket = require('ws');
var Hoek = require('hoek');
var Defaults = require('./defaults');

// Declare internals

var internals = {};


exports = module.exports = internals.Tv = function (config) {

    Hoek.assert(this.constructor === internals.Tv, 'Tv must be instantiated using new');
    var self = this;

    this.settings = Hoek.applyToDefaults(Defaults, config || {});
    this._subscribers = {};                                             // Map: debug session -> [ subscriber ]

    var indexTemplateSource = this.settings.indexTemplate || Fs.readFileSync(this.settings.indexTemplatePath, 'utf8');
    this._compiledIndexTemplate = Handlebars.compile(indexTemplateSource);

    var ws = new Websocket.Server({ host: this.settings.host, port: this.settings.websocketPort });
    ws.on('connection', function (socket) {

        socket.on('message', function (message) {

            if (message) {
                self._subscribers[message] = self._subscribers[message] || [];
                if (self._subscribers[message].indexOf(socket) === -1) {
                    self._subscribers[message].push(socket);
                    //Log.event('info', 'Debug subscription requested: ' + message);
                }
            }
        });
    });
};


internals.Tv.prototype.report = function (session, event) {

    var self = this;

    var transmit = function (key) {

        var subscribers = self._subscribers[key];

        var valid = [];
        if (subscribers) {
            for (var i = 0, il = subscribers.length; i < il; ++i) {
                try {
                    if (subscribers[i].readyState === Websocket.OPEN) {
                        subscribers[i].send(JSON.stringify(event, null, 4));
                        valid.push(subscribers[i]);
                    }
                }
                catch (err) {
                    // Remove subscriber on any send error
                }
            }

            self._subscribers[key] = valid;
        }
    };

    if (session) {
        transmit(session);
    }

    transmit('*');
};


internals.Tv.prototype.getMarkup = function () {

    var host = (this.settings.host !== '0.0.0.0') ? this.settings.host : Os.hostname();
    var port = this.settings.websocketPort;
    var data = {host : host, port : port};

    return this._compiledIndexTemplate(data)
};