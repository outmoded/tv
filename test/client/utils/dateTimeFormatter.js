'use strict';
// Load modules

const DateTimeFormatter = require('../../../source/js/utils/dateTimeFormatter');


// Declare internals

const internals = {};


describe('DateTimeFormatter', function () {

    describe('#longTime', function () {

        it('returns time in a long format', function () {

            const timeString = DateTimeFormatter.longTime(new Date().getTime());

            expect(timeString).to.match(/\d{2}:\d{2}:\d{2} \d{2}ms/);
        });

    });

    describe('#shortDate', function () {

        it('returns date in a short format', function () {

            const dateString = DateTimeFormatter.shortDate(new Date().getTime());

            expect(dateString).to.match(/\d{2}-\d{2}-\d{4}/);
        });

    });


});
