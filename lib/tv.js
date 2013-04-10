// Load modules

var Ws = require('ws');
var Hoek = require('hoek');


// Declare internals

var internals = {};


internals.defaults = {
    port: 3000,
    host: '0.0.0.0'
};


exports = module.exports = internals.Tv = function (config) {

    Hoek.assert(this.constructor === internals.Tv, 'Tv must be instantiated using new');

    this.settings = Hoek.applyToDefaults(internals.defaults, config || {});
    this._subscribers = {};                                                         // Map: debug session -> [ subscriber ]
};


internals.Tv.prototype.start = function (callback) {

    var self = this;

    callback = callback || function () { };
    var ws = new Ws.Server({ host: this.settings.host, port: this.settings.port }, function () {

        var address = ws._server.address();                                 // Update the port and host with what was actually bound
        self.settings.port = address.port;
        self.settings.host = self.settings.host || address.address;

        callback();
    });

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
