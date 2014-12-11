$ = jQuery = require('jquery');

var Backbone = require('backbone');
Backbone.$ = $;

require('./utils/handlebarsHelpers');

var app = require('./app');
var WebSocketManager = require('./webSocketManager');
var MessageParser = require('./messageParser');
var AppView = require('./views/app');
var SettingsStore = require('./settingsStore');
var ClientIdGenerator = require('./clientIdGenerator');

var ws = new WebSocket('ws://' + host + ':' + port);
var webSocketManager = WebSocketManager.create(ws);
var messageParser = MessageParser.create();

app.start(webSocketManager, messageParser, AppView, SettingsStore, ClientIdGenerator);
