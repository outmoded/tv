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



exports = module.exports = internals.ClientId = function(options) {
    options = _.defaults(options || {}, internals.defaults);
    
    return _generateClientId(options);
};

internals.ClientId.create = function(options) {
    return internals.ClientId(options);
};

internals.ClientId.install = function() {
    if ( !localStorage.getItem(internals.localStorageKey)) {
        localStorage.setItem(internals.localStorageKey, internals.ClientId.create());
    }
};

internals.ClientId.defaults = internals.defaults;



function _generateClientId(options) {
    var possible = (options.letters ? internals.letters : '') + (options.numbers ? internals.numbers : '');

    return _.times(options.length, function() {
        return possible.charAt(Math.floor(Math.random() * possible.length));
    }).join('');
};