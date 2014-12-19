// Load modules

var FeedHeader = require('../../../source/js/views/feedHeader');


// Declare internals

var internals = {};


describe('FeedHeader', function () {

    describe('when the collapse all action is clicked', function () {

        it('all expanded requests get collapsed');

    });

    context('with the favorites filter turned off', function () {

        describe('when the favorites filter action is clicked', function () {

            it('displays the favorites filter as turned on');

            it('triggers "toggleFavorites" with the toggle set to true');

        });

    });

    context('with the favorites filter turned on', function () {

        describe('when the favorites filter action is clicked', function () {

            it('displays the favorites filter as turned off');

            it('triggers "toggleFavorites" with the toggle set to false');

        });

    });

    describe('#clear', function () {

        it('disables the favorites filter action');

        it('disables the collapse all action');

    });

    describe('#enableCollapseAll', function () {

        it('enables the collapse all action');

    });

    describe('#disableCollapseAll', function () {

        it('disables the collapse all action');

    });

    describe('#enableFavoritesFilter', function () {

        it('enables the favorited filter action');

    });

    describe('#disableFavoritesFilter', function () {

        it('disables the favorited filter action');

    });

});
