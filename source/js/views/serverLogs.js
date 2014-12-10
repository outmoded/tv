var Backbone = require('backbone');
var _ = require('lodash');
var Clipboard = require('../clipboard');
var ZeroClipboard = require('zeroclipboard');

var ServerLogsView = Backbone.View.extend({

    template: require('../templates/serverLogs.hbs'),

    events: {
        'click .data': '_toggleServerLogData'
    },

    initialize: function() {
        this.listenTo(this.collection, 'add', function(model) {
            this.render();
        }.bind(this));
    },

    render: function() {
        this.$el.html(this.template(this.collection.toJSON()));

        if (!this.clipboard) {
            this._initializeClipboard();
        }

        return this;
    },

    _clipboard: function() {
        ZeroClipboard.config({
            swfPath: location.href + '/js/ZeroClipboard.swf'
        });

        return new ZeroClipboard(this.$('.copy').get(0));
    },

    _initializeClipboard: function() {
        this.clipboard = this._clipboard();

        this.clipboard.on('ready', function( readyEvent ) {

            this.clipboard.on( 'beforecopy', function( event ) {
                this.clipboard.setData('text/plain', Clipboard.convertToText(this.model.toJSON()));
            }.bind(this));

            this.clipboard.on( 'aftercopy', function( event ) {
                alert('copied'); // TODO: use a tooltip instead
            });

        }.bind(this));
    },

    _toggleServerLogData: function(e) {
        var $data = $(e.currentTarget);

        $data.toggleClass('expanded');
    }

});

module.exports = ServerLogsView;
