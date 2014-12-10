var _ = require('lodash');
var Handlebars = require('hbsfy/runtime');
var DateTimeFormatter = require('../utils/dateTimeFormatter');
var JQuerySnippet = require('../jQuerySnippet');
var jsonMarkup = require('json-markup');

var internals = {
    SUPPORTED_COLORED_TAGS: ['error', 'debug']
};

var HandlebarsHelpers = {
    jsonMarkup: function(jsonData) {
        return jsonMarkup(jsonData);
    },

    jQuerySnippet: function(clientId) {
        return JQuerySnippet.generate(clientId);
    },

    isEq: function(a, b, options) {
        var result;

        if (a === b) {
            result = options.fn();
        } else {
            result = options.inverse();
        }

        return result;
    },

    tagColor: function(tag) {
        if (_.contains(internals.SUPPORTED_COLORED_TAGS, tag)) {
            return tag;
        }
    }
};

_.extend(HandlebarsHelpers, DateTimeFormatter);

for (var property in HandlebarsHelpers) {
    Handlebars.registerHelper(property, HandlebarsHelpers[property]);
}

module.exports = HandlebarsHelpers;
