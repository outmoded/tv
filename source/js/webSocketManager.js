'use strict';
// Load modules

// const _ = require('lodash');


// Declare internals

const internals = {};


exports = module.exports = internals.WebSocketManager = function (webSocket) {

    this._webSocket = webSocket;

    this._webSocket.onopen = () => {

        this.isOpen = true;
        if (this.onSocketOpen) {
            this.onSocketOpen();
        }
    };
};


internals.WebSocketManager.create = function (webSocket) {

    return new internals.WebSocketManager(webSocket);
};


internals.WebSocketManager.prototype.applyFilter = function (clientId) {

    if (this.clientId) {
        this._webSocket.send('unsubscribe:' + this.clientId);
    }

    if (this.isOpen) {
        this.clientId = clientId;
        this._webSocket.send(this.clientId); // for the pre-unsubscribe version of Tv
        this._webSocket.send('subscribe:' + this.clientId);
    }
};


internals.WebSocketManager.prototype.clearFilter = function () {

    this.applyFilter('*');
};


internals.WebSocketManager.prototype.resume = function () {

    this._webSocket.onmessage = this.onMessageCallback;
};


internals.WebSocketManager.prototype.pause = function () {

    this._webSocket.onmessage = null;
};


internals.WebSocketManager.prototype.onMessage = function (fn) {

    this._webSocket.onmessage = this.onMessageCallback = fn;
};
