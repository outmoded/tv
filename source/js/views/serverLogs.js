var Backbone = require('backbone');

var ServerLogsView = Backbone.View.extend({

    template: require('../templates/serverLogs.hbs'),

    initialize: function() {
        this.listenTo(this.collection, 'add', function(model) {
            this.render();
        });
    },

    events: {
        'click .data': '_toggleServerLogData'
    },

    render: function() {
        this.$el.html(this.template(this.collection.toJSON()));

        return this;
    },

    _toggleServerLogData: function(e) {
        $data = $(e.currentTarget);

        $data.find('.json-markup').toggleClass('expanded');
        $data.toggleClass('expanded');
    }

});

module.exports = ServerLogsView;
