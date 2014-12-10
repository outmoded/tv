var Backbone = require('backbone');
var _ = require('lodash');

var RequestView = require('./request');
var SearchCriteria = require('../utils/searchCriteria').SearchCriteria;

var FeedView = Backbone.View.extend({

    template: require('../templates/feed.hbs'),

    nextVisibleRequestIndex: 0,

    initialize: function(options) {
        this.requestViews = [];

        this.listenTo(this.model, 'change:channel', this.render);
        this.listenTo(this.collection, 'add', this._addRequest);
    },

    events: {
        'click .header .expander': '_collapseAllExpandedRequests',
        'click .favorite.enabled': '_filterRequestsToFavorites',
        'click .favorite.active': '_removeFavoritesFilter'
    },

    render: function() {
        this.$el.html(this.template());

        return this;
    },

    clear: function() {
        this.$('.feed .body').html('');

        _.each(this.requestViews, function(requestView) {
            requestView.remove();
        });

        this.nextVisibleRequestIndex = 0;
        this.requestViews = [];
    },

    filterRequests: function(queryString) {
        var searchCriteria = SearchCriteria.create(queryString);
        this.searchFilter = function(requestView) {
            return searchCriteria.matches(requestView.model.toJSON());
        };

        this._refreshRequestsVisibility();
    },

    _refreshRequestsVisibility: function() {
        this.nextVisibleRequestIndex = 0;

        _.each(this.requestViews, _.bind(this._updateRequestVisibility, this));
    },

    _collapseAllExpandedRequests: function() {
        this.$('.request.active').removeClass('active');
        this.$('.request .server-logs').hide();
        this.$('.header .expander').removeClass('expanded');
    },

    _addRequest: function(request) {
        var requestView = new RequestView({ model: request }).render();
        this.requestViews.push(requestView);

        this.listenTo(requestView, 'serverLogsExpanded',  this._enableCollapseAllAction);
        this.listenTo(requestView, 'serverLogsCollapsed', this._checkToDisableCollapseAllAction);

        this.listenTo(requestView, 'favorited',   this._enableFilterFavoritesAction);
        this.listenTo(requestView, 'unfavorited', this._checkToDisableFilterFavoritesAction);

        this._updateRequestVisibility(requestView);

        this.listenTo(request, 'change:statusCode', function() {
            this._updateRequestVisibility(requestView, true);
        });

        this._checkToScrollToBottom( _.bind(function() {
            this.$('.body').append(requestView.el);
        }, this) );
    },

    _enableCollapseAllAction: function() {
        this.$('.header .expander').addClass('expanded');
    },

    _checkToDisableCollapseAllAction: function() {
        if (this.$('.request.active').length === 0) {
            this.$('.header .expander').removeClass('expanded');
        }
    },

    _enableFilterFavoritesAction: function() {
        this.$('.header .favorite').addClass('enabled');
    },

    _checkToDisableFilterFavoritesAction: function() {
        if (this.$('.request .favorite.active').length === 0) {
            this.$('.header .favorite')
                .removeClass('enabled')
                .removeClass('active')
                .addClass('empty');

            this.filterFavorites = false;
        }

        this._refreshRequestsVisibility();
    },

    _checkToScrollToBottom: function(domManipulationFn) {
        var isScrolledToBottom = this._isScrolledToBottom();

        domManipulationFn();

        if (isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    _filterRequestsToFavorites: function(e) {
        $(e.currentTarget).removeClass('enabled').addClass('active');
        this.filterFavorites = true;
        this._refreshRequestsVisibility();
    },

    _removeFavoritesFilter: function(e) {
        $(e.currentTarget)
            .removeClass('active')
            .addClass('enabled');
        this.filterFavorites = false;
        this._refreshRequestsVisibility();
    },

    _updateRequestVisibility: function(requestView, isUpdate) {
        var show = true;

        if (this.searchFilter && !this.searchFilter(requestView)) {
            show = false;
        }

        if (this.filterFavorites && !requestView.favorited) {
            show = false;
        }

        if (show) {
            var setStripe = true;

            if (isUpdate === true) {
                var showingForTheFirstTime = requestView.$el.hasClass('hidden');
                if (!showingForTheFirstTime) {
                    setStripe = false;
                }
            }

            if (setStripe) {
                var odd = this.nextVisibleRequestIndex % 2 === 0;
                requestView.$el.toggleClass('odd', odd).toggleClass('even', !odd);
                this.nextVisibleRequestIndex = this.nextVisibleRequestIndex + 1;
            }
        }

        requestView.$el.toggleClass('hidden', !show);
    },

    _isScrolledToBottom: function() {
        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    _scrollToBottom: function() {
        window.scrollTo(0,document.body.scrollHeight);
    }

});

module.exports = FeedView;
