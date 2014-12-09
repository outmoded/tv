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

    beforeEach(function(done) {
        this.storeMock = {
            get: Spy(function() {
                return undefined;
            }),
            set: Spy(function() {
                return arguments[1];
            })
        }
        ClientIdGenerator._store = this.storeMock;

        done();
    });

    describe('#generate', function() {

        it('returns a code', function(done) {
            var obj = ClientIdGenerator._generateClientId();
            expect(ClientIdGenerator._generateClientId()).to.have.length(ClientIdGenerator.defaults.length);

            done();
        });

        it('"always" returns a unique code', function(done) {
            var clientIds = _.times(30, function() {
                return ClientIdGenerator._generateClientId();
            });

            expect(_.unique(clientIds)).to.have.length(clientIds.length);

            done();
        });

        context('with length specified', function() {

            it('returns a code of the specified length', function(done) {
                expect(ClientIdGenerator._generateClientId({length: 10})).to.have.length(10);

                done();
            });

        });

        context('with only letters specified', function() {

            it('returns a code with only letters', function(done) {
                var clientId = ClientIdGenerator._generateClientId({numbers: false});
                
                var intersection = _.intersection(clientId.split(''), internals.numbers.split(''))
                expect(intersection).to.have.length(0);

                done();
            });

        });

        context('with only numbers specified', function() {

            it('returns a code with only numbers', function(done) {
                var clientId = ClientIdGenerator._generateClientId({letters: false});
                
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
