var _ = require('lodash');

require('bootstrap/js/modal');

var app = {

    start: function (webSocketManager, messageParser, appViewClass,
                     settingsStore, clientIdGenerator) {
        var appView = new appViewClass({
            el: 'body',
            collection: messageParser.requests,
            webSocketManager: webSocketManager
        }).render();

        if (!settingsStore.exists('clientId')) {
            appView.model.set('clientId', clientIdGenerator.generate());
            appView.settingsView.render();
        }

        if (this._firstVisit(settingsStore)) {
            appView.model.set('channel', '*');
            appView.settingsView.show();
        }

        webSocketManager.onSocketOpen = function() {
            webSocketManager.applyFilter(settingsStore.get('channel'));
        };

        webSocketManager.onMessage(function(message) {
            messageParser.addMessage(message);
        });
    },

    _firstVisit: function(store){
        return !store.exists('channel');
    }
};

module.exports = app;
