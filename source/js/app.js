var AppView = require('./views/app');

var app = {
    start: function (webSocketManager, messageParser) {
        var appView = new AppView({
            collection: messageParser.requests,
            webSocketManager: webSocketManager
        });

        $('body').html(appView.render().el);

        webSocketManager.onMessage(function(message) {
            messageParser.addMessage(message);
        });
    }
}

module.exports = app;
