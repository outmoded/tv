// Load modules

var _ = require('lodash');

var ClientIdGenerator = require('../../source/js/clientIdGenerator');


// Declare internals

var internals = {};


internals.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
internals.numbers = '0123456789';


describe('ClientIdGenerator', function () {

    afterEach(function () {

        delete this.storeMock;
    });

    describe('#generate', function () {

        it('returns a code', function () {

            var obj = ClientIdGenerator.generate();
            expect(ClientIdGenerator.generate()).to.have.length(ClientIdGenerator.defaults.length);
        });

        it('always returns a \'unique\' code', function () {

            var clientIds = _.times(30, function () {

                return ClientIdGenerator.generate();
            });

            expect(_.unique(clientIds)).to.have.length(clientIds.length);
        });

        context('with length specified', function () {

            it('returns a code of the specified length', function () {

                expect(ClientIdGenerator.generate({length: 10})).to.have.length(10);
            });

        });

        context('with only letters specified', function () {

            it('returns a code with only letters', function () {

                var clientId = ClientIdGenerator.generate({numbers: false});

                var intersection = _.intersection(clientId.split(''), internals.numbers.split(''));
                expect(intersection).to.have.length(0);
            });

        });

        context('with only numbers specified', function () {

            it('returns a code with only numbers', function () {

                var clientId = ClientIdGenerator.generate({letters: false});

                var intersection = _.intersection(clientId.split(''), internals.letters.split(''));
                expect(intersection).to.have.length(0);
            });

        });

    });

});
