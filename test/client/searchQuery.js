// Load modules

var sinon = require('sinon');
var _ = require('lodash');
var Lab = require('lab');

var SearchQuery = require('../../source/js/utils/searchQuery');

// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var after = lab.after;
var context = lab.describe;
var it = lab.it;
var expect = Lab.expect;


describe('SearchQuery', function() {
  
    describe('#toObject', function() {
      
        context('with an empty string', function() {

            it('returns an empty object', function(done) {
                expect(SearchQuery.toObject('')).to.be.undefined;

                done();
            });

        });
      
        context('with undefined', function() {

            it('returns an empty object', function(done) {
                expect(SearchQuery.toObject('')).to.be.undefined;

                done();
            });

        });
      
        context('with a string that doesnt have a colon (malformed)', function() {

            it('returns an empty object', function(done) {
                expect(SearchQuery.toObject('foo')).to.be.undefined;

                done();
            });

        });
      
        context('with a properly formed query', function() {

            it('returns an object', function(done) {
                expect(SearchQuery.toObject('foo:bar')).to.eql({
                    foo: 'bar'
                });

                done();
            });

            it('handles multiple parameters', function(done) {
                expect(SearchQuery.toObject('foo:bar bar:baz')).to.eql({
                    foo: 'bar',
                    bar: 'baz'
                });

                done();
            });

            it('returns an array for parameters with multiple values', function(done) {
                expect(SearchQuery.toObject('foo:bar,baz').foo).to.eql(['bar', 'baz']);

                done();
            });

        });
    
    });

});
























