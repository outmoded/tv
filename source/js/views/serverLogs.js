var Backbone = require('backbone');
var _ = require('lodash');
var Clipboard = require('../clipboard');
var ZeroClipboard = require('zeroclipboard');

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

    _clipboard: function() {
        ZeroClipboard.config({
            swfPath: location.href + "/js/ZeroClipboard.swf"
        });

        return new ZeroClipboard(this.$('.copy').get(0));
    },

    initialize: function() {
        this.listenTo(this.collection, 'add', function(model) {
            this.render();
        });
    },

    events: {
        'click .data': '_toggleServerLogData',
        'click .copy': '_copyToClipboard'
    },

    render: function() {
        this.$el.html(this.template(this.templateContext()));

        if(!this.clipboard) {
            this._initializeClipboard();
        }

        this.clipboard.setData({"text/plain": Clipboard.convertToText(this.model.toJSON())})

        return this;
    },

    _initializeClipboard: function() {
        this.clipboard = this._clipboard();
        
        this.clipboard.on( "ready", _.bind(function( readyEvent ) {
        
          this.clipboard.on( "aftercopy", function( event ) {
            alert('copied');
          });
        }, this));
    },

    _toggleServerLogData: function(e) {
        var $data = $(e.currentTarget);

        $data.find('.json-markup').toggleClass('expanded');
        $data.toggleClass('expanded');
    },

    _copyToClipboard: function(e) {
        e.preventDefault();
        
        
    }

});

module.exports = ServerLogsView;
