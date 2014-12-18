// Load modules

var SettingsView = require('../../../source/js/views/settings');


// Declare internals

var internals = {};


describe('SettingsView', function () {

    describe('when the client id changes', function () {

        it('updates the jquery snippet');

    });

    describe('when submit is clicked', function () {

        it('sets the client id on the model');

        context('with a changed client id', function () {

            it('sets the client id as the channel on the model');

        });

        it('hides itself');

    });

    describe('when cancel is clicked', function () {

        it('resets the views client id back to original client id');

        it('hides itself');

        it('re-renders itself to reset it\'s display for the next time it\'s shown');

    });

    describe('when the original settings model is changed', function () {

        it('changes the view\'s model');

    });

    describe('#show', function () {

        it('shows the view');

    });

    describe('#hide', function () {

        it('hides the view');

    });

});
