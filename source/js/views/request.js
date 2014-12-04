var Backbone = require('backbone');
var ServerLogsView = require('./serverLogs');
var RequestDetailsView = require('./requestDetails');

var RequestView = Backbone.View.extend({
    template: require('../templates/request.hbs'),

    className: "request",

    events: {
        'click .request-details': '_toggleServerLogs'
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
        var active = !this.$el.hasClass('active');
        this.$el.toggleClass('active', active);

        if(active) {
            if(!this.serverLogsView) {
                this.serverLogsView = new ServerLogsView({
                    el: this.$('.server-logs'),
                    collection: this.model.get('serverLogs') }).render();
            }

            this.serverLogsView.$el.show();

            this.trigger('serverLogsExpanded');
        } else if(this.serverLogsView) {
            this.serverLogsView.$el.hide();
        }
    }

});

module.exports = RequestView;
