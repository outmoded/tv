// Load modules

var _ = require('lodash');
var Lab = require('lab');
var Code = require('code');
var Clipboard = require('../../source/js/clipboard');

// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var context = lab.describe;
var it = lab.it;
var expect = Code.expect;



describe('foo bar', function() {
  
    beforeEach(function(done) {
        this.now = new Date().valueOf();
        this.request = {
            path: '/foo/bar',
            method: 'get',
            statusCode: '200',
            serverLogs: [
                {
                    data: {
                        foo: 'bar',
                        bar: 'baz',
                    },
                    timestamp: this.now,
                    tags: ['foo', 'bar']
                },
                {
                    data: {
                        foo: 'bar',
                        bar: 'baz',
                    },
                    timestamp: this.now,
                    tags: ['foo', 'bar']
                }
            ]
        };

        done();
    });

    afterEach(function(done) {
        delete this.now;
        delete this.request;

        done();
    });

    it('converts the request to text', function(done) {
        var expectedData = 'Path: GET /foo/bar\nStatus: 200\nServer Logs:\n\n  Tags: ["foo","bar"]\n  Timestamp: ' + this.now + '\n  Data: {"foo":"bar","bar":"baz"}\n  -------------\n  Tags: ["foo","bar"]\n  Timestamp: ' + this.now + '\n  Data: {"foo":"bar","bar":"baz"}';
        expect(Clipboard.convertToText(this.request)).to.equal(expectedData);
        done();
    });

});