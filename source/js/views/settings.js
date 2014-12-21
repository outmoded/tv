// Load modules

var _ = require('lodash');
var Backbone = require('backbone');

var SettingsStore = require('../settingsStore');
var JQuerySnippetGenerator = require('../utils/jQuerySnippetGenerator');


// Declare internals

var internals = {};


exports = module.exports = internals.SettingsView = Backbone.View.extend({

    template: require('../templates/settings.hbs'),

    events: {
        'click .submit': '_submit',
        'click .cancel': '_cancel',
        'keyup [name=client-id]': '_onClientIdInput'
    },

    initialize: function (options) {

        this.settingsModel = options.settingsModel;
        this.model = new Backbone.Model(_.clone(this.settingsModel.attributes));

        this.listenTo(this.model, 'change:clientId', function (model, clientId) {

            this.$('.jquery-snippet').html(JQuerySnippetGenerator.generate(clientId));
        });

        this.listenTo(this.settingsModel, 'change', function (model) {

            this.model.set({
                clientId: model.get('clientId'),
                channel: model.get('channel')
            });
        });
    },

    render: function () {

        this.$el.html(this.template(this.model.toJSON()));

        this._$modal = this.$('.modal');

        return this;
    },

    show: function () {

        this._$modal.modal('show');
    },

    hide: function () {

        this._$modal.modal('hide');
    },

    _onClientIdInput: function (e) {

        this.model.set('clientId', $(e.currentTarget).val());
    },

    _cancel: function (e) {

        this.model.set('clientId', this.settingsModel.get('clientId'));

        this.hide();

        this.render();
    },

    _submit: function (e) {

        var newClientId = this.model.get('clientId');
        var oldClientId = this.settingsModel.get('clientId');

        this.settingsModel.set('clientId', newClientId);
        if (newClientId !== oldClientId) { // we changed the client id, so subscribe to the one we entered.
            this.settingsModel.set('channel', newClientId);
        }

        this.hide();
    }

});
