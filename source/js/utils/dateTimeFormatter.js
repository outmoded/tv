var moment = require('moment');

var DateTimeFormatter = function() {}

DateTimeFormatter.longTime = function(timestamp) {
    return moment(timestamp).format('HH:mm:ss SS[ms]');
}

DateTimeFormatter.shortDate = function(timestamp) {
    return moment(timestamp).format('MM-DD-YYYY');
}

module.exports = DateTimeFormatter;
