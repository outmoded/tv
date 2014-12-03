var Backbone = require('backbone');

var FeedView = Backbone.View.extend({

    template: require('../templates/feed.hbs'),

    initialize: function(options) {
        this.listenTo(this.model, 'change:channel', this.render);
    },

    render: function() {
        this.$el.html(this.template());

        return this;
    },

});

module.exports = FeedView;
