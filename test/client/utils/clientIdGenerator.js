'use strict';
// Load modules

const _ = require('lodash');

const ClientIdGenerator = require('../../../source/js/utils/clientIdGenerator');


// Declare internals

const internals = {};


internals.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
internals.numbers = '0123456789';


describe('ClientIdGenerator', function () {

    afterEach(function () {

        delete this.storeMock;
    });

    describe('#generate', function () {

        it('returns a code', function () {

            const obj = ClientIdGenerator.generate();
            expect(ClientIdGenerator.generate()).to.match(/[a-zA-Z]{3}\d{3}/);
        });

        it('always returns a \'unique\' code', function () {

            const clientIds = _.times(30, () => setTimeout(() => ClientIdGenerator.generate(), 1)); // chance uses time as a seed

            expect(_.uniq(clientIds)).to.have.length(clientIds.length);
        });

    });

});
