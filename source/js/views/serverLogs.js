'use strict';
// Load modules

const Backbone = require('backbone');
const ZeroClipboard = require('zeroclipboard');
// const _ = require('lodash');

const RequestToTextConverter = require('../utils/requestToTextConverter');


// Declare internals

const internals = {};


exports = module.exports = internals.ServerLogsView = Backbone.View.extend({

    template: require('../templates/serverLogs.hbs'),

    events: {
        'click .json-markup': '_toggleServerLogData'
    },

    initialize: function () {

        const self = this;
        this.listenTo(this.collection, 'add', (model) => {

            self.this.render();
        });
    },

    render: function () {

        this.$el.html(this.template(this.collection.toJSON()));

        this._initializeClipboard();

        return this;
    },

    _initializeClipboard: function () {

        const clipboard = this._createZeroClipboard();

        const self = this;
        clipboard.on('ready', (readyEvent) => {

            clipboard.on('beforecopy', (event) => {

                clipboard.setData('text/plain', RequestToTextConverter.convertToText(self.model.toJSON()));

                self._$clipboard.tooltip({
                    delay: { hide: 2000 },
                    placement: 'left',
                    animation: 'fade',
                    title: 'Copied to clipboard!'
                });

                self._$clipboard.tooltip('show');
            });

            clipboard.on('aftercopy', (event) => {

                setTimeout(() => {

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

        const $data = $(e.currentTarget);

        $data.closest('.data').toggleClass('expanded');
    }

});
