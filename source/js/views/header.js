var Backbone = require('backbone');

var HeaderView = Backbone.View.extend({

    template: require('../templates/header.hbs'),

    render: function() {
        this.$el.html(this.template());

        return this;
    }

});

module.exports = HeaderView;
