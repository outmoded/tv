'use strict';
// Load modules

const _ = require('lodash');
const Backbone = require('backbone');

const SettingsStore = require('../settingsStore');


// Declare internals

const internals = {};


exports = module.exports = internals.Settings = Backbone.Model.extend({

    _store: SettingsStore,

    defaults: function () {

        return {
            clientId: this._store.get('clientId'),
            channel: this._store.get('channel')
        };
    },

    initialize: function (attributes, options) {

        this.on('change', this._updateSettingsStore, this);
        this.on('change:channel', (model, channel) => {

            options.webSocketManager.applyFilter(channel);
        });
    },

    _updateSettingsStore: function (model) {

        const updateSettingsStoreProp = (value, key) => {

            this._store.set(key, value);
        };

        _.each(model.changed, updateSettingsStoreProp);
    }

});
