// Load modules

var _ = require('lodash');
var Backbone = require('backbone');

var SettingsStore = require('../settingsStore');


// Declare internals

var internals = {};


exports = module.exports = internals.Settings = Backbone.Model.extend({

    _store: SettingsStore,

    defaults: function () {

        return {
            clientId: this._store.get('clientId'),
            channel:  this._store.get('channel')
        };
    },

    initialize: function (attributes, options) {

        this.on('change', this._updateSettingsStore, this);
        this.on('change:channel', function (model, channel) {
            options.webSocketManager.applyFilter(channel);
        });
    },

    _updateSettingsStore: function (model) {

        var self = this;

        var updateSettingsStoreProp = function (value, key) {
            self._store.set(key, value);
        };

        _.each(model.changed, updateSettingsStoreProp);
    }

});
