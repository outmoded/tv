var _ = require('lodash');


var internals = {};


internals.requests = {};
internals.requests.prefix = '';
internals.requests.separator = '=============';

internals.serverLogs = {};
internals.serverLogs.prefix = '  ';
internals.serverLogs.separator = internals.serverLogs.prefix + '-------------';


exports = module.exports = internals.Clipboard = function(request) {
    this._request = request;
};

internals.Clipboard.create = function(request) {
    return new internals.Clipboard(request);
};

internals.Clipboard.convertToText = function(request) {
    return internals.Clipboard.create(request).convertToText();
};

internals.Clipboard.prototype.convertToText = function() {
    return [this._buildRequestText(), this._buildServerLogsText()].join('\n\n');
};

internals.Clipboard.prototype._buildRequestText = function() {
    return [
        ['Path:', this._request.method.toUpperCase(), this._request.path].join(' '),
        ['Status:', this._request.statusCode].join(' '),
        ['Server Logs:']
    ].join('\n');
};

internals.Clipboard.prototype._buildServerLogsText = function() {
    return _.map(this._request.serverLogs, this._buildServerLogText, this).join('\n' + internals.serverLogs.separator + '\n');
};

internals.Clipboard.prototype._buildServerLogText = function(serverLog) {
    return [
        internals.serverLogs.prefix + ['Tags:', JSON.stringify(serverLog.tags)].join(' '),
        internals.serverLogs.prefix + ['Timestamp:', serverLog.timestamp].join(' '),
        internals.serverLogs.prefix + ['Data:', JSON.stringify(serverLog.data)].join(' ')
    ].join('\n');
};
