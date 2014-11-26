var React = require('react');
var SettingsStore = require('../settingsStore');
var ChannelSelector = require('./channelSelector');



var Intro = exports = module.exports = React.createClass({

    _store: SettingsStore,

    snippet: function() {
        return [
            'jQuery.ajaxSetup({',
            '    beforeSend: function(xhr, settings) {',
            '        var clientId = \'' + this._store.get('clientId') + '\';',
            '        settings.url += ((settings.url.indexOf(\'?\') !== -1) ? \'&\' : \'?\') + \'debug=\' + clientId;',
            '    }',
            '});'
        ].join('\n');
    },

    render: function() {
        return (
            <div className="intro well">
                <textarea className="json-markup expanded">{this.snippet()}</textarea>
                
                <p>Would you like to subscribe to all server requests or just yours?</p>
                <ChannelSelector />
            </div>
        );
    }

});