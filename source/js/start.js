var app = require('./app');

var WebSocketManager = require('./webSocketManager');
var ws = new WebSocket('ws://' + host + ':' + port);
var webSocketManager = WebSocketManager.create(ws);

app.start(webSocketManager);
