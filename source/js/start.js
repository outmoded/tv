var Backbone = require('backbone');
Backbone.$ = $;

require('./utils/handlebarsHelpers');

var app = require('./app');
var WebSocketManager = require('./webSocketManager');
var MessageParser = require('./messageParser');

var ws = new WebSocket('ws://' + host + ':' + port);
var webSocketManager = WebSocketManager.create(ws);

var messageParser = MessageParser.create();

app.start(webSocketManager, messageParser);
