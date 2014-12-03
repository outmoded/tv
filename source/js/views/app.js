var Backbone = require('backbone');
var _ = require('lodash');

var HeaderView = require('./header');
var FeedView = require('./feed');
var RequestView = require('./request');
var SearchQuery = require('../utils/searchQuery');

var AppView = Backbone.View.extend({

    template: require('../templates/app.hbs'),

    initialize: function(opts) {
        this.webSocketManager = opts.webSocketManager;

        this.requestViews = [];

        this.listenTo(this.collection, 'add', this._addRequest);
    },

    events: {
        'keyup .search': '_filterRequests',
        'click .clear': '_clearRequests',
        'click .pause': '_pauseRequests',
        'click .resume': '_resumeRequests'
    },

    render: function() {
        var $markup = $(this.template());

        this.headerView = new HeaderView({ el: $markup.siblings('.header') }).render();
        this.feedView = new FeedView({ el: $markup.siblings('.feed') }).render();

        this.$el.html($markup);

        return this;
    },

    _addRequest: function(request) {
        this._checkToScrollToBottom( function() {
            var requestView = new RequestView({ model: request }).render();
            this.requestViews.push(requestView);

            this._updateRequestVisibility(requestView);

            this.listenTo(request, 'change:statusCode', function() {
                this._updateRequestVisibility(requestView);
            });

            this.$('.feed .body').append(requestView.el);
        }.bind(this) );
    },

    _updateRequestVisibility: function(requestView) {
        if(this.searchFilter) {
            requestView.$el.toggle(this.searchFilter(requestView));
        }
    },

    _checkToScrollToBottom: function(fn) {
        var isScrolledToBottom = this._isScrolledToBottom();

        fn();

        if(isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    _clearRequests: function() {
        this.$('.feed .body').html('');

        _.each(this.requestViews, function(requestView) {
            requestView.remove();
        });
    },

    _pauseRequests: function() {
        this.webSocketManager.pause();
    },

    _resumeRequests: function() {
        this.webSocketManager.resume();
    },

    _filterRequests: _.debounce(function(e) {
        var query = SearchQuery.toObject($('input.search').val());
        
        if(query) {
            this._setSearchFilter(query);
        } else {
            this._clearSearchFilter();
        }
    }, 200),

    _setSearchFilter: function(query) {
        this.searchFilter = function(requestView) {
            return _.every(query, function(values, property) {
                return this._hasMatch(requestView.model, property, values);
            }.bind(this));
        };

        _.each(this.requestViews, function(requestView) {
            requestView.$el.toggle(this.searchFilter(requestView));
        }.bind(this));
    },

    _hasMatch: function(request, property, values) {
        return !_.isUndefined(request.get(property)) && values.indexOf(request.get(property)) > -1;
    },

    _clearSearchFilter: function() {
        this.searchFilter = null;

        _.each(this.requestViews, function(requestView) {
            requestView.$el.toggle(true);
        });
    },

    _isScrolledToBottom: function() {
        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    _scrollToBottom: function() {
        window.scrollTo(0,document.body.scrollHeight);
    }

});

module.exports = AppView;
