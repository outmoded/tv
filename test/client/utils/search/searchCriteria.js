// Load modules

var _ = require('lodash');

var SearchCriteria = require('../../../../source/js/utils/search/searchCriteria');
var SearchCriterion = require('../../../../source/js/utils/search/searchCriterion');


// Declare internals

var internals = {};


describe('SearchCriteria', function () {

    describe('.create', function () {

        it('returns a new instance of SearchCriteria', function () {

            expect(SearchCriteria.create('')).to.be.instanceOf(SearchCriteria);
        });

        it('creates an array of SearchCriterion objects', function () {

            var criteria = SearchCriteria.create('foo:bar bar:baz').criteria;
            expect(criteria.length).to.equal(2);
            expect(criteria[0]).to.be.instanceOf(SearchCriterion);
        });

    });

    describe('#matches', function () {

        context('with all criterion that match the request', function () {

            it('returns true', function () {

                var searchCriteria = SearchCriteria.create('foo bar');

                searchCriteria.criteria = [
                    { matches: function () {

                        return true;
                    } },
                    { matches: function () {

                        return true;
                    } }
                ];

                var request = {};

                expect(searchCriteria.matches(request)).to.equal(true);
            });

        });

        context('with a ignored search criterion', function (){

            it('skips that criterion during evaluation', function () {

                var searchCriteria = SearchCriteria.create('foo bar');

                searchCriteria.criteria = [
                    { matches: function () {

                        return true;
                    } },
                    { ignored: true }
                ];

                var request = {};

                expect(searchCriteria.matches(request)).to.equal(true);
            });
        });

        context('with at least one criterion that doesn\'t match the request', function () {

            it('returns false', function () {

                var searchCriteria = SearchCriteria.create('foo bar');

                searchCriteria.criteria = [
                    { matches: function () {

                        return true;
                    } },
                    { matches: function () {

                        return false;
                    } }
                ];

                var request = {};

                expect(searchCriteria.matches(request)).to.equal(false);
            });

        });

    });

});
