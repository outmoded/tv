var WebSocketManager = function(webSocket, clientId) {
    this.webSocket = webSocket;

    this.webSocket.onopen = function() {
        this.isOpen = true;
        if (this.onSocketOpen) this.onSocketOpen();
    }.bind(this);
};

WebSocketManager.create = function(webSocket, clientId) {
    return new WebSocketManager(webSocket, clientId);
};

WebSocketManager.prototype.applyFilter = function(clientId) {
    this.clientId = clientId;

    if (this.isOpen) {
        this.webSocket.send(clientId);
    }
};

WebSocketManager.prototype.clearFilter = function() {
    this.applyFilter("*");
}

WebSocketManager.prototype.resume = function() {
    this.webSocket.onmessage = this.onMessageCallback;
}

WebSocketManager.prototype.pause = function() {
    this.webSocket.onmessage = null;
}

WebSocketManager.prototype.onMessage = function(fn) {
    this.webSocket.onmessage = this.onMessageCallback = fn;
}

module.exports = WebSocketManager;
