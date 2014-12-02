var Backbone = require('backbone');

var FeedView = Backbone.View.extend({

    template: require('../templates/feed.hbs'),

    render: function() {
        this.$el.html(this.template());

        return this;
    },

});

module.exports = FeedView;
