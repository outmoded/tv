// Load modules

var Backbone = require('backbone');
var SettingsView = require('../../../source/js/views/settings');

// Declare internals

var internals = {};


internals.generateView = function(options) {
    options = options || {};
    options.settingsModel = options.settingsModel || new Backbone.Model();

    return new SettingsView(options);
};


describe('SettingsView', function() {

    describe('#template', function() {

        it('returns html', function() {
            var view = internals.generateView();

            expect(view.template()).to.match(/<[a-z][\s\S]*>/); // html string
        });

    });

    describe('.events', function() {

        context('with a click on .submit', function() {



        });

    });

});
