// Load modules

var sinon = require('sinon');
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
var after = lab.after;
var context = lab.describe;
var it = lab.it;
var expect = Lab.expect;




describe('ClientId', function() {

    describe('#create', function() {

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
    
    describe('#install', function() {
      
        context('with a first-time user', function() {

            beforeEach(function(done) {
                global.localStorage = this.localStorage = {
                  getItem: sinon.spy(function() {
                    return false;
                  }),
                  setItem: sinon.spy(function() {
                    return true;
                  })
                };

                this.clientIdCreateSpy = sinon.spy(ClientId, 'create');

                done();
            });

            afterEach(function(done) {
                delete this.localStorage;
                delete this.clientIdCreateSpy;
                ClientId.create.restore();

                done();
            });

            it('checks to see if local storage has a client id', function(done) {
                ClientId.install();

                expect(this.localStorage.getItem.args[0][0]).to.equal('clientId');

                done();
            });

            it('creates a new clientId', function(done) {
                ClientId.install();
                
                expect(this.clientIdCreateSpy.callCount).to.equal(1);

                done();
            });

            it('stores the client id in local storage', function(done) {
                ClientId.install();
                
                expect(this.localStorage.setItem.args[0][1]).to.equal(this.clientIdCreateSpy.returnValues[0]);

                done();
            });

        });
      
        context('with a returning user', function() {

            beforeEach(function(done) {
                var existingClientId = ClientId.create();

                global.localStorage = this.localStorage = {
                  getItem: sinon.spy(function() {
                    return existingClientId;
                  }),
                  setItem: sinon.spy(function() {
                    return true;
                  })
                };

                this.clientIdCreateSpy = sinon.spy(ClientId, 'create');

                done();
            });

            afterEach(function(done) {
                delete this.localStorage;
                delete this.clientIdCreateSpy;
                ClientId.create.restore();

                done();
            });

            it('checks to see if local storage has a client id', function(done) {
                ClientId.install();

                expect(this.localStorage.getItem.args[0][0]).to.equal('clientId');

                done();
            });

            it('does not create a new client id', function(done) {
                ClientId.install();
                
                expect(this.clientIdCreateSpy.callCount).to.equal(0);

                done();
            });

        });
    
    });

    after(function(done) {
      delete global.localStorage;

      done();
    })

});