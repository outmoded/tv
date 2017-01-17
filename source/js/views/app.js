'use strict';
// Load modules

const Backbone = require('backbone');

const ToolbarView = require('./toolbar');
const FeedHeaderView = require('./feedHeader');
const FeedBodyView = require('./feedBody');
const SettingsView = require('./settings');
const Settings = require('../models/settings');
const SettingsStore = require('../settingsStore');
const ClientIdGenerator = require('../utils/clientIdGenerator');


// Declare internals

const internals = {};


exports = module.exports = internals.AppView = Backbone.View.extend({

    template: require('../templates/app.hbs'),

    initialize: function (opts) {

        this._webSocketManager = opts.webSocketManager;

        this.model = new Settings(null, {
            webSocketManager: opts.webSocketManager
        });
    },

    render: function () {

        const $markup = $(this.template());

        this._renderChildViews($markup);

        this.$el.html($markup);

        return this;
    },

    _renderChildViews: function ($markup) {

        const settingsView = this._renderSettings($markup);
        const toolbarView = this._renderToolbar($markup);
        const feedHeaderView = this._renderFeedHeader($markup);
        const feedBodyView = this._renderFeedBody($markup);

        this.listenTo(toolbarView, 'pause', this._webSocketManager.pause.bind(this._webSocketManager));
        this.listenTo(toolbarView, 'resume', this._webSocketManager.resume.bind(this._webSocketManager));
        this.listenTo(toolbarView, 'searchChanged', feedBodyView.filterRequests.bind(feedBodyView));
        this.listenTo(toolbarView, 'showSettings', settingsView.show.bind(settingsView));
        this.listenTo(toolbarView, 'clearFeed', function () {

            this._handleClearFeed(feedHeaderView, feedBodyView);
        });

        this.listenTo(feedHeaderView, 'toggleFavorites', feedBodyView.toggleFavorites.bind(feedBodyView));
        this.listenTo(feedHeaderView, 'collapseAll', feedBodyView.collapseAll.bind(feedBodyView));

        this.listenTo(feedBodyView, 'requestExpandToggle', function (expanded) {

            this._handleRequestExpandToggle(expanded, feedHeaderView, feedBodyView);
        });

        this.listenTo(feedBodyView, 'requestFavoriteToggle', function (favorited) {

            this._handleRequestFavoriteToggle(favorited, feedHeaderView, feedBodyView);
        });
    },

    _renderToolbar: function ($markup) {

        return new ToolbarView({
            el: $markup.siblings('.toolbar'),
            model: this.model
        }).render();
    },

    _renderSettings: function ($markup) {

        const settingsView = new SettingsView({
            el: $markup.siblings('.settings-modal-container'),
            settingsModel: this.model
        });

        if (this._firstVisit()) {
            this.model.set('clientId', ClientIdGenerator.generate());
            this.model.set('channel', '*');
            settingsView.render().show();
        }
        else {
            settingsView.render();
        }

        return settingsView;
    },

    _firstVisit: function (){

        return !SettingsStore.exists('channel');
    },

    _renderFeedHeader: function ($markup) {

        return new FeedHeaderView({
            el: $markup.find('.header')
        }).render();
    },

    _renderFeedBody: function ($markup) {

        return new FeedBodyView({
            el: $markup.find('.body'),
            collection: this.collection
        }).render();
    },


    _handleRequestExpandToggle: function (expanded, feedHeaderView, feedBodyView) {

        if (!expanded && !feedBodyView.hasExpandedRequests()) {
            feedHeaderView.disableCollapseAll();
        }
        else if (expanded) {
            feedHeaderView.enableCollapseAll();
        }
    },

    _handleRequestFavoriteToggle: function (favorited, feedHeaderView, feedBodyView) {

        if (!favorited && !feedBodyView.hasFavoritedRequests()) {
            feedHeaderView.disableFavoritesFilter();
        }
        else if (favorited) {
            feedHeaderView.enableFavoritesFilter();
        }
    },

    _handleClearFeed: function (feedHeaderView, feedBodyView) {

        feedHeaderView.clear();
        feedBodyView.clear();
    }

});
