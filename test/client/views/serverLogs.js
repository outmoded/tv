// Load modules

var Sinon = require('sinon');
var Backbone = require('backbone');

var ServerLogsView = require('../../../source/js/views/serverLogs');
var Request = require('../../../source/js/models/request');


// Declare internals

var internals = {};


internals.RECEIVED = {
    data: {
        method: 'get',
        url: '/'
    },
    tags: ['received'],
    internal: true
};

internals.HANDLER = {
    data: {
        msec: 0.1
    },
    tags: ['handler'],
    internal: true
};

internals.RESPONSE = {
    data: {
        statusCode: 201,
        error: 'error message'
    },
    response: true
};

internals.ERROR = {
    data: {
        statusCode: 500,
        error: 'error message'
    },
    tags: ['error'],
    response: true,
    internal: true
};

internals.EMPTY_RESPONSE = {
    data: null,
    tags: ['response']
};

internals.generateView = function (options) {

    options = options || {};
    options.collection = options.collection || new Request({
        serverLogs: new Backbone.Collection([
            internals.RECEIVED,
            internals.HANDLER,
            internals.RESPONSE
        ])
    }).get('serverLogs');

    return new ServerLogsView(options);
};


describe('ServerLogsView', function () {

    beforeEach(function () {

        this.view = internals.generateView();
    });

    describe('.template', function () {

        it('returns html', function () {

            expect(this.view.template()).to.match(/^/);
        });

    });

    describe('#initialize', function () {

        it('rerenders when a new model is added to the collection', function () {

            var spy = Sinon.spy(this.view, 'render');

            this.view.collection.add(internals.RESPONSE);

            expect(spy).to.have.been.calledOnce;
        });

    });

    describe('.events', function () {

        context('with a click on .data', function () {

            beforeEach(function () {

                this.view.render();

                this.$firstServerLogRow = this.view.$('.server-log').first();

                this.$firstServerLogRow.find('.json-markup').click();
            });

            it('toggles the expanded class on the server log row', function () {

                expect(this.$firstServerLogRow.find('.data').hasClass('expanded')).to.be.true;
            });

        });

    });

    describe('#render', function () {

        it('returns the expected number of server log rows', function () {

            this.view.render();

            expect(this.view.$('.server-log')).to.have.length(3);
        });

        it('returns the expected tags', function () {

            this.view.render();

            this.view.collection.each(function (serverLog, index) {

                var $row = this.view.$('.server-log').eq(index);

                expect($row.find('.tags span')).to.have.length(serverLog.get('tags') ? serverLog.get('tags').length : 0);
            }.bind(this));
        });

    });

});
