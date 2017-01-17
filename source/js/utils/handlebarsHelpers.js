'use strict';
// Load modules

const _ = require('lodash');
const Handlebars = require('hbsfy/runtime');

const DateTimeFormatter = require('../utils/dateTimeFormatter');
const JQuerySnippetGenerator = require('../utils/jQuerySnippetGenerator');
const JsonMarkup = require('json-markup');


// Declare internals

const internals = {
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

        let result;

        if (a === b) {
            result = options.fn();
        }
        else {
            result = options.inverse();
        }

        return result;
    },

    tagColor: function (tag) {

        if (_.includes(internals.SUPPORTED_COLORED_TAGS, tag)) {
            return tag;
        }
    }

};


_.extend(internals.HandlebarsHelpers, DateTimeFormatter);


for (const property in internals.HandlebarsHelpers) {
    Handlebars.registerHelper(property, internals.HandlebarsHelpers[property]);
}
