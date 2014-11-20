var _ = require('lodash');

var MessageParser = function() {
  this.requests = [];
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
  return this._findRequest(message);
};

MessageParser.prototype._isFirstMessageForNewRequest = function(message) {
  var found = this._findRequest(message);
  var hasReceivedTag = message.tags.indexOf('received') !== -1;

  return !found && hasReceivedTag;
};

MessageParser.prototype._addRequest = function(message) {
  var request = {
    id: message.data.id,
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
  var requestId = message.request || message.data.id;

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

  console.log('request', this._findRequest(message));
  console.log('adding server log', serverLog);
  this._findRequest(message).serverLogs.push(serverLog);
};

MessageParser.create = function() {
  return new MessageParser();
};

module.exports = MessageParser;
