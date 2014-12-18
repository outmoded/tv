// Load modules

var RequestToTextConverter = require('../../../source/js/utils/requestToTextConverter');


// Declare internals

var internals = {};


describe('RequestToTextConverter', function () {

    beforeEach(function () {

        this.now = new Date().valueOf();
        this.request = {
            path: '/foo/bar',
            method: 'get',
            statusCode: '200',
            serverLogs: [
                {
                    data: {
                        foo: 'bar',
                        bar: 'baz'
                    },
                    timestamp: this.now,
                    tags: ['foo', 'bar']
                },
                {
                    data: {
                        foo: 'bar',
                        bar: 'baz'
                    },
                    timestamp: this.now,
                    tags: ['foo', 'bar']
                }
            ]
        };
    });

    afterEach(function () {

        delete this.now;
        delete this.request;
    });

    describe('#convertToText', function () {

        it('converts the request to text', function () {

            var expectedData = [
                'Path: GET /foo/bar',
                'Status: 200',
                'Server Logs:\n',
                '  Tags: ["foo","bar"]',
                '  Timestamp: ' + this.now,
                '  Data: {"foo":"bar","bar":"baz"}',
                '  -------------',
                '  Tags: ["foo","bar"]',
                '  Timestamp: ' + this.now,
                '  Data: {"foo":"bar","bar":"baz"}'
            ].join('\n');

            expect(RequestToTextConverter.convertToText(this.request)).to.equal(expectedData);
        });

    });

});
