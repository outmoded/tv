// Load modules

var DateTimeFormatter = require('../../../source/js/utils/dateTimeFormatter');


// Declare internals

var internals = {};


describe('DateTimeFormatter', function () {

    describe('#longTime', function () {

        it('returns time in a long format', function () {

            var timeString = DateTimeFormatter.longTime(new Date().getTime());

            expect(timeString).to.match(/\d{2}:\d{2}:\d{2} \d{2}ms/);
        });

    });

    describe('#shortDate', function () {

        it('returns date in a short format', function () {

            var dateString = DateTimeFormatter.shortDate(new Date().getTime());

            expect(dateString).to.match(/\d{2}-\d{2}-\d{4}/);
        });

    });


});
