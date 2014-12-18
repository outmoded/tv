// Load modules

var Backbone = require('backbone');

var SettingsStore = require('../settingsStore');


// Declare internals

var internals = {};


exports = module.exports = internals.ChannelSelectorView = Backbone.View.extend({

    template: require('../templates/channelSelector.hbs'),

    events: {
        'click button': '_updateChannel'
    },

    initialize: function () {

        this.listenTo(this.model, 'change:clientId', function (model, clientId) {

            this.$('.client-id').attr('data-channel', clientId).find('span').html(clientId);
        });

        this.listenTo(this.model, 'change:channel', function (model, channel) {

            this.$('.active').removeClass('active');
            this.$('[data-channel="' + channel + '"]').addClass('active');
        });
    },

    render: function () {

        var data = {
            clientId: this.model.get('clientId'),
            channel: this.model.get('channel')
        };

        this.$el.html(this.template(data));

        return this;
    },

    _updateChannel: function (e) {

        this.model.set('channel', $(e.currentTarget).attr('data-channel'));
    }

});
