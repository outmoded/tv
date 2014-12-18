// Load modules

var _ = require('lodash');
var Backbone = require('backbone');

var Request = require('./models/request');


// Declare internals

var internals = {};


exports = module.exports = internals.MessageParser = function (opts) {

    opts = opts || {};

    this.requests = new Backbone.Collection();
    this._responseTimeout = opts.responseTimeout || 2000;
};


internals.MessageParser.create = function (opts) {

    return new internals.MessageParser(opts);
};


// There is a possibility that the websocket will initialize in the
// middle of a request, returning a set of server logs that are
// incomplete to represent a full request. In such cases, we'll
// disregard these messages.
internals.MessageParser.prototype.addMessage = function (rawMessage) {

    var message = JSON.parse(rawMessage.data);

    var request;
    if (this._isFirstMessageForNewRequest(message)) {
        request = this._addRequest(message);
        this._addServerLog(message);
        this._refreshResponseTimeout(message);
    }
    else if (this._isForExistingRequest(message)) {
        this._addServerLog(message);
        if (this._isResponse(message)) {
            this._updateRequestWithResponse(message);
        }
        this._refreshResponseTimeout(message);
    }
    else {
        // disregard message
    }

    return request;
};


internals.MessageParser.prototype._isResponse = function (message) {

    return !!message.response;
};


internals.MessageParser.prototype._isForExistingRequest = function (message) {

    return this._findRequest(message);
};


internals.MessageParser.prototype._isFirstMessageForNewRequest = function (message) {

    var found = this._findRequest(message);
    var hasReceivedTag = message.tags && message.tags.indexOf('received') !== -1;

    return !found && hasReceivedTag;
};


internals.MessageParser.prototype._addRequest = function (message) {

    var request = new Request({
        id: message.request,
        path: message.data.url,
        method: message.data.method,
        timestamp: message.timestamp,
        serverLogs: new Backbone.Collection()
    });
    this.requests.add(request);

    return request;
};


internals.MessageParser.prototype._updateRequestWithResponse = function (message) {

    var request = this._findRequest(message);

    request.set('statusCode', message.data.statusCode);
    request.set('isComplete', true);
};


internals.MessageParser.prototype._findRequest = function (message) {

    var requestId = message.request;

    // findLast looks in reverse order since the request is most likely to be last
    return _.findLast(this.requests.models, function (request) {

        return request.id === requestId;
    });
};


internals.MessageParser.prototype._addServerLog = function (message) {

    var request = this._findRequest(message);

    var serverLog = {
        tags: message.tags || [],
        data: message.data,
        timestamp: message.timestamp,
        delta: message.timestamp - request.get('timestamp')
    };

    if (!this._isEmptyResponseServerLog(message)) {
        if (message.response) {
            serverLog.tags.push('response');
        }

        if (message.internal || message.response) {
            serverLog.tags.unshift('internal');
        }

        request.get('serverLogs').add(serverLog);
    }
};


internals.MessageParser.prototype._isEmptyResponseServerLog = function (message) {

    return message.tags &&
        message.tags.length === 1 &&
        message.tags[0] === 'response' &&
        !message.data;
};


internals.MessageParser.prototype._refreshResponseTimeout = function (message) {

    var request = this._findRequest(message);

    clearTimeout(request.timer);

    if (request.get('responseTimeout')) {
        request.set('responseTimeout', false);
        request.set('isComplete', false);
    }

    if (!this._isResponse(message)) {
        var self = this;
        request.timer = setTimeout(function (){

            request.set('statusCode', 'timeout');
            request.set('responseTimeout', true);
            request.set('isComplete', true);

            self.onResponseTimeout && self.onResponseTimeout();
        }, this._responseTimeout);
    }
};
