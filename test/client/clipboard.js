// Load modules

var Clipboard = require('../../source/js/clipboard');

// Declare internals

var internals = {};



describe('Clipboard', function() {
  
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

    describe('#convertToText', function() {
      
        it('converts the request to text', function(done) {
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

            expect(Clipboard.convertToText(this.request)).to.equal(expectedData);
            
            done();
        });
    
    });
    
});
