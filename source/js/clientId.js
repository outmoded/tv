var _ = require('lodash');



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

internals.ClientId.install = function(options) {
    var clientId, existingClientId = this._store.get(internals.localStorageKey);
    
    if (!existingClientId) {
        clientId = this._store.set(internals.localStorageKey, this._generateClientId(options));
    }
    
    return clientId;
};

internals.ClientId._store = {
    get: function(key) {
        return localStorage.getItem(key);
    },
    set: function(key, value) {
        localStorage.setItem(key, value);
        return value;
    }
};

internals.ClientId._generateClientId = function(options) {
    options = _.defaults(options || {}, internals.defaults);

    var possible = (options.letters ? internals.letters : '') + (options.numbers ? internals.numbers : '');

    return _.times(options.length, function() {
        return possible.charAt(Math.floor(Math.random() * possible.length));
    }).join('');
};

internals.ClientId.defaults = internals.defaults;