// Load modules

var Backbone = require('backbone');
var _ = require('lodash');

var RequestView = require('./request');
var SearchCriteria = require('../utils/search/searchCriteria');


// Declare internals

var internals = {};


exports = module.exports = internals.FeedBodyView = Backbone.View.extend({

    _requestViews: [],
    _filterFavorites: false,

    initialize: function (options) {

        this.listenTo(this.collection, 'add', this._addRequest);
    },

    render: function () {

        this.clear();

        return this;
    },

    clear: function () {

        this.$el.empty();

        _.each(this._requestViews, function (requestView) {

            requestView.remove();
        });

        this._requestViews = [];
    },

    hasFavoritedRequests: function () {

        return _.any(this._requestViews, function (requestView) {

            return requestView.favorited;
        });
    },

    hasExpandedRequests: function () {

        return _.any(this._requestViews, function (requestView) {

            return requestView.active;
        });
    },

    collapseAll: function () {

        this.$('.request.active').removeClass('active');
        this.$('.request .server-logs').hide();

        _.each(this._requestViews, function (requestView) {

            requestView.active = false;
        });
    },

    toggleFavorites: function (toggle) {

        this._filterFavorites = toggle;
        this._refreshRequestsVisibility();
    },

    filterRequests: function (queryString) {

        var searchCriteria = SearchCriteria.create(queryString);
        this.searchFilter = function (requestView) {

            return searchCriteria.matches(requestView.model.toJSON());
        };

        this._refreshRequestsVisibility();
    },

    _refreshRequestsVisibility: function () {

        _.each(this._requestViews, this._updateRequestVisibility.bind(this));
    },

    _addRequest: function (request) {

        var requestView = new RequestView({ model: request }).render();
        this._requestViews.push(requestView);

        var self = this;

        this.listenTo(requestView, 'serverLogsToggle', function (expanded) {

            self.trigger('requestExpandToggle', expanded);
        });

        this.listenTo(requestView, 'favoriteToggle', function (favorited) {

            self.trigger('requestFavoriteToggle', favorited);

            if (!favorited && self._filterFavorites) {
                requestView.toggleVisibility(false);
            }
        });

        this._updateRequestVisibility(requestView);

        this.listenTo(request, 'change:statusCode', function () {

            self._updateRequestVisibility(requestView, true);
        });

        this._checkToScrollToBottom(function () {

            self.$el.append(requestView.$el);
        });
    },

    _checkToScrollToBottom: function (domManipulationFn) {

        var isScrolledToBottom = this._isScrolledToBottom();

        domManipulationFn();

        if (isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    _updateRequestVisibility: function (requestView, isUpdate) {

        var show = true;

        if (this.searchFilter && !this.searchFilter(requestView)) {
            show = false;
        }

        if (this._filterFavorites && !requestView.favorited) {
            show = false;
        }

        requestView.toggleVisibility(show);
    },

    _isScrolledToBottom: function () {

        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    _scrollToBottom: function () {

        window.scrollTo(0, document.body.scrollHeight);
    }

});
