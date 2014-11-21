var React = require('react');

var app = {
    start: function (webSocketManager, messageParser, RootComponent) {
        var rootComponent = React.render(
            React.createElement(RootComponent),
            $('.main').get(0)
        );

        messageParser.onResponseTimeout = function() {
            rootComponent.setState(messageParser);
        };

        webSocketManager.onMessage(function(message) {
            messageParser.addMessage(message);
            rootComponent.setState(messageParser);
        });
    }
}

module.exports = app;
