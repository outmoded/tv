var React = require('react');
var _ = require('lodash');

var Header = require('./header');
var Feed = require('./feed');

var App = React.createClass({

    getInitialState: function() {
        return { requests: [] }
    },

    render: function() {
        return (
            <div>
                <Header
                    searchHandler={this._handleSearch}
                    clearHandler={this._handleClear}
                    pauseHandler={this._handlePause}
                    resumeHandler={this._handleResume}
                />
                <Feed requests={this.state.requests} />
            </div>
        );
    },

    updateState: function() {
        var isScrolledToBottom = this._isScrolledToBottom();

        var requests = this.props.messageParser.requests;
        if(this.searchFilter) {
            requests = _.filter(requests, this.searchFilter.bind(this));
        }
        this.setState({requests: requests});

        if(isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    _handleClear: function() {
        this.props.messageParser.clear();
        this.updateState();
    },

    _handlePause: function() {
        this.props.webSocketManager.pause();
    },

    _handleResume: function() {
        this.props.webSocketManager.resume();
    },

    _handleSearch: function(e) {
        var keywords = e.target.value.toLowerCase().split(' ');

        if(keywords.length) {
            this._setSearchFilter(keywords);
        } else {
            this._clearSearchFilter();
        }
    },

    _setSearchFilter: function(keywords) {
        this.searchFilter = function(request) {
            var matches = true;

            _.each(keywords, function(keyboard) {
                if(!this._hasMatch(request, keyboard)) {
                    matches = false;
                }
            }.bind(this));

            return matches;
        };

        this.updateState();
    },

    _hasMatch: function(request, keyword) {
        return request.path.indexOf(keyword) > -1 ||
            keyword === request.method ||
            keyword === request.statusCode;
    },

    _clearSearchFilter: function() {
        this.searchFilter = null;
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
