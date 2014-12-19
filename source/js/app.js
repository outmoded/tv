// Load modules

window.$ = window.jQuery = require('jquery');

var Backbone = require('backbone');
Backbone.$ = window.$;

var _ = require('lodash');

require('bootstrap/js/modal');
require('bootstrap/js/tooltip');

require('./utils/handlebarsHelpers');

var WebSocketManager = require('./webSocketManager');
var MessageParser = require('./messageParser');
var AppView = require('./views/app');
var SettingsStore = require('./settingsStore');


// Declare internals

var internals = {};


exports = module.exports = window.app = internals.App = {

    defaults: {
        messageParser: MessageParser.create(),
        appViewClass: AppView,
        webSocketManagerClass: WebSocketManager,
        settingsStore: SettingsStore
    },

    start: function (host, port, opts) {

        opts = _.extend(this.defaults, opts);

        var messageParser = opts.messageParser;
        var settingsStore = opts.settingsStore;

        var ws = new WebSocket('ws://' + host + ':' + port);
        var webSocketManager = opts.webSocketManagerClass.create(ws);

        var appView = new opts.appViewClass({
            el: 'body',
            collection: messageParser.requests,
            webSocketManager: webSocketManager
        }).render();

        webSocketManager.onSocketOpen = function () {

            webSocketManager.applyFilter(settingsStore.get('channel'));
        };

        webSocketManager.onMessage(function (message) {

            opts.messageParser.addMessage(message);
        });
    }
};
