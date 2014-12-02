var Backbone = require('backbone');
var ServerLogsView = require('./serverLogs');
var RequestDetailsView = require('./requestDetails');

var RequestView = Backbone.View.extend({
    initialize: function() {
        this.listenTo(this.model, 'change:visible', function() {
            this._updateVisibility();
        });
    },

    template: require('../templates/request.hbs'),

    className: "request",

    events: {
        'click .request-details': '_toggleServerLogs'
    },

    render: function() {
        var $markup = $(this.template());

        this._updateVisibility($markup);

        new RequestDetailsView({
            el: $markup.siblings('.request-details'),
            model: this.model}).render();

        $markup.siblings('.server-logs').hide();

        this.$el.html($markup);

        return this;
    },

    _updateVisibility: function(el) {
        el = el || this.$el;
        el.toggle(this.model.get('visible'));
    },

    _toggleServerLogs: function() {
        var active = !this.model.get('active');
        this.model.set('active', active);

        if(active) {
            this.serverLogsView = new ServerLogsView({
                el: this.$('.server-logs'),
                collection: this.model.get('serverLogs') }).render();
            this.serverLogsView.$el.show();
        } else if(this.serverLogsView) {
            this.serverLogsView.$el.hide();
        }
    }

});

module.exports = RequestView;
