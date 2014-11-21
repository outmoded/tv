var WebSocketManager = function(webSocket, clientId) {
    this.clientId = clientId || '*';
    this.webSocket = webSocket;

    this.webSocket.onopen = function() {
        this.webSocket.send(this.clientId);
        this.isOpen = true;
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

WebSocketManager.prototype.onMessage = function(fn) {
    this.webSocket.onmessage = fn;
}

module.exports = WebSocketManager;
