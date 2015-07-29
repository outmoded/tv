// Load modules

var Backbone = require('backbone');

// Declare internals

var internals = {};


exports = module.exports = internals.RequestDetailsView = Backbone.View.extend({

    template: require('../templates/requestDetails.hbs'),

    initialize: function () {

        this.listenTo(this.model, 'change', function (){

            this.render();
        });
    },

    render: function () {

        var $markup = $(this.template(this.model.attributes));

        this.$el.toggleClass('error', this.model.hasError());
        this.$el.toggleClass('warning', this.model.hasWarning());

        this.$el.html($markup);

        return this;
    }

});
