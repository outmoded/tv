// Load modules

var SettingsStore = require('../../source/js/settingsStore');


// Declare internals

var internals = {};


describe('SettingsStore', function () {

    describe('#exists', function () {

        it('returns true if the value is in localStorage', function () {

            localStorage.setItem('foo', 'bar');

            expect(SettingsStore.exists('foo')).to.be.true;
        });

        it('returns false if the value is in localStorage', function () {

            localStorage.clear();

            expect(SettingsStore.exists('foo')).to.be.false;
        });

    });

    describe('#get', function () {

        it('returns the value if found', function () {

            localStorage.setItem('foo', 'bar');

            expect(SettingsStore.get('foo')).to.equal('bar');
        });

    });

    describe('#set', function () {

        it('sets the value in localStorage', function () {

            SettingsStore.set('foo', 'baz');

            expect(localStorage.getItem('foo')).to.equal('baz');
        });

    });

});
