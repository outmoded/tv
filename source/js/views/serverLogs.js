var Backbone = require('backbone');
var _ = require('lodash');

var ServerLogsView = Backbone.View.extend({

    template: require('../templates/serverLogs.hbs'),

    templateContext: function() {
        return _.map(this.collection.models, function(model) {
            var attributes = _.clone(model.attributes);

            if(_.contains(attributes.tags, 'internal')) {
                attributes.tags = _.without(attributes.tags, 'internal');
                attributes.internal = "internal";
            }

            return attributes;
        });
    },

    initialize: function() {
        this.listenTo(this.collection, 'add', function(model) {
            this.render();
        });
    },

    events: {
        'click .data': '_toggleServerLogData'
    },

    render: function() {
        this.$el.html(this.template(this.templateContext()));

        return this;
    },

    _toggleServerLogData: function(e) {
        var $data = $(e.currentTarget);

        $data.find('.json-markup').toggleClass('expanded');
        $data.toggleClass('expanded');
    }

});

module.exports = ServerLogsView;
