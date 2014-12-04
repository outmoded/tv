var Backbone = require('backbone');

var FeedView = Backbone.View.extend({

    template: require('../templates/feed.hbs'),

    initialize: function(options) {
        this.listenTo(this.model, 'change:channel', this.render);
    },

    events: {
        'click .header .expander': '_collapseAllExpandedRequests'
    },

    render: function() {
        this.$el.html(this.template());

        return this;
    },

    _collapseAllExpandedRequests: function() {
        this.$('.request.active').removeClass('active');
        this.$('.request .server-logs').hide();
        this.$('.header .expander').removeClass('expanded');
    }

});

module.exports = FeedView;
