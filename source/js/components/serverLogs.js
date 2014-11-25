var React = require('react');
var jsonMarkup = require('json-markup');
var DateTimeFormatter = require('../utils/dateTimeFormatter');

var ServerLogs = React.createClass({

    render: function() {
        return (
            <div className={this.props.stripe} >
                {this.props.serverLogs.map(this._serverLogRow)}
            </div>
        );
    },

    _serverLogRow: function(serverLog, index) {
        return (
            <div key={index} className="server-log row">
                <div className="col-xs-5 tags">{serverLog.tags.join(', ')}</div>
                <div className="col-xs-5 data" dangerouslySetInnerHTML={{__html: jsonMarkup(serverLog.data)}} onClick={this._toggleServerLogData}></div>
                <div className="col-xs-2 timestamp">
                    <span className="time">{DateTimeFormatter.longTime(serverLog.timestamp)}</span>
                    <span className="date">{DateTimeFormatter.shortDate(serverLog.timestamp)}</span>
                </div>
            </div>
        );
    },

    _toggleServerLogData: function(e) {
        $(e.currentTarget).find('.json-markup').toggleClass('expanded');
    }

});

module.exports = ServerLogs;
