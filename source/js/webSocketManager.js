// Load modules

var _ = require('lodash');


// Declare internals

var internals = {};


var WebSocketManager = function (webSocket) {

    this._webSocket = webSocket;

    var self = this;
    this._webSocket.onopen = function () {

        self.isOpen = true;
        if (self.onSocketOpen) {
            self.onSocketOpen();
        }
    };
};


WebSocketManager.create = function (webSocket) {

    return new WebSocketManager(webSocket);
};


WebSocketManager.prototype.applyFilter = function (clientId) {

    if (this.clientId) {
        this._webSocket.send('unsubscribe:' + this.clientId);
    }

    if (this.isOpen) {
        this.clientId = clientId;
        this._webSocket.send(this.clientId); // for the pre-unsubscribe version of Tv
        this._webSocket.send('subscribe:' + this.clientId);
    }
};


WebSocketManager.prototype.clearFilter = function () {

    this.applyFilter('*');
};


WebSocketManager.prototype.resume = function () {

    this._webSocket.onmessage = this.onMessageCallback;
};


WebSocketManager.prototype.pause = function () {

    this._webSocket.onmessage = null;
};


WebSocketManager.prototype.onMessage = function (fn) {

    this._webSocket.onmessage = this.onMessageCallback = fn;
};


WebSocketManager.prototype.onSocketOpen = function () { };


module.exports = WebSocketManager;
