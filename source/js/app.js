var React = require('react');
var ClientIdGenerator = require('./clientIdGenerator');
var SettingsStore = require('./settingsStore');





var app = {

    _store: SettingsStore,

    start: function (webSocketManager, messageParser, AppComponent) {
        var element = React.createElement(AppComponent, {
            messageParser: messageParser,
            webSocketManager: webSocketManager
        });
        
        if(!this._store.exists('clientId')) {
            this._store.set('clientId', ClientIdGenerator.generate());
        }

        if (this._store.exists('channel')) {
            webSocketManager.onSocketOpen = function() {
                webSocketManager.applyFilter(this._store.get('channel'));
            }.bind(this);
        }

        var appComponent = React.render( element, $('.main').get(0));

        messageParser.onResponseTimeout = function() {
            appComponent.updateState();
        };

        webSocketManager.onMessage(function(message) {
            messageParser.addMessage(message);
            appComponent.updateState();
        });
    }
}

module.exports = app;
