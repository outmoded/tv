// Load modules

var Chai = require('chai');
var Websocket = require('ws');
var Tv = require('../lib');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Chai.expect;


describe('Tv', function() {

    describe('#constructor', function() {

        it('cannot be constructed without new', function(done) {

            var fn = function() {

                var tv = Tv();
            };

            expect(fn).to.throw(Error);
            done();
        });

        it('can be constructed with new', function(done) {

            var fn = function() {

                var tv = new Tv({websocketPort: 3001});
            };

            expect(fn).to.not.throw(Error);
            done();
        });

        it('uses the tv defaults when no config is passed in', function(done) {

            var tv = new Tv();

            expect(tv.settings.host).to.equal('0.0.0.0');
            expect(tv.settings.websocketPort).to.equal(3000);
            done();
        });

        it('uses the passed in config', function(done) {

            var tv = new Tv({host: 'localhost', websocketPort: 3002});

            expect(tv.settings.host).to.equal('localhost');
            expect(tv.settings.websocketPort).to.equal(3002);
            done();
        });

        it('adds message to subscribers list when receiving message', function(done) {

            var config = {host: 'localhost', websocketPort: 3010}
            var tv = new Tv(config);

            var ws = new Websocket("ws://" + config.host + ':' + config.websocketPort);
            ws.readyState = Websocket.OPEN;
            
            ws.on('open', function() {

                ws.send("test1");
                setTimeout(function(){

                    expect(tv._subscribers["test1"]).to.exist;
                    done();
                },  1000);
            });
        });
    });

    describe('#report', function() {

        it('sends the data to all subscribers when session is null', function(done) {

            var tv = new Tv({websocketPort: 3003});
            tv._subscribers['*'] = [{
                readyState: Websocket.OPEN,
                send: function(message) {

                    expect(message).to.exist;
                    expect(message).to.equal('"test"');
                    done();
                }
            }];

            tv.report(null, 'test');
        });

        it('only sends a message to the appropriate subscribers', function(done) {

            var tv = new Tv({websocketPort: 3004});
            tv._subscribers['*'] = [{
                readyState: Websocket.OPEN,
                send: function(message) {

                    expect(message).to.not.exist;
                }
            }];

            tv._subscribers['test'] = [{
                readyState: Websocket.OPEN,
                send: function(message) {

                    expect(message).to.exist;
                    expect(message).to.equal('"test"');
                    done();
                }
            }];

            tv.report('test', 'test');
        });

        it('only sends a message when the websocket exists', function(done) {

            var tv = new Tv({websocketPort: 3005});
            tv._subscribers['*'] = [{
                readyState: 'none',
                send: function(message) {

                    expect(message).to.not.exist;
                }
            }];

            tv.report(null, 'test');
            done();
        });
    });

    describe('#getMarkup', function() {

        it('includes the hostname and port in the source', function(done) {

            var tv = new Tv({host: 'localhost', websocketPort: 3006});

            var html = tv.getMarkup();

            expect(html).to.contain('localhost');
            expect(html).to.contain('3006');
            done();
        });
    });
});