var _ = require('lodash');
var Backbone = require('backbone');
var SettingsStore = require('../settingsStore');
var _ = require('lodash');

var Settings = Backbone.Model.extend({

    _store: SettingsStore,

    defaults: function() {
        return {
            clientId: this._store.get('clientId'),
            channel:  this._store.get('channel')
        }
    },

    initialize: function(options) {
        this.on('change', this._updateSettingsStore, this);
        this.on('change:channel', function(model, channel) {
            options.webSocketManager.applyFilter(channel);
        });
    },

    _updateSettingsStore: function(model) {
        _.each(model.changed, _.bind(function(value, key) {
            this._store.set(key, value);
        }, this));
    }

});

module.exports = Settings;
