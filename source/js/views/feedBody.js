'use strict';
// Load modules

const Backbone = require('backbone');
const _ = require('lodash');

const RequestView = require('./request');
const SearchCriteria = require('../utils/search/searchCriteria');


// Declare internals

const internals = {};


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

        _.each(this._requestViews, (requestView) => {

            requestView.remove();
        });

        this._requestViews = [];
    },

    hasFavoritedRequests: function () {

        return _.any(this._requestViews, (requestView) => {

            return requestView.favorited;
        });
    },

    hasExpandedRequests: function () {

        return _.any(this._requestViews, (requestView) => {

            return requestView.active;
        });
    },

    collapseAll: function () {

        this.$('.request.active').removeClass('active');
        this.$('.request .server-logs').hide();

        _.each(this._requestViews, (requestView) => {

            requestView.active = false;
        });
    },

    toggleFavorites: function (toggle) {

        this._filterFavorites = toggle;
        this._refreshRequestsVisibility();
    },

    filterRequests: function (queryString) {

        const searchCriteria = SearchCriteria.create(queryString);
        this.searchFilter = function (requestView) {

            return searchCriteria.matches(requestView.model.toJSON());
        };

        this._refreshRequestsVisibility();
    },

    _refreshRequestsVisibility: function () {

        _.each(this._requestViews, this._updateRequestVisibility.bind(this));
    },

    _addRequest: function (request) {

        const requestView = new RequestView({ model: request }).render();
        this._requestViews.push(requestView);

        this.listenTo(requestView, 'serverLogsToggle', (expanded) => {

            this.trigger('requestExpandToggle', expanded);
        });

        this.listenTo(requestView, 'favoriteToggle', (favorited) => {

            this.trigger('requestFavoriteToggle', favorited);

            if (!favorited && self._filterFavorites) {
                requestView.toggleVisibility(false);
            }
        });

        this._updateRequestVisibility(requestView);

        this.listenTo(request, 'change:statusCode', () => {

            this._updateRequestVisibility(requestView, true);
        });

        this._checkToScrollToBottom(() => {

            this.$el.append(requestView.$el);
        });
    },

    _checkToScrollToBottom: function (domManipulationFn) {

        const isScrolledToBottom = this._isScrolledToBottom();

        domManipulationFn();

        if (isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    _updateRequestVisibility: function (requestView, isUpdate) {

        let show = true;

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
