var Backbone = require('backbone');

var ToolbarView = require('./toolbar');
var FeedView = require('./feed');
var SettingsView = require('./settings');
var Settings = require('../models/settings');

var AppView = Backbone.View.extend({

    template: require('../templates/app.hbs'),

    initialize: function(opts) {
        this.model = new Settings({ webSocketManager: opts.webSocketManager });
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

        var feedView = new FeedView({
            el: $markup.siblings('.feed'),
            model: this.model,
            collection: this.collection,
            webSocketManager: this.webSocketManager
        }).render();

        var toolbarView = new ToolbarView({
            el: $markup.siblings('.toolbar'),
            model: this.model,
            webSocketManager: this.webSocketManager
        }).render();

        this.listenTo(toolbarView, 'searchChanged', feedView.filterRequests.bind(feedView));
        this.listenTo(toolbarView, 'showSettings',  settingsView.show);
        this.listenTo(toolbarView, 'clearFeed',  feedView.clear.bind(feedView));
    }

});

module.exports = AppView;
