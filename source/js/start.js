var app = require('./app');
var WebSocketManager = require('./webSocketManager');

var ws = new WebSocket('ws://' + host + ':' + port);
var webSocketManager = WebSocketManager.create(ws);

var messageParser = MessageParser.create();

var AppComponent = require('./views/components/app');

app.start(webSocketManager, messageParser, AppComponent);