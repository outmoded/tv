var Backbone = require('backbone');
var SettingsStore = require('../settingsStore');
var JQuerySnippet = require('../jQuerySnippet');

var SettingsView = Backbone.View.extend({

    template: require('../templates/settings.hbs'),

    events: {
        'click .submit': 'submit',
        'click .cancel': 'cancel',
        'keyup [name=client-id]': 'onClientIdInput'
    },

    initialize: function(options) {
        this.model = new Backbone.Model();
        this.settingsModel = options.settingsModel;

        this.listenTo(this.model, 'change:clientId', function(model, clientId) {
            this.$('.jquery-snippet').html(JQuerySnippet.generate(clientId));
        });
    },

    render: function() {
        var data = {
            clientId: this.settingsModel.get('clientId'),
            channel: this.settingsModel.get('channel')
        };

        this.$el.html(this.template(data));
        
        this.$modal = this.$('.modal');
        
        return this;
    },

    show: function() {
        this.$modal.modal('show');
    },

    hide: function() {
        this.$modal.modal('hide');
    },

    onClientIdInput: function(e) {
        this.model.set('clientId', $(e.currentTarget).val());
    },

    cancel: function(e) {
        this.model.set('clientId', this.settingsModel.get('clientId'));
        this.hide();
        this.render();
    },

    submit: function(e) {
        this.settingsModel.set('clientId', this.model.get('clientId'));
        this.hide();
    }

});

module.exports = SettingsView;