var SettingsStore = require('./settingsStore');
var AppView = require('./views/app');
var ClientIdGenerator = require('./clientIdGenerator');
var _ = require('lodash');

require('bootstrap/js/modal');

var app = {

    _store: SettingsStore,

    start: function (webSocketManager, messageParser) {
        var appView = new AppView({
            el: 'body',
            collection: messageParser.requests,
            webSocketManager: webSocketManager
        }).render();

        if(!this._store.exists('clientId')) {
            appView.model.set('clientId', ClientIdGenerator.generate());
            appView.settingsView.render();
        }

        if(!this._store.exists('channel')) {
            appView.model.set('channel', '*');
            appView.settingsView.show();
        }

        webSocketManager.onSocketOpen = _.bind(function() {
            webSocketManager.applyFilter(this._store.get('channel'));
        }, this);

        webSocketManager.onMessage(function(message) {
            messageParser.addMessage(message);
        });
    }
}

module.exports = app;
