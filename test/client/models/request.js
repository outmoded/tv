'use strict';
// Load modules

const Backbone = require('backbone');

const Request = require('../../../source/js/models/request');


// Declare internals

const internals = {};


describe('Request', function () {

    describe('#hasError', function () {

        it('returns true if request timed out', function () {

            const request = new Request({ responseTimeout: true });

            expect(request.hasError()).to.be.true;
        });

        it('returns true if status code is 500', function () {

            const request = new Request({ statusCode: 500 });

            expect(request.hasError()).to.be.true;
        });

        it('returns false otherwise', function () {

            const request = new Request();

            expect(request.hasError()).to.be.false;
        });

    });

    describe('#hasWarning', function () {

        it('returns true if statusCode inbetween 400 and 500', function () {

            const request = new Request({ statusCode: 422 });

            expect(request.hasWarning()).to.be.true;
        });

        it('returns false otherwise', function () {

            const request = new Request({ statusCode: 200 });

            expect(request.hasWarning()).to.be.false;
        });

    });

    describe('#toJSON', function () {

        it('parses all subcomponents', function () {

            const request = new Request({ statusCode: 200 });
            request.set('serverLogs', new Backbone.Collection([{ foo: 'bar', bar: 'baz' }]));

            expect(request.toJSON().serverLogs).to.be.an.instanceOf(Array);
        });

    });

});
