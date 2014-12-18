// Load modules

var Backbone = require('backbone');

var ServerLogsView = require('./serverLogs');
var RequestDetailsView = require('./requestDetails');


// Declare internals

var internals = {};


exports = module.exports = internals.RequestView = Backbone.View.extend({

    template: require('../templates/request.hbs'),

    className: 'request hidden',

    events: {
        'click .request-details': '_toggleServerLogs',
        'click .favorite': '_toggleFavorite'
    },

    favorited: false,
    active:    false,
    visible:   false,

    render: function () {

        var $markup = $(this.template());

        new RequestDetailsView({
            el: $markup.siblings('.request-details'),
            model: this.model}).render();

        $markup.siblings('.server-logs').hide();

        this.$el.html($markup);

        return this;
    },

    toggleVisibility: function (visible) {

        this.visible = visible;
        this.$el.toggleClass('hidden', !visible);
    },

    _toggleServerLogs: function () {

        this.active = !this.active;

        this.$el.toggleClass('active', this.active);

        if (!this.serverLogsView) {
            this.serverLogsView = new ServerLogsView({
                el: this.$('.server-logs'),
                model: this.model,
                collection: this.model.get('serverLogs')
            }).render();
        }

        if (this.active) {
            this.serverLogsView.$el.show();
        }
        else if (this.serverLogsView) {
            this.serverLogsView.$el.hide();
        }

        this.trigger('serverLogsToggle', this.active);
    },

    _toggleFavorite: function (e) {

        e.stopPropagation();

        this.favorited = !this.favorited;

        this.$('.favorite').toggleClass('active', this.favorited);

        this.trigger('favoriteToggle', this.favorited);
    }

});
