var React = require('react');
var jsonMarkup = require('json-markup');
var DateTimeFormatter = require('../utils/dateTimeFormatter');

var ServerLogs = React.createClass({

    render: function() {
        var classes = [this.props.stripe];

        if(this.props.hidden) {
            classes.push('hidden');
        }

        return (
            <div className={classes.join(' ')} >
                {this.props.serverLogs.map(this._serverLogRow)}
            </div>
        );
    },

    _serverLogRow: function(serverLog) {
        var date = DateTimeFormatter.shortDate(serverLog.timestamp);
        var time = DateTimeFormatter.longTime(serverLog.timestamp);

        return (
            <div className="server-log row">
                <div className="col-xs-5 tags">{serverLog.tags.join(', ')}</div>
                <div className="col-xs-5 data" dangerouslySetInnerHTML={{__html: jsonMarkup(serverLog.data)}} onClick={this._toggleServerLogData}></div>
                <div className="col-xs-2 timestamp">
                    <span className="time">{time}</span>
                    <span className="date">{date}</span>
                </div>
            </div>
        );
    },

    _toggleServerLogData: function(e) {
        $(e.currentTarget).find('.json-markup').toggleClass('expanded');
    }

});

module.exports = ServerLogs;
