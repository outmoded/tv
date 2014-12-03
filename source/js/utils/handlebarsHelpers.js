var Handlebars = require("hbsfy/runtime");
var DateTimeFormatter = require('../utils/dateTimeFormatter');
var JQuerySnippet = require('../jQuerySnippet');
var jsonMarkup = require('json-markup');

Handlebars.registerHelper("longTime", function(dateTime) {
    return DateTimeFormatter.longTime(dateTime);
});

Handlebars.registerHelper("shortDate", function(dateTime) {
    return DateTimeFormatter.shortDate(dateTime);
});

Handlebars.registerHelper("jsonMarkup", function(jsonData) {
    return jsonMarkup(jsonData);
});

Handlebars.registerHelper("jQuerySnippet", function(clientId) {
    return JQuerySnippet.generate(clientId);
});

Handlebars.registerHelper("isEq", function(a, b, options) {
    if (a === b) {
        return options.fn();
    } else {
        return options.inverse();
    }
});
