var _ = require('lodash');

var MessageParser = function() {
  this.requests = [];
  this.serverLogs = [];
};

// There is a possibility that the websocket will initialize in the 
// middle of a request, returning a set of server logs that are 
// incomplete to represent a full request. In such cases, we'll 
// disregard these messages.
MessageParser.prototype.addMessage = function(message) {
  message = JSON.parse(message.data);

  if (this._isFirstMessageForNewRequest(message)) {
    this._addRequest(message);
    this._addServerLog(message);
  } 
  else if(this._isForExistingRequest(message)) { 
    this._addServerLog(message);
    if(this._isResponse(message)) {
      this._updateRequestWithResponse(message);
    }
  } else {
    // disregard message
  }
};

MessageParser.prototype._isResponse = function(message) {
  return message.tags.indexOf('response') !== -1;
};

MessageParser.prototype._isForExistingRequest = function(message) {
  return _.any( this.requests, function(request) { 
    return request.id === message.request;
  });
};

MessageParser.prototype._isFirstMessageForNewRequest = function(message) {
  var hasReceivedTag = message.tags.indexOf('received') !== -1;

  return !this._isForExistingRequest(message) && hasReceivedTag;
};

MessageParser.prototype._addRequest = function(message) {
  var request = {
    id: message.data.id,
    path: message.data.url,
    method: message.data.method,
    timestamp: message.timestamp
  }
  console.log('adding request', request);
  this.requests.push(request);
};

MessageParser.prototype._updateRequestWithResponse = function(message) {
  var requestId = message.request;
  var request = _.findWhere(this.requests, {id: requestId});
  
  request.statusCode = message.data.statusCode;
  request.data = message.data;
};

MessageParser.prototype._addServerLog = function(message) {
  var serverLog = {
    requestId: message.request,
    tags: message.tags,
    data: message.data,
    timestamp: message.timestamp
  }

  console.log('adding server log', serverLog);
  this.serverLogs.push(serverLog);
};

MessageParser.create = function() {
  return new MessageParser();
};

module.exports = MessageParser;