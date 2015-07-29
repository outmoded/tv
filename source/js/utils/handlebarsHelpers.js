// Load modules

var _ = require('lodash');
var Handlebars = require('hbsfy/runtime');

var DateTimeFormatter = require('../utils/dateTimeFormatter');
var JQuerySnippetGenerator = require('../utils/jQuerySnippetGenerator');
var JsonMarkup = require('json-markup');


// Declare internals

var internals = {
    SUPPORTED_COLORED_TAGS: ['error', 'debug']
};


exports = module.exports = internals.HandlebarsHelpers = {

    jsonMarkup: function (jsonData) {

        return JsonMarkup(jsonData);
    },

    jQuerySnippet: function (clientId) {

        return JQuerySnippetGenerator.generate(clientId);
    },

    isEq: function (a, b, options) {

        var result;

        if (a === b) {
            result = options.fn();
        }
        else {
            result = options.inverse();
        }

        return result;
    },

    tagColor: function (tag) {

        if (_.contains(internals.SUPPORTED_COLORED_TAGS, tag)) {
            return tag;
        }
    }

};


_.extend(internals.HandlebarsHelpers, DateTimeFormatter);


for (var property in internals.HandlebarsHelpers) {
    Handlebars.registerHelper(property, internals.HandlebarsHelpers[property]);
}
