var Backbone = require('backbone');
var ServerLogsView = require('./serverLogs');
var RequestDetailsView = require('./requestDetails');

var RequestView = Backbone.View.extend({

    template: require('../templates/request.hbs'),

    className: 'request hidden',

    events: {
        'click .request-details': '_toggleServerLogs',
        'click .favorite': '_toggleFavorite'
    },

    initialize: function(options) {
        this.active = false;
        this.favorited = false;
    },

    render: function() {
        var $markup = $(this.template());

        new RequestDetailsView({
            el: $markup.siblings('.request-details'),
            model: this.model}).render();

        $markup.siblings('.server-logs').hide();

        this.$el.html($markup);

        return this;
    },

    _toggleServerLogs: function() {
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

            this.trigger('serverLogsExpanded');
        } else if (this.serverLogsView) {
            this.serverLogsView.$el.hide();

            this.trigger('serverLogsCollapsed');
        }
    },

    _toggleFavorite: function(e) {
        e.stopPropagation();

        this.favorited = !this.favorited;

        this.$('.favorite').toggleClass('active', this.favorited);

        if (this.favorited) {
            this.trigger('favorited');
        } else {
            this.trigger('unfavorited');
        }
    }

});

module.exports = RequestView;
