var React = require('react');

var Header = require('./header');
var Feed = require('./feed');

var App = React.createClass({

    getInitialState: function() {
        return { requests: [] }
    },

    render: function() {
        return (
            <div>
                <Header clearHandler={this._handleClear} />
                <Feed requests={this.state.requests} />
            </div>
        );
    },

    updateState: function() {
        var isScrolledToBottom = this._isScrolledToBottom();

        this.setState({requests: this.props.messageParser.requests});

        if(isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    _handleClear: function() {
        this.props.messageParser.clear();
        this.updateState();
    },

    _isScrolledToBottom: function() {
        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    _scrollToBottom: function() {
        window.scrollTo(0,document.body.scrollHeight);
    }

});

module.exports = App;
