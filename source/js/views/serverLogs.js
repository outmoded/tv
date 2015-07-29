// Load modules

var Backbone = require('backbone');
var ZeroClipboard = require('zeroclipboard');
var _ = require('lodash');

var RequestToTextConverter = require('../utils/requestToTextConverter');


// Declare internals

var internals = {};


exports = module.exports = internals.ServerLogsView = Backbone.View.extend({

    template: require('../templates/serverLogs.hbs'),

    events: {
        'click .json-markup': '_toggleServerLogData'
    },

    initialize: function () {

        var self = this;
        this.listenTo(this.collection, 'add', function (model) {

            this.render();
        });
    },

    render: function () {

        this.$el.html(this.template(this.collection.toJSON()));

        this._initializeClipboard();

        return this;
    },

    _initializeClipboard: function () {

        clipboard = this._createZeroClipboard();

        var self = this;
        clipboard.on('ready', function (readyEvent) {

            clipboard.on('beforecopy', function (event) {

                clipboard.setData('text/plain', RequestToTextConverter.convertToText(self.model.toJSON()));

                self._$clipboard.tooltip({
                    delay: { hide: 2000 },
                    placement: 'left',
                    animation: 'fade',
                    title: 'Copied to clipboard!'
                });

                self._$clipboard.tooltip('show');
            });

            clipboard.on('aftercopy', function (event) {

                setTimeout(function () {

                    self._$clipboard.tooltip('hide');
                }, 3000);
            });

        });
    },

    _createZeroClipboard: function () {

        this._$clipboard = this.$('.copy');

        ZeroClipboard.config({
            swfPath: location.href + '/js/ZeroClipboard.swf'
        });

        return new ZeroClipboard(this._$clipboard.get(0));
    },

    _toggleServerLogData: function (e) {

        var $data = $(e.currentTarget);

        $data.closest('.data').toggleClass('expanded');
    }

});
