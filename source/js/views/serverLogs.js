var Backbone = require('backbone');
var _ = require('lodash');
var Clipboard = require('../clipboard');
var ZeroClipboard = require('zeroclipboard');

var ServerLogsView = Backbone.View.extend({

    template: require('../templates/serverLogs.hbs'),

    events: {
        'click .json-markup': '_toggleServerLogData'
    },

    initialize: function() {
        var self = this;
        this.listenTo(this.collection, 'add', function(model) {
            this.render();
        });
    },

    render: function() {
        this.$el.html(this.template(this.collection.toJSON()));

        if (!this.clipboard) {
            this._initializeClipboard();
        }

        return this;
    },

    _clipboard: function() {
        this.$clipboard = this.$('.copy');

        ZeroClipboard.config({
            swfPath: location.href + '/js/ZeroClipboard.swf'
        });

        return new ZeroClipboard(this.$clipboard.get(0));
    },

    _initializeClipboard: function() {
        this.clipboard = this._clipboard();

        var self = this;
        this.clipboard.on('ready', function( readyEvent ) {

            self.clipboard.on( 'beforecopy', function( event ) {
                self.clipboard.setData('text/plain', Clipboard.convertToText(self.model.toJSON()));

                self.$clipboard.tooltip({
                    delay: {hide: 2000},
                    placement: 'left',
                    animation: 'fade',
                    title: 'Copied to clipboard!'
                });

                self.$clipboard.tooltip('show');
            });

            self.clipboard.on( 'aftercopy', function( event ) {
                setTimeout(function() {
                    self.$clipboard.tooltip('hide');
                }, 3000);
            });

        });
    },

    _toggleServerLogData: function(e) {
        var $data = $(e.currentTarget);

        $data.closest('.data').toggleClass('expanded');
    }

});

module.exports = ServerLogsView;
