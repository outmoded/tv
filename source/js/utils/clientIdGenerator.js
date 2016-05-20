'use strict';
// Load modules
const Chance = require('chance');

// Declare internals

const internals = {
    localStorageKey: 'clientId'
};

exports = module.exports = internals.ClientIdGenerator = {};

internals.ClientIdGenerator.generate = function () {

    const chance = new Chance();

    const word = chance.word({ length: 3 });
    const numbers = chance.string({ length: 3, pool: '1234567890' });

    return word + numbers;
};
