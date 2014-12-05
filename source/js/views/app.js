var Backbone = require('backbone');
var _ = require('lodash');

var ToolbarView = require('./toolbar');
var FeedView = require('./feed');
var RequestView = require('./request');
var SettingsView = require('./settings');
var SearchQuery = require('../utils/searchCriteria').SearchCriteria;
var Settings = require('../models/settings');

var AppView = Backbone.View.extend({

    template: require('../templates/app.hbs'),

    initialize: function(opts) {
        this.model = new Settings({webSocketManager: opts.webSocketManager});

        this.webSocketManager = opts.webSocketManager;

        this.requestViews = [];

        this.listenTo(this.collection, 'add', this._addRequest);
    },

    events: {
        'keyup .search': '_filterRequests',
        'click .clear': '_clearRequests',
        'click .pause-resume': '_pauseResumeRequests',
        'click .favorite.enabled': '_filterRequestsToFavorites',
        'click .favorite.active': '_removeFavoritesFilter'
    },

    render: function() {
        var $markup = $(this.template());

        this.toolbarView = new ToolbarView({ el: $markup.siblings('.toolbar'), model: this.model, appView: this }).render();
        this.feedView = new FeedView({ el: $markup.siblings('.feed'), model: this.model }).render();
        this.settingsView = new SettingsView({ el: $markup.siblings('.settings-modal-container'), settingsModel: this.model }).render();

        this.$el.html($markup);

        return this;
    },

    _addRequest: function(request) {
        this._checkToScrollToBottom( function() {
            var requestView = new RequestView({ model: request }).render();
            this.requestViews.push(requestView);

            this.listenTo(requestView, 'serverLogsExpanded', this._enableCollapseAllAction);
            this.listenTo(requestView, 'serverLogsCollapsed', this._checkToDisableCollapseAllAction);
            this.listenTo(requestView, 'favorited', this._enableFilterFavoritesAction);
            this.listenTo(requestView, 'unfavorited', this._checkToDisableFilterFavoritesAction);

            this._updateRequestVisibility(requestView);

            this.listenTo(request, 'change:statusCode', function() {
                this._updateRequestVisibility(requestView);
            });

            this.$('.feed .body').append(requestView.el);
        }.bind(this) );
    },

    _enableCollapseAllAction: function() {
        this.$('.header .expander').addClass('expanded');
    },

    _checkToDisableCollapseAllAction: function() {
        if(this.$('.request.active').length === 0) {
            this.$('.header .expander').removeClass('expanded');
        }
    },

    _enableFilterFavoritesAction: function() {
        this.$('.header .favorite').addClass('enabled');
    },

    _checkToDisableFilterFavoritesAction: function() {
        if(this.$('.request .favorite.active').length === 0) {
            this.$('.header .favorite')
                .removeClass('enabled')
                .removeClass('active')
                .addClass('empty');
        }
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

    _pauseResumeRequests: function(e) {
        var paused = $(e.currentTarget).find('.resume:visible').length === 1;

        if(paused) {
            this._resumeRequests();
        } else {
            this._pauseRequests();
        }
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
        var queryString = $('input.search').val();

        if(queryString) {
            this._setSearchFilter(SearchQuery.create(queryString));
        } else {
            this._clearSearchFilter();
        }
    }, 200),

    _setSearchFilter: function(searchCriteria) {
        this.searchFilter = function(requestView) {
            return searchCriteria.matches(requestView.model.toJSON());
        };

        _.each(this.requestViews, function(requestView) {
            requestView.$el.toggle(this.searchFilter(requestView));
        }.bind(this));
    },

    _clearSearchFilter: function() {
        this.searchFilter = null;

        _.each(this.requestViews, function(requestView) {
            requestView.$el.toggle(true);
        });
    },

    _filterRequestsToFavorites: function(e) {
        var $favorite = $(e.currentTarget);
        $favorite.removeClass('enabled').addClass('active');
    },

    _removeFavoritesFilter: function(e) {
        var $favorite = $(e.currentTarget);
        $favorite.removeClass('active').addClass('enabled');
    },

    _isScrolledToBottom: function() {
        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    _scrollToBottom: function() {
        window.scrollTo(0,document.body.scrollHeight);
    }

});

module.exports = AppView;
