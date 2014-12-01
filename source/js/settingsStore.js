var SettingsStore = exports = module.exports = {

    exists: function(key) {
        var value = localStorage.getItem(key);
        return value !== void 0 && value !== null;
    },

    get: function(key) {
        return localStorage.getItem(key);
    },

    set: function(key, value) {
        return localStorage.setItem(key, value);
    }

}