var _ = require('lodash');

var MessageParser = function(opts) {
  opts = opts || {};

  this.requests = [];
  this.responseTimeout = opts.responseTimeout || 2000;
};

MessageParser.create = function(opts) {
  return new MessageParser(opts);
};

MessageParser.RESPONSE_TIMEOUT_ERROR_MESSAGE =
  'Response Timeout: Never received the response log entry from the server.';

// There is a possibility that the websocket will initialize in the 
// middle of a request, returning a set of server logs that are 
// incomplete to represent a full request. In such cases, we'll 
// disregard these messages.
MessageParser.prototype.addMessage = function(raw_message) {
  var message = JSON.parse(raw_message.data);
  console.log('message', message);

  if (this._isFirstMessageForNewRequest(message)) {
    this._addRequest(message);
    this._addServerLog(message);
    this._refreshResponseTimeout(message);
  }
  else if(this._isForExistingRequest(message)) { 
    this._addServerLog(message);
    if(this._isResponse(message)) {
      this._updateRequestWithResponse(message);
    }
    this._refreshResponseTimeout(message);
  } else {
    // disregard message
  }
};

MessageParser.prototype._isResponse = function(message) {
  var isResponse =
      this._hasTags(message, 'response') ||
      this._hasTags(message, ['error', 'internal']);

  return isResponse;
};

MessageParser.prototype._hasTags = function(message, tags) {
    if(!(tags instanceof Array)){
        tags = [tags];
    }

    return _.intersection(message.tags, tags).length === tags.length;
};

MessageParser.prototype._isForExistingRequest = function(message) {
  return this._findRequest(message);
};

MessageParser.prototype._isFirstMessageForNewRequest = function(message) {
  var found = this._findRequest(message);
  var hasReceivedTag = message.tags.indexOf('received') !== -1;

  return !found && hasReceivedTag;
};

MessageParser.prototype._addRequest = function(message) {
  var request = {
    id: message.request,
    path: message.data.url,
    method: message.data.method,
    timestamp: message.timestamp,
    serverLogs: []
  }
  console.log('adding request', request);
  this.requests.push(request);
};

MessageParser.prototype._updateRequestWithResponse = function(message) {
  var request = this._findRequest(message);

  request.statusCode = '--'; // message.data.statusCode;
  request.data = '--'; // message.data;
};

MessageParser.prototype._findRequest = function(message) {
  var requestId = message.request;

  return _.find(this.requests, function(request) {
      return request.id === requestId;
  });
};

MessageParser.prototype._addServerLog = function(message) {
  var serverLog = {
    tags: message.tags,
    data: message.data,
    timestamp: message.timestamp
  }

  console.log('adding server log', serverLog);

  this._findRequest(message).serverLogs.push(serverLog);
};

MessageParser.prototype._refreshResponseTimeout = function(message) {
  var request = this._findRequest(message);

  clearTimeout(request.timeout);

  if(request.responseTimeout) {
      request.data = undefined;
      request.responseTimeout = false;
  }

  if(!this._isResponse(message)) {
    request.timeout = setTimeout(function(){
      request.data = MessageParser.RESPONSE_TIMEOUT_ERROR_MESSAGE;
      request.statusCode = null;
      request.responseTimeout = true;

      this.onResponseTimeout && this.onResponseTimeout();
    }.bind(this), this.responseTimeout);
  }
};

module.exports = MessageParser;
