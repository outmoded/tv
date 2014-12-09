var Backbone = require('backbone');
var ChannelSelectorView = require('./channelSelector');

var ToolbarView = Backbone.View.extend({

    template: require('../templates/toolbar.hbs'),

    events: {
        'click .settings': function(e) { this.appView.settingsView.show(); }
    },

    initialize: function(options) {
        this.appView = options.appView;
    },

    render: function() {
        this.$el.html(this.template());

        this.channelSelectorView = new ChannelSelectorView({ el: this.$('.channel-selector-container'), model: this.model }).render();

        return this;
    }

});

module.exports = ToolbarView;
