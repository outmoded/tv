// Load modules

var sinon = require('sinon');
var _ = require('lodash');
var Lab = require('lab');

var rewire = require('rewire');
var ClientId = rewire('../../source/js/clientId');

var settingsStoreGetSpy = sinon.spy();
var settingsStoreSetSpy = sinon.spy();

// Declare internals

var internals = {};
internals.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
internals.numbers = '0123456789';


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var after = lab.after;
var context = lab.describe;
var it = lab.it;
var expect = Lab.expect;




describe('ClientId', function() {

    beforeEach(function(done) {
        this.storeMock = {
            get: sinon.spy(function() {
                return undefined;
            }),
            set: sinon.spy(function() {
                return arguments[1];
            })
        }
        ClientId._store = this.storeMock;

        done();
    });

    describe('#generate', function() {

        it('returns a code', function(done) {
            var obj = ClientId._generateClientId();
            expect(ClientId._generateClientId()).to.have.length(ClientId.defaults.length);

            done();
        });

        it('"always" returns a unique code', function(done) {
            var clientIds = _.times(30, function() {
                return ClientId._generateClientId();
            });

            expect(_.unique(clientIds)).to.have.length(clientIds.length);

            done();
        });

        context('with length specified', function() {

            it('returns a code of the specified length', function(done) {
                expect(ClientId._generateClientId({length: 10})).to.have.length(10);

                done();
            });

        });

        context('with only letters specified', function() {

            it('returns a code with only letters', function(done) {
                var clientId = ClientId._generateClientId({numbers: false});
                
                var intersection = _.intersection(clientId.split(''), internals.numbers.split(''))
                expect(intersection).to.have.length(0);

                done();
            });

        });

        context('with only numbers specified', function() {

            it('returns a code with only numbers', function(done) {
                var clientId = ClientId._generateClientId({letters: false});
                
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