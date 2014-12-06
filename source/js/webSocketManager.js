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
    if (this.clientId) {
        this.webSocket.send('unsubscribe:' + this.clientId);
    }

    if (this.isOpen) {
        this.clientId = clientId;
        this.webSocket.send(this.clientId);                        // for the pre-unsubscribe version of Tv
        this.webSocket.send('subscribe:' + this.clientId);
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
