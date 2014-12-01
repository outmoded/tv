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

    addRequest: function(request) {
        this._checkToScrollToBottom( function() {
            if(this._searchFilter) {
                if(this._searchFilter(request)) {
                    this.state.requests.push(request);
                }
            } else {
                this.state.requests.push(request);
            }
        }.bind(this) );
    },

    refresh: function() {
        this.setState({requests: this.state.requests});
    },

    _checkToScrollToBottom: function(fn) {
        var isScrolledToBottom = this._isScrolledToBottom();

        fn();

        if(isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    _updateState: function() {
        var requests = this.props.messageParser.requests;
        if(this.searchFilter) {
            requests = _.filter(requests, this.searchFilter.bind(this));
        }
        this.setState({requests: requests});
    },

    _handleClear: function() {
        this.props.messageParser.clear();
        this._updateState();
    },

    _handlePause: function() {
        this.props.webSocketManager.pause();
    },

    _handleResume: function() {
        this.props.webSocketManager.resume();
    },

    _handleSearch: _.debounce(function(e) {
        var keywords = $('input.search').val().toLowerCase().split(' ');

        if(keywords.length) {
            this._setSearchFilter(keywords);
        } else {
            this._clearSearchFilter();
        }
    }, 200),

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

        this._updateState();
    },

    _hasMatch: function(request, keyword) {
        return request.path.indexOf(keyword) > -1 ||
            request.method.indexOf(keyword) > -1 ||
            request.statusCode.indexOf(keyword) > -1;
    },

    _clearSearchFilter: function() {
        this.searchFilter = null;
        this._updateState();
    },

    _isScrolledToBottom: function() {
        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    _scrollToBottom: function() {
        window.scrollTo(0,document.body.scrollHeight);
    }

});

module.exports = App;
