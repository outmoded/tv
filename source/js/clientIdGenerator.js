var _ = require('lodash');
var SettingsStore = require('./settingsStore');



var internals = {};

internals.defaults = {
    length: 6,
    letters: true,
    numbers: true
}

internals.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
internals.numbers = '0123456789';

internals.localStorageKey = 'clientId';




exports = module.exports = internals.ClientId = {};

internals.ClientId._store = SettingsStore;

internals.ClientId.generate = function(options) {
    options = _.defaults(options || {}, internals.defaults);

    var possible = (options.letters ? internals.letters : '') + (options.numbers ? internals.numbers : '');

    return _.times(options.length, function() {
        return possible.charAt(Math.floor(Math.random() * possible.length));
    }).join('');
};

internals.ClientId.defaults = internals.defaults;