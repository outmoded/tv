var Backbone = require('backbone');
var _ = require('lodash');

var ToolbarView = require('./toolbar');
var FeedView = require('./feed');
var RequestView = require('./request');

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

        new ToolbarView({ el: $markup.siblings('.toolbar') }).render();
        new FeedView({ el: $markup.siblings('.feed') }).render();

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

        this.requestViews = [];
    },

    _pauseRequests: function() {
        this.webSocketManager.pause();
        this.$el.find('.pause').addClass('hidden');
        this.$el.find('.resume').removeClass('hidden');
    },

    _resumeRequests: function() {
        this.webSocketManager.resume();
        this.$el.find('.pause').removeClass('hidden');
        this.$el.find('.resume').addClass('hidden');
    },

    _filterRequests: _.debounce(function(e) {
        var keywords = $('input.search').val().toLowerCase().split(' ');

        if(keywords.length && keywords[0].length) {
            this._setSearchFilter(keywords);
        } else {
            this._clearSearchFilter();
        }
    }, 200),

    _setSearchFilter: function(keywords) {
        this.searchFilter = function(requestView) {
            return _.every(keywords, function(keyword) {
                return this._hasMatch(requestView.model, keyword);
            }.bind(this));
        };

        _.each(this.requestViews, function(requestView) {
            requestView.$el.toggle(this.searchFilter(requestView));
        }.bind(this));
    },

    _hasMatch: function(request, keyword) {
        return request.get('path').indexOf(keyword) > -1 ||
            request.get('method').indexOf(keyword) > -1 ||
            ( _.isString(request.get('statusCode')) &&
              request.get('statusCode').indexOf(keyword) > -1 );
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
