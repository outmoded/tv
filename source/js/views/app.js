var Backbone = require('backbone');

var ToolbarView = require('./toolbar');
var FeedHeaderView = require('./feedHeader');
var FeedBodyView = require('./feedBody');
var SettingsView = require('./settings');
var Settings = require('../models/settings');

var AppView = Backbone.View.extend({

    template: require('../templates/app.hbs'),

    initialize: function(opts) {
        this.model = new Settings(null, { webSocketManager: opts.webSocketManager });
        this.webSocketManager = opts.webSocketManager;
    },

    render: function() {
        var $markup = $(this.template());

        this._renderChildViews($markup);

        this.$el.html($markup);

        return this;
    },

    _renderChildViews: function($markup) {
        var settingsView = new SettingsView({ 
            el: $markup.siblings('.settings-modal-container'),
            settingsModel: this.model
        }).render();

        var feedHeaderView = new FeedHeaderView({
            el: $markup.find('.header'),
            webSocketManager: this.webSocketManager
        }).render();

        var feedBodyView = new FeedBodyView({
            el: $markup.find('.body'),
            collection: this.collection
        }).render();

        var toolbarView = new ToolbarView({
            el: $markup.siblings('.toolbar'),
            model: this.model,
            webSocketManager: this.webSocketManager
        }).render();

        this.listenTo(toolbarView, 'searchChanged', feedBodyView.filterRequests.bind(feedBodyView));
        this.listenTo(toolbarView, 'showSettings', settingsView.show);
        this.listenTo(toolbarView, 'clearFeed', function() {
            feedHeaderView.clear();
            feedBodyView.clear();
        });

        this.listenTo(feedHeaderView, 'toggleFavorites', feedBodyView.toggleFavorites.bind(feedBodyView));
        this.listenTo(feedHeaderView, 'collapseAll', feedBodyView.collapseAll.bind(feedBodyView));

        this.listenTo(feedBodyView, 'requestExpandToggle', function(expanded) {
            if (!expanded && !feedBodyView.hasExpandedRequests()) {
                feedHeaderView.disableCollapseAll();
            } else if(expanded) {
                feedHeaderView.enableCollapseAll();
            }
        });

        this.listenTo(feedBodyView, 'requestFavoriteToggle', function(favorited) {
            if (!favorited && !feedBodyView.hasFavoritedRequests()) {
                feedHeaderView.disableFavoritesFilter();
            } else if (favorited) {
                feedHeaderView.enableFavoritesFilter();
            }
        });
    }

});

module.exports = AppView;
