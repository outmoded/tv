'use strict';
// Load modules

const Code = require('code');
const Hapi = require('hapi');
const Inert = require('inert');
const Lab = require('lab');
const Os = require('os');
const Tv = require('../');
const Vision = require('vision');
const Ws = require('ws');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const it = lab.it;
const expect = Code.expect;

internals.waitForSocketMessages = function (fn) {

    setTimeout(fn, 50);
};


it('reports a request event', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Vision, Inert, { register: Tv, options: { port: 0 } }], (err) => {

        expect(err).to.not.exist();

        server.inject('/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            const host = res.result.match(/var host = '([^']+)'/)[1];
            const port = res.result.match(/var port = (\d+)/)[1];
            const ws = new Ws('ws://' + host + ':' + port);

            ws.once('open', () => {

                ws.send('subscribe:*');

                internals.waitForSocketMessages(() => {

                    server.inject('/?debug=123', (response) => {

                        expect(response.result).to.equal('1');
                    });
                });
            });

            ws.once('message', (data, flags) => {

                expect(JSON.parse(data).data.agent).to.equal('shot');
                done();
            });
        });
    });
});

it('handles subscribe and unsubscribe', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Vision, Inert, { register: Tv, options: { port: 0 } }], (err) => {

        expect(err).to.not.exist();

        server.inject('/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            const host = res.result.match(/var host = '([^']+)'/)[1];
            const port = res.result.match(/var port = (\d+)/)[1];
            const ws = new Ws('ws://' + host + ':' + port);
            let messageCount = 0;

            ws.once('open', () => {

                ws.send('subscribe:*');

                internals.waitForSocketMessages(() => {

                    server.inject('/?debug=123', () => {

                        internals.waitForSocketMessages(() => {

                            const singleRequestMessageCount = messageCount;
                            ws.send('unsubscribe:*');

                            internals.waitForSocketMessages(() => {

                                server.inject('/?debug=123', () => {

                                    internals.waitForSocketMessages(() => {

                                        expect(messageCount).to.equal(singleRequestMessageCount);

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            ws.on('message', (data, flags) => {

                ++messageCount;
            });
        });
    });
});

it('does not resubscribe for the same socket', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Vision, Inert, { register: Tv, options: { port: 0 } }], (err) => {

        expect(err).to.not.exist();

        server.inject('/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            const host = res.result.match(/var host = '([^']+)'/)[1];
            const port = res.result.match(/var port = (\d+)/)[1];
            const ws = new Ws('ws://' + host + ':' + port);
            let messageCount = 0;

            ws.once('open', () => {

                ws.send('subscribe:*');

                internals.waitForSocketMessages(() => {

                    server.inject('/?debug=123', () => {

                        internals.waitForSocketMessages(() => {

                            const singleRequestMessageCount = messageCount;
                            ws.send('subscribe:*');

                            internals.waitForSocketMessages(() => {

                                server.inject('/?debug=123', () => {

                                    internals.waitForSocketMessages(() => {

                                        expect(messageCount).to.equal(singleRequestMessageCount * 2);

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            ws.on('message', (data, flags) => {

                ++messageCount;
            });
        });
    });
});

it('handles reconnects gracefully', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Vision, Inert, { register: Tv, options: { port: 0, host: 'localhost' } }], (err) => {

        expect(err).to.not.exist();

        server.inject('/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            const host = res.result.match(/var host = '([^']+)'/)[1];
            const port = res.result.match(/var port = (\d+)/)[1];
            const ws1 = new Ws('ws://' + host + ':' + port);

            ws1.once('open', () => {

                ws1.send('subscribe:*');
                ws1.close();
                const ws2 = new Ws('ws://' + host + ':' + port);

                ws2.once('open', () => {

                    ws2.send('subscribe:*');
                    internals.waitForSocketMessages(() => {

                        server.inject('/?debug=123', (response) => {

                            expect(response.result).to.equal('1');
                        });
                    });
                });

                // Shouldn't get called
                ws2.once('message', (data, flags) => {

                    expect(JSON.parse(data).data.agent).to.equal('shot');
                    done();
                });
            });
        });
    });
});

it('uses specified hostname', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Vision, Inert, { register: Tv, options: { host: '127.0.0.1', port: 0 } }], (err) => {

        expect(err).to.not.exist();

        server.inject('/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            const host = res.result.match(/var host = '([^']+)'/)[1];
            expect(host).to.equal('127.0.0.1');
            done();

        });
    });
});

it('uses specified public hostname', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Vision, Inert, { register: Tv, options: { port: 0, host: 'localhost', publicHost: '127.0.0.1' } }], (err) => {

        expect(err).to.not.exist();

        server.inject('/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            const host = res.result.match(/var host = '([^']+)'/)[1];
            expect(host).to.equal('127.0.0.1');
            done();

        });
    });
});

it('binds to address and uses host as public hostname', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Vision, Inert, { register: Tv, options: { port: 0, host: 'aaaaa', address: '127.0.0.1' } }], (err) => {

        expect(err).to.not.exist();

        server.inject('/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            const host = res.result.match(/var host = '([^']+)'/)[1];
            expect(host).to.equal('aaaaa');
            done();

        });
    });
});

it('defaults to os hostname if unspecified', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Vision, Inert, { register: Tv, options: { port: 0, host: 'localhost', publicHost: '0.0.0.0' } }], (err) => {

        expect(err).to.not.exist();

        server.inject('/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            const host = res.result.match(/var host = '([^']+)'/)[1];
            expect(host).to.equal(Os.hostname());
            done();

        });
    });
});


it('uses specified route prefix for assets', (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            return reply('1');
        }
    });

    server.register([Inert, Vision, { register: Tv, options: { port: 0 } }], { routes: { prefix: '/test' } }, (err) => {

        expect(err).to.not.exist();

        server.inject('/test/debug/console', (res) => {

            expect(res.statusCode).to.equal(200);

            const cssPath = 'href="' + res.request.path + '/css/style.css';
            const jsPath = 'src="' + res.request.path + '/js/main.js';
            expect(res.result).to.contain(cssPath);
            expect(res.result).to.contain(jsPath);
            done();

        });
    });
});
