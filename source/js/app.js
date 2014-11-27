var React = require('react');

var app = {
    start: function (webSocketManager, messageParser, AppComponent) {
        var element = React.createElement(AppComponent, {
            messageParser: messageParser,
            webSocketManager: webSocketManager
        });

        var appComponent = React.render( element, $('.main').get(0));

        messageParser.onResponseTimeout = function() {
            appComponent.updateState();
        };

        webSocketManager.onMessage(function(message) {
            var request = messageParser.addMessage(message);
            if(request) {
                appComponent.addRequest(request);
            }
            appComponent.refresh();
        });
    }
}

module.exports = app;
