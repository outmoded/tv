var React = require('react');
var Requests = require('./requests');

var Feed = React.createClass({

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
                  <Requests requests={this.props.requests} />
                </div>
            </div>
        );
    },

});

module.exports = Feed;
