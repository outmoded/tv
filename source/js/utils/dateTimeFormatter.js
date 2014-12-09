var moment = require('moment');

var DateTimeFormatter = {

    longTime: function(timestamp) {
        return moment(timestamp).format('HH:mm:ss SS[ms]');
    },

    shortDate: function(timestamp) {
        return moment(timestamp).format('MM-DD-YYYY');
    }

};

module.exports = DateTimeFormatter;
