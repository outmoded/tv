var app = require('./app');
var WebSocketManager = require('./webSocketManager');
var MessageParser = require('./messageParser');
var AppComponent = require('./views/components/app');
var ClientId = require('./clientId');

var ws = new WebSocket('ws://' + host + ':' + port);
var webSocketManager = WebSocketManager.create(ws);

var messageParser = MessageParser.create();

ClientId.install();

app.start(webSocketManager, messageParser, AppComponent);