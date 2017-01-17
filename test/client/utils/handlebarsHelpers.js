'use strict';
// Load modules

const _ = require('lodash');
const Handlebars = require('hbsfy/runtime');
const Sinon = require('sinon');

const DateTimeFormatter = require('../../../source/js/utils/dateTimeFormatter');
const Helpers = require('../../../source/js/utils/handlebarsHelpers');


// Declare internals

const internals = {};


describe('HandlebarsHelpers', function () {

    it('includes DateTimeFormatter functions as Helpers', function () {

        for (const property in DateTimeFormatter) {
            expect(Helpers[property]).to.eq(DateTimeFormatter[property]);
        }
    });

    it('registers helper functions with handlerbars', function (){

        for (const property in Helpers) {
            expect(Handlebars.helpers[property]).to.eq(Helpers[property]);
        }
    });

    describe('jsonMarkup', function () {

        it('transforms json to an html representation', function () {

            const result = Helpers.jsonMarkup({ foo: 'bar' });

            expect(result).to.contain('foo:</span>');
            expect(result).to.contain('"bar"</span>');
        });

    });

    describe('jQuerySnippet', function () {

        it('generates a jquery snippet', function () {

            const result = Helpers.jQuerySnippet('foo');

            expect(result).to.contain('.ajaxSetup');
            expect(result).to.contain('foo');
        });

    });

    describe('isEq', function () {

        context('with matching arguments', function () {

            it('calls the main function', function () {

                const opts = {
                    fn: Sinon.spy(),
                    inverse: Sinon.spy()
                };

                Helpers.isEq(1, 1, opts);

                expect(opts.fn).to.have.been.calledOnce;
                expect(opts.inverse).to.not.have.been.called;
            });

        });

        context('without matching arguments', function () {

            it('calls the inverse function', function () {

                const opts = {
                    fn: Sinon.spy(),
                    inverse: Sinon.spy()
                };

                Helpers.isEq(1, 0, opts);

                expect(opts.fn).to.not.have.been.calledOnce;
                expect(opts.inverse).to.have.been.called;
            });

        });

    });

    describe('tagColor', function () {

        context('with a supported color tag', function () {

            it('returns the tag name to be used as the css class', function () {

                _.each(['error', 'debug'], (supportedTag) => {

                    expect(Helpers.tagColor(supportedTag)).to.eq(supportedTag);
                });
            });

        });

        context('without a supported color tag', function () {

            it('doesn\'t return anything', function () {

                expect(Helpers.tagColor('non-supported-tag')).to.eq(undefined);
            });

        });

    });

});
