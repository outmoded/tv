var Backbone = require('backbone');
var _ = require('lodash');

var ToolbarView = require('./toolbar');
var FeedView = require('./feed');
var RequestView = require('./request');
var SettingsView = require('./settings');
var SearchCriteria = require('../utils/searchCriteria').SearchCriteria;
var Settings = require('../models/settings');

var AppView = Backbone.View.extend({

    template: require('../templates/app.hbs'),

    nextVisibleRequestIndex: 0,

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
                this._updateRequestVisibility(requestView, true);
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

        this.nextVisibleRequestIndex = 0;
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

    _filterRequestsToFavorites: function(e) {
        $(e.currentTarget).removeClass('enabled').addClass('active');
        this.filterFavorites = true;
        this._filterRequests();
    },

    _removeFavoritesFilter: function(e) {
        $(e.currentTarget).removeClass('active').addClass('enabled');
        this.filterFavorites = false;
        this._filterRequests();
    },

    _filterRequests: _.debounce(function(e) {
        var queryString = $('input.search').val();

        this.nextVisibleRequestIndex = 0;
        this._setSearchFilter(SearchCriteria.create(queryString));
        _.each(this.requestViews, this._updateRequestVisibility.bind(this));
    }, 200),

    _updateRequestVisibility: function(requestView, isUpdate) {
        var show = true;

        if(this.searchFilter && !this.searchFilter(requestView)) {
            show = false;
        }

        if(this.filterFavorites && !requestView.favorited) {
            show = false;
        }

        if(show) {
            var setStripe = true;

            if(isUpdate === true) {
                var showingForTheFirstTime = requestView.$el.hasClass('hidden');
                if(!showingForTheFirstTime) {
                    setStripe = false;
                }
            }

            if(setStripe) {
                var odd = this.nextVisibleRequestIndex % 2 === 0;
                requestView.$el.toggleClass('odd', odd).toggleClass('even', !odd);
                this.nextVisibleRequestIndex = this.nextVisibleRequestIndex + 1;
            }
        }

        requestView.$el.toggleClass('hidden', !show);
    },

    _setSearchFilter: function(searchCriteria) {
        this.searchFilter = function(requestView) {
            return searchCriteria.matches(requestView.model.toJSON());
        };
    },

    _isScrolledToBottom: function() {
        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    _scrollToBottom: function() {
        window.scrollTo(0,document.body.scrollHeight);
    }

});

module.exports = AppView;
