// Load modules

var _ = require('lodash');
var Lab = require('lab');
var ClientId = require('../../source/js/clientId');

// Declare internals

var internals = {};
internals.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
internals.numbers = '0123456789';


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var context = lab.describe;
var it = lab.it;
var expect = Lab.expect;




describe('ClientId', function() {

    it('returns a code', function(done) {
        var obj = ClientId.create();
        expect(ClientId.create()).to.have.length(ClientId.defaults.length);

        done();
    });

    it('"always" returns a unique code', function(done) {
      var clientIds = _.times(30, function() {
        return ClientId.create();
      });

      expect(_.unique(clientIds)).to.have.length(clientIds.length);

      done();
    });

    context('with length specified', function() {

        it('returns a code of the specified length', function(done) {
          expect(ClientId.create({length: 10})).to.have.length(10);

          done();
        });

    });

    context('with only letters specified', function() {

        it('returns a code with only letters', function(done) {
          var clientId = ClientId.create({numbers: false});
          
          var intersection = _.intersection(clientId.split(''), internals.numbers.split(''))
          expect(intersection).to.have.length(0);

          done();
        });

    });

    context('with only numbers specified', function() {

        it('returns a code with only numbers', function(done) {
          var clientId = ClientId.create({letters: false});
          
          var intersection = _.intersection(clientId.split(''), internals.letters.split(''))
          expect(intersection).to.have.length(0);

          done();
        });

    });

});