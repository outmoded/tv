var React = require('react');
var Requests = require('./requests');
var Intro = require('./intro');
var SettingsStore = require('../settingsStore');




var Feed = React.createClass({

    _store: SettingsStore,

    content: function() {
        console.log('this._store.get(\'channel\')', this._store.get('channel'));
        if (!this._store.get('channel')) {
            return <Intro />
        } else {
            return <Requests requests={this.props.requests} />
        }
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
                    {this.content()}
                </div>
            </div>
        );
    }

});

module.exports = Feed;
