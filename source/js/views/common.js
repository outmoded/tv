var moment = require('moment');

var Common = function() {}

Common.formatTimestamp = function(timestamp) {
    var momentTimestamp = moment(timestamp);

    return {
        date: momentTimestamp.format('MM-DD-YYYY'),
        time: momentTimestamp.format('HH:mm:ss:SSS')
    };
}

module.exports = Common;
