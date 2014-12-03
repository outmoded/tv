var Backbone = require('backbone');

var ToolbarView = Backbone.View.extend({

    template: require('../templates/toolbar.hbs'),

    render: function() {
        var $markup = $(this.template());

        this.$el.html($markup);

        return this;
    }

});

module.exports = ToolbarView;
