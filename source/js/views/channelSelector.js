var Backbone = require('backbone');
var SettingsStore = require('../settingsStore');


var ChannelSelectorView = Backbone.View.extend({

    _store: SettingsStore,

    template: require('../templates/channelSelector.hbs'),

    events: {
        'click button': '_updateChannel'
    },

    initialize: function() {
        this.listenTo(this.model, 'change:clientId change:channel', this.render);
    },

    render: function() {
        var data = {
            clientId: this.model.get('clientId'),
            channel: this._store.get('channel')
        };

        this.$el.html(this.template(data));

        return this;
    },

    _updateChannel: function(e) {
        this.model.set('channel', $(e.currentTarget).attr('data-channel'));
    }

});

module.exports = ChannelSelectorView;
