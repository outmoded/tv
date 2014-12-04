var _ = require('lodash');
var Backbone = require('backbone');
var Request = require('./models/request');

var MessageParser = function(opts) {
  opts = opts || {};

  this.requests = new Backbone.Collection();
  this.responseTimeout = opts.responseTimeout || 2000;
};

MessageParser.create = function(opts) {
  return new MessageParser(opts);
};

// There is a possibility that the websocket will initialize in the 
// middle of a request, returning a set of server logs that are 
// incomplete to represent a full request. In such cases, we'll 
// disregard these messages.
MessageParser.prototype.addMessage = function(raw_message) {
  var message = JSON.parse(raw_message.data);
  console.log('message', message);

  var request;
  if (this._isFirstMessageForNewRequest(message)) {
    request = this._addRequest(message);
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

  return request;
};

MessageParser.prototype._isResponse = function(message) {
  var isResponse =
      message.response ||
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
  var hasReceivedTag = message.tags && message.tags.indexOf('received') !== -1;

  return !found && hasReceivedTag;
};

MessageParser.prototype._addRequest = function(message) {
  var request = new Request({
    id: message.request,
    path: message.data.url,
    method: message.data.method,
    timestamp: message.timestamp,
    serverLogs: new Backbone.Collection()
  });
  console.log('adding request', request);
  this.requests.add(request);

  return request;
};

MessageParser.prototype._updateRequestWithResponse = function(message) {
  var request = this._findRequest(message);

  request.set('statusCode', message.data.statusCode);
};

MessageParser.prototype._findRequest = function(message) {
  var requestId = message.request;

  // findLast looks in reverse order since the request is most likely to be last
  return _.findLast(this.requests.models, function(request) {
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

  this._findRequest(message).get('serverLogs').add(serverLog);
};

MessageParser.prototype._refreshResponseTimeout = function(message) {
  var request = this._findRequest(message);

  clearTimeout(request.timer);

  if(request.get('responseTimeout')) {
      request.set('responseTimeout', false);
  }

  if(!this._isResponse(message)) {
    request.timer = setTimeout(function(){
      request.set('statusCode', "timeout");
      request.set('responseTimeout', true);

      this.onResponseTimeout && this.onResponseTimeout();
    }.bind(this), this.responseTimeout);
  }
};

module.exports = MessageParser;
