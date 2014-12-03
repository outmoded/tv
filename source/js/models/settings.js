var _ = require('lodash');
var Backbone = require('backbone');
var SettingsStore = require('../settingsStore');


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
        this.on('change:clientId', function(model, clientId) {
            // if we're listening to clientId and it changes,
            // refresh the subscription
            if (model.get('channel') !== '*') {
                model.set('channel', clientId);
            }
        });
    },

    _updateSettingsStore: function(model) {
        _.each(model.changed, function(value, key) {
            this._store.set(key, value);
        }.bind(this));
    }

});

module.exports = Settings;