// Load modules

var _ = require('lodash');

var ClientIdGenerator = require('../../source/js/clientIdGenerator');


// Declare internals

var internals = {};


internals.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
internals.numbers = '0123456789';


describe('ClientIdGenerator', function() {

    describe('#generate', function() {

        it('returns a code', function() {
            var obj = ClientIdGenerator.generate();
            expect(ClientIdGenerator.generate()).to.match(/[a-zA-Z]{3}\d{3}/);
        });

        it('always returns a \'unique\' code', function() {
            var clientIds = _.times(30, setTimeout(function() {
                return ClientIdGenerator.generate();
            }, 1)); // chance uses time as a seed

            console.log(clientIds);
            expect(_.unique(clientIds)).to.have.length(clientIds.length);
        });

    });

});
