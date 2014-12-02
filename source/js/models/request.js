var Backbone = require('backbone');
var DateTimeFormatter = require('../utils/dateTimeFormatter');

var Request = Backbone.Model.extend({

    defaults: {
        visible: true
    },

    hasError: function() {
        return this.get('responseTimeout') || this.get('statusCode') >= 500;
    },

    hasWarning: function() {
        return this.get('statusCode') >= 400 && this.get('statusCode') < 500;
    },

});

module.exports = Request;
