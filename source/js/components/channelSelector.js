var React = require('react');
var SettingsStore = require('../settingsStore');


var ChannelSelector = exports = module.exports = React.createClass({

    _store: SettingsStore,

    getInitialState: function() {
        return {
            channel: this._store.get('channel')
        }
    },

    getClientId: function() {
        return this._store.get('clientId');
    },

    changeChannel: function(e) {
        var channel = $(e.currentTarget).attr('data-channel');

        if (this.state.channel !== channel) {
            this.setState({
                channel: channel
            });

            this._store.set('channel', channel);
        }
    },

    buttonIsActive: function(channel) {
        if (this.state.channel === channel) 
            return 'active';
    },

    render: function() {
        var buttonClasses = function(channel) {
            return ['btn', 'btn-default', this.buttonIsActive(channel)].join(' ');
        }.bind(this);

        return (
            <div className="btn-group" role="group" aria-label="...">
                <button type="button" onClick={this.changeChannel} data-channel="*" className={buttonClasses('*')}>All</button>
                <button type="button" onClick={this.changeChannel} data-channel={this.getClientId()} className={buttonClasses(this.getClientId())}>Client ID: {this.getClientId()}</button>
            </div>
        );
    }

});