var expect = require('chai').expect;
var Websocket = require('ws');
var libPath = process.env.TEST_COV ? '../lib-cov/' : '../lib/';
var Helmet = require(libPath + 'helmet');

describe('Helmet', function() {

    describe('#constructor', function() {

        it('cannot be constructed without new', function(done) {

            var fn = function() {

                var helmet = Helmet();
            };

            expect(fn).to.throw(Error);
            done();
        });

        it('can be constructed with new', function(done) {

            var fn = function() {

                var helmet = new Helmet({websocketPort: 3001});
            };

            expect(fn).to.not.throw(Error);
            done();
        });

        it('uses the helmet defaults when no config is passed in', function(done) {

            var helmet = new Helmet();

            expect(helmet.settings.host).to.equal('0.0.0.0');
            expect(helmet.settings.websocketPort).to.equal(3000);
            done();
        });

        it('uses the passed in config', function(done) {

            var helmet = new Helmet({host: 'localhost', websocketPort: 3002});

            expect(helmet.settings.host).to.equal('localhost');
            expect(helmet.settings.websocketPort).to.equal(3002);
            done();
        });
    });

    describe('#report', function() {

        it('sends the data to all subscribers when session is null', function(done) {

            var helmet = new Helmet({websocketPort: 3003});
            helmet._subscribers['*'] = [{
                readyState: Websocket.OPEN,
                send: function(message) {

                    expect(message).to.exist;
                    expect(message).to.equal('"test"');
                    done();
                }
            }];

            helmet.report(null, 'test');
        });

        it('only sends a message to the appropriate subscribers', function(done) {

            var helmet = new Helmet({websocketPort: 3004});
            helmet._subscribers['*'] = [{
                readyState: Websocket.OPEN,
                send: function(message) {

                    expect(message).to.not.exist;
                }
            }];

            helmet._subscribers['test'] = [{
                readyState: Websocket.OPEN,
                send: function(message) {

                    expect(message).to.exist;
                    expect(message).to.equal('"test"');
                    done();
                }
            }];

            helmet.report('test', 'test');
        });

        it('only sends a message when the websocket exists', function(done) {

            var helmet = new Helmet({websocketPort: 3005});
            helmet._subscribers['*'] = [{
                readyState: 'none',
                send: function(message) {

                    expect(message).to.not.exist;
                }
            }];

            helmet.report(null, 'test');
            done();
        });
    });

    describe('#getMarkup', function() {

        it('includes the hostname and port in the source', function(done) {

            var helmet = new Helmet({host: 'localhost', websocketPort: 3006});

            var html = helmet.getMarkup();

            expect(html).to.contain('localhost');
            expect(html).to.contain('3006');
            done();
        });
    });
});