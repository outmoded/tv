var React = require('react');

var app = {
    start: function (webSocketManager, messageParser, AppComponent) {
        var element = React.createElement(AppComponent, {
            messageParser: messageParser,
            webSocketManager: webSocketManager
        });

        var appComponent = React.render( element, $('.main').get(0));

        messageParser.onResponseTimeout = function() {
            appComponent.setState({requests: messageParser.requests});
        };

        webSocketManager.onMessage(function(message) {
            var isScrolledToBottom = appComponent.isScrolledToBottom();

            messageParser.addMessage(message);
            appComponent.setState({requests: messageParser.requests});

            if(isScrolledToBottom) {
                appComponent.scrollToBottom();
            }
        });
    }
}

module.exports = app;
