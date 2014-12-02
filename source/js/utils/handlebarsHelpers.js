var Handlebars = require("hbsfy/runtime");
var DateTimeFormatter = require('../utils/dateTimeFormatter');
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
