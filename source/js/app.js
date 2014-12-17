$ = window.$ = window.jQuery = require('jquery');

var Backbone = require('backbone');
Backbone.$ = window.$;

require('bootstrap/js/modal');
require('bootstrap/js/tooltip');

require('./utils/handlebarsHelpers');

var _ = require('lodash');

var WebSocketManager = require('./webSocketManager');
var MessageParser = require('./messageParser');
var AppView = require('./views/app');
var SettingsStore = require('./settingsStore');
var ClientIdGenerator = require('./clientIdGenerator');

var app = {

    defaults: {
        clientIdGenerator: ClientIdGenerator,
        settingsStore: SettingsStore,
        messageParser: MessageParser.create(),
        appViewClass: AppView,
        webSocketManagerClass: WebSocketManager
    },

    start: function (host, port, opts) {
        opts = _.extend(this.defaults, opts);

        var ws = new WebSocket('ws://' + host + ':' + port);
        var webSocketManager = opts.webSocketManagerClass.create(ws);

        var appView = new opts.appViewClass({
            el: 'body',
            collection: opts.messageParser.requests,
            webSocketManager: webSocketManager
        }).render();

        if (!opts.settingsStore.exists('clientId')) {
            appView.model.set('clientId', opts.clientIdGenerator.generate());
            appView.settingsView.render();
        }

        if (this._firstVisit(opts.settingsStore)) {
            appView.model.set('channel', '*');
            appView.settingsView.show();
        }

        webSocketManager.onSocketOpen = function() {

            webSocketManager.applyFilter(opts.settingsStore.get('channel'));
        };

        webSocketManager.onMessage(function(message) {

            opts.messageParser.addMessage(message);
        });
    },

    _firstVisit: function(store){

        return !store.exists('channel');
    }
};


module.exports = window.app = app;
