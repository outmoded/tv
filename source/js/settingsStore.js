'use strict';
// Load modules


// Declare internals

const internals = {};


exports = module.exports = internals.SettingsStore = {

    exists: function (key) {

        const value = localStorage.getItem(key);
        return value !== void 0 && value !== null;
    },

    get: function (key) {

        return localStorage.getItem(key);
    },

    set: function (key, value) {

        return localStorage.setItem(key, value);
    }

};
