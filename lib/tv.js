// Load modules

var Os = require('os');
var Fs = require('fs');
var Handlebars = require('handlebars');
var Ws = require('ws');
var Hoek = require('hoek');


// Declare internals

var internals = {};


internals.defaults = {
    websocketPort: 3000,
    host: '0.0.0.0',
    indexTemplatePath: __dirname + '/../templates/index.html'
};


exports = module.exports = internals.Tv = function (config) {

    Hoek.assert(this.constructor === internals.Tv, 'Tv must be instantiated using new');
    var self = this;

    this.settings = Hoek.applyToDefaults(internals.defaults, config || {});
    this._subscribers = {};                                             // Map: debug session -> [ subscriber ]

    var indexTemplateSource = this.settings.indexTemplate || Fs.readFileSync(this.settings.indexTemplatePath, 'utf8');
    this._compiledIndexTemplate = Handlebars.compile(indexTemplateSource);

    var ws = new Ws.Server({ host: this.settings.host, port: this.settings.websocketPort });
    ws.on('connection', function (socket) {

        socket.on('message', function (message) {

            if (message) {
                self._subscribers[message] = self._subscribers[message] || [];
                if (self._subscribers[message].indexOf(socket) === -1) {
                    self._subscribers[message].push(socket);
                }
            }
        });
    });
};


internals.Tv.prototype.report = function (event, session) {

    var self = this;

    var transmit = function (key) {

        var subscribers = self._subscribers[key];
        if (!subscribers) {
            return;
        }

        var valid = [];
        for (var i = 0, il = subscribers.length; i < il; ++i) {
            try {
                if (subscribers[i].readyState === Ws.OPEN) {
                    subscribers[i].send(JSON.stringify(event, null, 4));
                    valid.push(subscribers[i]);
                }
            }
            catch (err) { }
        }

        self._subscribers[key] = valid;                         // Removes subscriber on any send error
    };

    if (session) {
        transmit(session);
    }

    transmit('*');
};


internals.Tv.prototype.getMarkup = function () {

    var host = (this.settings.host !== '0.0.0.0') ? this.settings.host : Os.hostname();
    var port = this.settings.websocketPort;
    var data = { host: host, port: port };

    return this._compiledIndexTemplate(data)
};

