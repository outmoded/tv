// Load modules

var _ = require('lodash');
var Sinon = require('sinon');

var ClientIdGenerator = require('../../source/js/clientIdGenerator');

// Declare internals

var internals = {};


// Test Shortcuts

var Spy = Sinon.spy;



internals.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
internals.numbers = '0123456789';




describe('ClientIdGenerator', function() {

    describe('#generate', function() {

        it('returns a code', function(done) {
            var obj = ClientIdGenerator.generate();
            expect(ClientIdGenerator.generate()).to.have.length(ClientIdGenerator.defaults.length);

            done();
        });

        it('always returns a \'unique\' code', function(done) {
            var clientIds = _.times(30, function() {
                return ClientIdGenerator.generate();
            });

            expect(_.unique(clientIds)).to.have.length(clientIds.length);

            done();
        });

        context('with length specified', function() {

            it('returns a code of the specified length', function(done) {
                expect(ClientIdGenerator.generate({length: 10})).to.have.length(10);

                done();
            });

        });

        context('with only letters specified', function() {

            it('returns a code with only letters', function(done) {
                var clientId = ClientIdGenerator.generate({numbers: false});
                
                var intersection = _.intersection(clientId.split(''), internals.numbers.split(''))
                expect(intersection).to.have.length(0);

                done();
            });

        });

        context('with only numbers specified', function() {

            it('returns a code with only numbers', function(done) {
                var clientId = ClientIdGenerator.generate({letters: false});
                
                var intersection = _.intersection(clientId.split(''), internals.letters.split(''))
                expect(intersection).to.have.length(0);

                done();
            });

        });

    });

    afterEach(function(done) {
        delete this.storeMock;

        done();
    });

});
