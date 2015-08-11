// Load modules
var _ = require('lodash');
var Chance = require('chance');

// Declare internals

var internals = {
    localStorageKey: 'clientId'
};

exports = module.exports = internals.ClientIdGenerator = {};

internals.ClientIdGenerator.generate = function () {

    var chance = new Chance();

    var word = chance.word({ length: 3 });
    var numbers = chance.string({ length: 3, pool: '1234567890' });

    return word + numbers;
};
