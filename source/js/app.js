'use strict';
// Load modules

window.$ = window.jQuery = require('jquery');

const Backbone = require('backbone');
Backbone.$ = window.$;

const _ = require('lodash');

require('bootstrap/js/modal');
require('bootstrap/js/tooltip');

require('./utils/handlebarsHelpers');

const WebSocketManager = require('./webSocketManager');
const MessageParser = require('./messageParser');
const AppView = require('./views/app');
const SettingsStore = require('./settingsStore');


// Declare internals

const internals = {};


exports = module.exports = window.app = internals.App = {

    defaults: {
        messageParser: MessageParser.create(),
        appViewClass: AppView,
        webSocketManagerClass: WebSocketManager,
        settingsStore: SettingsStore
    },

    start: function (host, port, opts) {

        opts = _.extend(this.defaults, opts);

        const messageParser = opts.messageParser;
        const settingsStore = opts.settingsStore;
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

        const ws = new WebSocket(protocol + host + ':' + port);
        const webSocketManager = opts.webSocketManagerClass.create(ws);

        new opts.appViewClass({
            el: 'body',
            collection: messageParser.requests,
            webSocketManager
        }).render();

        webSocketManager.onSocketOpen = function () {

            webSocketManager.applyFilter(settingsStore.get('channel'));
        };

        webSocketManager.onMessage((message) => {

            opts.messageParser.addMessage(message);
        });
    }
};
