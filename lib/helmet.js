// Load modules

var Os = require('os');
var Websocket = require('ws');
var Hoek = require('hoek');
var Defaults = require('./defaults');

// Declare internals

var internals = {};


exports = module.exports = internals.Helmet = function (config) {

    Hoek.assert(this.constructor === internals.Helmet, 'Helmet must be instantiated using new');
    var self = this;

    this.settings = Hoek.applyToDefaults(Defaults, config);
    this._subscribers = {};                                             // Map: debug session -> [ subscriber ]

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


internals.Helmet.prototype.report = function (session, event) {

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


internals.Helmet.prototype.getMarkup = function () {

    var host = (this.settings.host !== '0.0.0.0') ? this.settings.host : Os.hostname();
    var port = this.settings.websocketPort;

    var html = '<!DOCTYPE html><html lang="en"><head><title>Debug Console</title><meta http-equiv="Content-Language" content="en-us"><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body>' +
        '<script>\n' +
        'function htmlEscape(string) { return string.replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}\n' +
        'var ws = new WebSocket("ws://' + host + ':' + port + '");\n' +
        'ws.onopen = function() {};\n' +
        'ws.onmessage = function(message) { document.getElementById("stream").innerHTML += htmlEscape(message.data) + "<p />" };\n' +
        'ws.onclose = function() {};\n' +
        '</script>\n' +
        '<input id="session" /><button id="subscribe" onclick="ws.send(document.getElementById(\'session\').value);">Subscribe</button>' +
        '<pre><div id="stream"></div></pre></body></html>';

    return html;
};