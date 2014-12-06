// Load modules

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Ws = require('ws');
var Tv = require('../');
var Os = require('os');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

internals.waitForSocketMessages = function(fn) {
    setTimeout(fn, 50);
};


it('reports a request event', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register({ register: Tv, options: { port: 0 } }, function (err) {

        expect(err).to.not.exist();

        server.inject('/debug/console', function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            var host = res.result.match(/var host = '([^']+)'/)[1];
            var port = res.result.match(/var port = (\d+)/)[1];
            var ws = new Ws('ws://' + host + ':' + port);

            ws.once('open', function () {

                ws.send('subscribe:*');

                internals.waitForSocketMessages(function () {

                    server.inject('/?debug=123', function (res) {

                        expect(res.result).to.equal('1');
                    });
                });
            });

            ws.once('message', function (data, flags) {

                expect(JSON.parse(data).data.agent).to.equal('shot');
                done();
            });
        });
    });
});

it('handles subscribe and unsubscribe', function(done) {

    var server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register({ register: Tv, options: { port: 0 } }, function (err) {

        expect(err).to.not.exist();

        server.inject('/debug/console', function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            var host = res.result.match(/var host = '([^']+)'/)[1];
            var port = res.result.match(/var port = (\d+)/)[1];
            var ws = new Ws('ws://' + host + ':' + port);
            var messageCount = 0;

            ws.once('open', function () {

                ws.send('subscribe:*');

                internals.waitForSocketMessages(function () {

                    server.inject('/?debug=123', function() {

                        internals.waitForSocketMessages(function() {

                            var singleRequestMessageCount = messageCount;
                            ws.send('unsubscribe:*');

                            internals.waitForSocketMessages(function() {

                                server.inject('/?debug=123', function() {

                                    internals.waitForSocketMessages(function() {

                                        expect(messageCount).to.equal(singleRequestMessageCount);

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            ws.on('message', function (data, flags) {
                ++messageCount;
            });
        });
    });
});

it('does not resubscribe for the same socket', function(done) {

    var server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register({ register: Tv, options: { port: 0 } }, function (err) {

        expect(err).to.not.exist();

        server.inject('/debug/console', function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            var host = res.result.match(/var host = '([^']+)'/)[1];
            var port = res.result.match(/var port = (\d+)/)[1];
            var ws = new Ws('ws://' + host + ':' + port);
            var messageCount = 0;

            ws.once('open', function () {

                ws.send('subscribe:*');

                internals.waitForSocketMessages(function () {

                    server.inject('/?debug=123', function() {

                        internals.waitForSocketMessages(function() {

                            var singleRequestMessageCount = messageCount;
                            ws.send('subscribe:*');

                            internals.waitForSocketMessages(function() {

                                server.inject('/?debug=123', function() {

                                    internals.waitForSocketMessages(function() {

                                        expect(messageCount).to.equal(singleRequestMessageCount * 2);

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            ws.on('message', function (data, flags) {
                ++messageCount;
            });
        });
    });
});

it('handles reconnects gracefully', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register({ register: Tv, options: { port: 0, host: 'localhost' }}, function (err) {

        expect(err).to.not.exist();

        server.inject('/debug/console', function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            var host = res.result.match(/var host = '([^']+)'/)[1];
            var port = res.result.match(/var port = (\d+)/)[1];
            var ws1 = new Ws('ws://' + host + ':' + port);

            ws1.once('open', function () {

                ws1.send('subscribe:*');
                ws1.close();
                var ws2 = new Ws('ws://' + host + ':' + port);

                ws2.once('open', function () {

                    ws2.send('subscribe:*');
                    internals.waitForSocketMessages(function () {

                        server.inject('/?debug=123', function (res) {

                            expect(res.result).to.equal('1');
                        });
                    });
                });

                // Shouldn't get called
                ws2.once('message', function (data, flags) {

                    expect(JSON.parse(data).data.agent).to.equal('shot');
                    done();
                });
            });
        });
    });
});

it('uses specified hostname', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register({register: Tv, options: { host: '127.0.0.1', port: 0 } }, function (err) {

        expect(err).to.not.exist();

        server.inject('/debug/console', function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            var host = res.result.match(/var host = '([^']+)'/)[1];
            expect(host).to.equal('127.0.0.1');
            done();

        });
    });
});

it('uses specified public hostname', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register({ register: Tv, options: { port: 0, host: 'localhost', publicHost: '127.0.0.1' }}, function (err) {

        expect(err).to.not.exist();

        server.inject('/debug/console', function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            var host = res.result.match(/var host = '([^']+)'/)[1];
            expect(host).to.equal('127.0.0.1');
            done();

        });
    });
});

it('defaults to os hostname if unspecified', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register({ register: Tv, options: { port: 0, host: 'localhost', publicHost: '0.0.0.0' }}, function (err) {

        expect(err).to.not.exist();

        server.inject('/debug/console', function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            var host = res.result.match(/var host = '([^']+)'/)[1];
            expect(host).to.equal(Os.hostname());
            done();

        });
    });
});
