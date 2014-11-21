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

    componentDidMount: function() {
        $(window).on('resize', this._adjustSizeOfJson);
    },

    render: function() {
        return (
            <table className="table">
            <thead>
            <th className="path">Path</th>
            <th className="method">Method</th>
            <th className="status">Status</th>
            <th className="data">Data</th>
            <th className="timestamp">Timestamp</th>
            </thead>
            <tbody>
            { this.props.requests.map(this._requestGroup) }
            </tbody>
            </table>
        );
    },

    _adjustSizeOfJson: function() {
        $('.json-markup').width($(window).width() - 600);
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
                this._adjustSizeOfJson();
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
        rowClasses = ['request', stripe];
        var statusCodeContent = request.statusCode !== undefined ? request.statusCode : <div className="spinner"></div>;

        if(this._requestHasErrors(request)) {
            rowClasses.push('error');
        } else if(this._requestHasWarnings(request)) {
            rowClasses.push('warning');
        }

        var formattedTimestamp = this._formatTimestamp(request.timestamp);

        return (
            <tr className={rowClasses.join(' ')} onClick={this._toggle}>
            <td>{request.path}</td>
            <td className="method">{request.method}</td>
            <td className="status">{statusCodeContent}</td>
            <td className="data">{JSON.stringify(request.data)}</td>
            <td>
              <span className="time">{formattedTimestamp.time} </span>
              <span className="date">{formattedTimestamp.date}</span>
            </td>
            </tr>
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

        return (
            <tr className={"server-log hidden " + stripe}>
            <td colSpan="3">{serverLog.tags.join(', ')}</td>
            <td className="data" dangerouslySetInnerHTML={{__html: jsonMarkup(serverLog.data)}} onClick={this._toggleServerLogData}/>
            <td>
              <span className="time">{formattedTimestamp.time} </span>
              <span className="date">{formattedTimestamp.date}</span>
            </td>
            </tr>
        );
    }

});

module.exports = FeedComponent;
