var React = require('react');

var Feed = require('./feed');

var App = React.createClass({

    getInitialState: function() {
        return { requests: [] }
    },

    render: function() {
        return (
            <div>
                <Feed requests={this.state.requests}/>
            </div>
        );
    },

    isScrolledToBottom: function() {
        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    scrollToBottom: function() {
        window.scrollTo(0,document.body.scrollHeight);
    }

});

module.exports = App;
