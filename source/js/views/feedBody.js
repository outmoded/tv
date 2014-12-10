var Backbone = require('backbone');
var _ = require('lodash');

var RequestView = require('./request');
var SearchCriteria = require('../utils/searchCriteria').SearchCriteria;

var FeedBodyView = Backbone.View.extend({

    nextVisibleRequestIndex: 0,

    initialize: function(options) {
        this.listenTo(this.collection, 'add', this._addRequest);
    },

    render: function() {
        this.clear();

        return this;
    },

    clear: function() {
        this.$el.empty();

        _.each(this.requestViews, function(requestView) {
            requestView.remove();
        });

        this.nextVisibleRequestIndex = 0;
        this.requestViews = [];
    },

    hasFavoritedRequests: function() {
        return this.$('.request .favorite.active').length > 0;
    },

    hasExpandedRequests: function() {
        return this.$('.request.active').length > 0;
    },

    collapseAll: function() {
        this.$('.request.active').removeClass('active');
        this.$('.request .server-logs').hide();
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

    _addRequest: function(request) {
        var requestView = new RequestView({ model: request }).render();
        this.requestViews.push(requestView);

        this.listenTo(requestView, 'serverLogsToggle', function(toggle) {
            this.trigger('requestExpandToggle', toggle);
        }.bind(this));

        this.listenTo(requestView, 'favoriteToggle', function(toggle) {
            this.trigger('requestFavoriteToggle', toggle);

            if(!toggle) {
                this._updateRequestVisibility(requestView);
            }
        }.bind(this));

        this._updateRequestVisibility(requestView);

        this.listenTo(request, 'change:statusCode', function() {
            this._updateRequestVisibility(requestView, true);
        });

        this._checkToScrollToBottom( _.bind(function() {
            this.$el.append(requestView.$el);
        }, this) );
    },

    _checkToScrollToBottom: function(domManipulationFn) {
        var isScrolledToBottom = this._isScrolledToBottom();

        domManipulationFn();

        if (isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    toggleFavorites: function(toggle) {
        this.filterFavorites = toggle;
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

module.exports = FeedBodyView;
