// Load modules

var FeedBody = require('../../../source/js/views/feedBody');


// Declare internals

var internals = {};


describe('FeedBody', function () {

    describe('when a request is add to the collection', function () {

        it('adds a request to the feed body');

    });

    describe('#render', function () {

        it('clears the body');

    });

    describe('#clear', function () {

        it('clears out the feed body\'s markup');

        it('removes the request views');

    });

    describe('#hasFavoritedRequests', function () {

        context('with a least one request that\'s favorited', function () {

            it('returns true');

        });

        context('without any requests favorited', function () {

            it('returns false');

        });

    });

    describe('#hasExpandedRequests', function () {

        context('with a least one request that\'s expanded', function () {

            it('returns true');

        });

        context('without any requests expanded', function () {

            it('returns false');

        });

    });

    describe('#collapseAll', function () {

        it('puts each request into a collapsed state');

    });

    context('with favorites currently not filtered', function () {

        describe('#toggleFavorites', function () {

            it('hides all non-favorited requests');

        });

    });

    context('with favorites currently filtered', function () {

        describe('#toggleFavorites', function () {

            it('shows all non-favorited requests');

        });

    });

    describe('#filterRequests', function () {

        context('with a present search criteria query string', function () {

            it('it hides any requests that don\'t match the search criteria filter');

        });

        context('with an empty search criteria query string', function () {

            it('it shows any requests that were hidden by the previous search criteria filter');

        });

    });

    describe('when a request is collapsed/expanded', function () {

        it('triggers requestExpandToggle');

    });

    describe('when a request is favorited/unfavorited', function () {

        it('triggers requestFavoriteToggle');

    });

    describe('when a request status changes', function () {

        context('with a search criteria filter set to display that status', function () {

            it('the request is shown');

        });

        context('with a search criteria filter set to hide that status', function () {

            it('the request is hidden');

        });

    });

    context('with the browser window scrolled all the way to the bottom', function () {

        describe('when a new request is added to the feed\'s body', function () {

            it('scrolls the screen back to the bottom');

        });

    });

});
