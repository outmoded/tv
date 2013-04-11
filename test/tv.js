// Load modules

var Lab = require('lab');
var Http = require('http');
var Ws = require('ws');
var Tv = require('../lib/tv');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('Tv', function () {

    describe('#constructor', function () {

        it('cannot be constructed without new', function (done) {

            var fn = function () {

                var tv = Tv();
            };

            expect(fn).to.throw(Error);
            done();
        });

        it('can be constructed with new', function (done) {

            var fn = function () {

                var tv = new Tv({ port: 0 });
            };

            expect(fn).to.not.throw(Error);
            done();
        });

        it('uses the tv defaults when no config is passed in', function (done) {

            var tv = new Tv();

            expect(tv.settings.host).to.equal('0.0.0.0');
            expect(tv.settings.port).to.equal(3000);
            done();
        });

        it('uses the passed in config', function (done) {

            var tv = new Tv({ host: 'localhost', port: 3002 });

            expect(tv.settings.host).to.equal('localhost');
            expect(tv.settings.port).to.equal(3002);
            done();
        });

        it('adds message to subscribers list when receiving message', function (done) {

            var config = { host: 'localhost', port: 0 };
            var tv = new Tv(config);

            tv.start(function () {

                var ws = new Ws("ws://" + tv.settings.host + ':' + tv.settings.port);
                ws.readyState = Ws.OPEN;

                ws.on('open', function () {

                    ws.send("test1");
                    setTimeout(function () {

                        expect(tv._subscribers["test1"]).to.exist;
                        done();
                    }, 100);
                });
            });
        });

        it('responds with not implemented when making a non-ws request', function (done) {

            var config = { host: 'localhost', port: 0 };
            var tv = new Tv(config);

            tv.start(function () {

                var options = {
                    hostname: tv.settings.host,
                    port: tv.settings.port,
                    path: '/',
                    method: 'GET'
                };

                var req = Http.request(options, function (res) {

                    expect(res.statusCode).to.equal(501);
                    done();
                });

                req.once('error', function (err) {

                    done();
                });

                req.end();
            });
        });
    });

    describe('#report', function () {

        it('sends the data to all subscribers when session is null', function (done) {

            var tv = new Tv({ port: 0 });
            tv._subscribers['*'] = [{
                readyState: Ws.OPEN,
                send: function (message) {

                    expect(message).to.exist;
                    expect(message).to.equal('"test"');
                    done();
                }
            }];

            tv.report('test');
        });

        it('only sends a message to the appropriate subscribers', function (done) {

            var tv = new Tv({ port: 0 });
            tv._subscribers['*'] = [{
                readyState: Ws.OPEN,
                send: function (message) {

                    expect(message).to.not.exist;
                }
            }];

            tv._subscribers['test'] = [{
                readyState: Ws.OPEN,
                send: function (message) {

                    expect(message).to.exist;
                    expect(message).to.equal('"test"');
                    done();
                }
            }];

            tv.report('test', 'test');
        });

        it('only sends a message when the websocket exists', function (done) {

            var tv = new Tv({ port: 0 });
            tv._subscribers['*'] = [{
                readyState: 'none',
                send: function (message) {

                    expect(message).to.not.exist;
                }
            }];

            tv.report('test');
            done();
        });
    });
});