'use strict';
// Load modules

const Moment = require('moment');


// Declare internals

const internals = {};


exports = module.exports = internals.DateTimeFormatter = {

    longTime: function (timestamp) {

        return Moment(timestamp).format('HH:mm:ss SS[ms]');
    },

    shortDate: function (timestamp) {

        return Moment(timestamp).format('MM-DD-YYYY');
    }

};
