var app = require('./app');
var WebSocketManager = require('./webSocketManager');
var MessageParser = require('./messageParser');
var AppComponent = require('./components/app');

var ws = new WebSocket('ws://' + host + ':' + port);
var webSocketManager = WebSocketManager.create(ws);

var messageParser = MessageParser.create();

app.start(webSocketManager, messageParser, AppComponent);
