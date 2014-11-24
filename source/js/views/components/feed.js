var React = require('react');
require('bootstrap/js/collapse');
var _ = require('lodash');
var jsonMarkup = require('json-markup');
var moment = require('moment');

var FeedComponent = React.createClass({

    _formatTimestamp: function(timestamp) {
        var momentTimestamp = moment(timestamp);

        return {
            date: momentTimestamp.format('MM-DD-YYYY'),
            time: momentTimestamp.format('HH:mm:ss:SSS')
        };
    },

    render: function() {
        return (
            <div className="feed container-fluid">
                <div className="header row">
                    <div className="col-xs-3 path">Path</div>
                    <div className="col-xs-1 method">Method</div>
                    <div className="col-xs-1 status">Status</div>
                    <div className="col-xs-5 data">Data</div>
                    <div className="col-xs-2 timestamp">Timestamp</div>
                </div>
                <div className="body">
                  { this.props.requests.map(this._requestGroup) }
                </div>
            </div>
        );
    },

    _toggleServerLogData: function(e) {
        $(e.currentTarget).find('.json-markup').toggleClass('expanded');
    },

    _toggle: function(e) {
        var $requestRow = $(e.currentTarget);

        var $current = $requestRow.next();
        var serverLogRows = [];
        do {
            serverLogRows.push($current);
            $current = $current.next();
        } while ($current.hasClass('server-log'))

            var hide = !serverLogRows[0].hasClass('hidden');

            if(hide) {
                $requestRow.removeClass('active');
                _.each(serverLogRows, function($row) { $row.addClass('hidden'); });
            } else {
                $requestRow.addClass('active');
                _.each(serverLogRows, function($row) { $row.removeClass('hidden'); });
            }
    },

    _requestGroup: function(request, index) {
        var stripe = index % 2 === 0 ? 'dark' : 'light';

        var requestRowMarkup = this._requestRow(request, stripe);
        var serverLogRowsMarkup = request.serverLogs.map(function(serverLog) {
            return this._serverLogRow(serverLog, stripe);
        }.bind(this));

        return _.flatten([requestRowMarkup, serverLogRowsMarkup], true);
    },

    _requestRow: function(request, stripe) {
        rowClasses = ['request', stripe, 'row'];
        var statusCodeContent = request.statusCode !== undefined ? request.statusCode : <div className="spinner"></div>;

        if(this._requestHasErrors(request)) {
            rowClasses.push('error');
        } else if(this._requestHasWarnings(request)) {
            rowClasses.push('warning');
        }

        var formattedTimestamp = this._formatTimestamp(request.timestamp);

        return (
            <div className={rowClasses.join(' ')} onClick={this._toggle}>
                <div className="col-xs-3 path">{request.path}</div>
                <div className="col-xs-1 method">{request.method}</div>
                <div className="col-xs-1 status">{statusCodeContent}</div>
                <div className="col-xs-5 data">{JSON.stringify(request.data)}</div>
                <div className="col-xs-2 timestamp">
                    <span className="time">{formattedTimestamp.time}</span>
                    <span className="date">{formattedTimestamp.date}</span>
                </div>
            </div>
        );
    },

    _requestHasErrors: function(request) {
        return request.responseTimeout || request.statusCode >= 500;
    },

    _requestHasWarnings: function(request) {
        return request.statusCode >= 400 && request.statusCode < 500;
    },

    _serverLogRow: function(serverLog, stripe) {
        var formattedTimestamp = this._formatTimestamp(serverLog.timestamp);
        var serverLogClasses = ['server-log', 'hidden', 'row', stripe].join(' ');

        return (
            <div className={serverLogClasses}>
                <div className="col-xs-3 tags">{serverLog.tags.join(', ')}</div>
                <div className="col-xs-1"></div>
                <div className="col-xs-1"></div>
                <div className="col-xs-5 data" dangerouslySetInnerHTML={{__html: jsonMarkup(serverLog.data)}} onClick={this._toggleServerLogData}></div>
                <div className="col-xs-2 timestamp">
                    <span className="time">{formattedTimestamp.time}</span>
                    <span className="date">{formattedTimestamp.date}</span>
                </div>
            </div>
        );
    }

});

module.exports = FeedComponent;
