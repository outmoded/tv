// Load modules

var _ = require('lodash');


// Declare internals

var internals = {
    requests: {
        prefix: '',
        separator: '============='
    },
    serverLogs: {
        prefix: '  ',
        separator: '  -------------'
    }
};


exports = module.exports = internals.RequestToTextConverter = function (request) {

    this._request = request;
};


internals.RequestToTextConverter.create = function (request) {

    return new internals.RequestToTextConverter(request);
};


internals.RequestToTextConverter.convertToText = function (request) {

    return internals.RequestToTextConverter.create(request).convertToText();
};


internals.RequestToTextConverter.prototype.convertToText = function () {

    return [this._buildRequestText(), this._buildServerLogsText()].join('\n\n');
};


internals.RequestToTextConverter.prototype._buildRequestText = function () {

    return [
        ['Path:', this._request.method.toUpperCase(), this._request.path].join(' '),
        ['Status:', this._request.statusCode].join(' '),
        ['Server Logs:']
    ].join('\n');
};


internals.RequestToTextConverter.prototype._buildServerLogsText = function () {

    return _.map(this._request.serverLogs, this._buildServerLogText, this).join('\n' + internals.serverLogs.separator + '\n');
};


internals.RequestToTextConverter.prototype._buildServerLogText = function (serverLog) {

    return [
        internals.serverLogs.prefix + ['Tags:', JSON.stringify(serverLog.tags)].join(' '),
        internals.serverLogs.prefix + ['Timestamp:', serverLog.timestamp].join(' '),
        internals.serverLogs.prefix + ['Data:', JSON.stringify(serverLog.data)].join(' ')
    ].join('\n');
};
