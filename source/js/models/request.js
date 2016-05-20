'use strict';
// Load modules

const Backbone = require('backbone');

// Declare internals

const internals = {};


exports = module.exports = internals.Request = Backbone.Model.extend({

    defaults: {
        visible: true
    },

    hasError: function () {

        return this.get('responseTimeout') || this.get('statusCode') >= 500;
    },

    hasWarning: function () {

        return this.get('statusCode') >= 400 && this.get('statusCode') < 500;
    },

    toJSON: function () {

        const data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.serverLogs = this.get('serverLogs').toJSON();

        return data;
    }

});
