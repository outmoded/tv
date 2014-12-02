var AppView = require('./views/app');

var app = {

    _store: SettingsStore,

    start: function (webSocketManager, messageParser) {
        var appView = new AppView({
            collection: messageParser.requests,
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

        $('body').html(appView.render().el);

        webSocketManager.onMessage(function(message) {
            messageParser.addMessage(message);
        });
    }
}

module.exports = app;
