// Load modules

var Lab = require('lab');
var Hapi = require('hapi');
var Ws = require('ws');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('Tv', function () {

    var server = null;

    before(function (done) {

        var options = {
            port: 0
        };

        server = new Hapi.Server(0);

        server.route({
            method: 'GET',
            path: '/',
            handler: function () {

                this.reply('1');
            }
        });

        server.pack.allow({ ext: true, views: true }).require('../', options, function (err) {

            expect(err).to.not.exist;
            done();
        });
    });

    it('reports a request event', function (done) {

        server.inject('/debug/console', function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('Debug Console');

            var host = res.result.match(/var host = '([^']+)'/)[1];
            var port = res.result.match(/var port = (\d+)/)[1];
            var ws = new Ws('ws://' + host + ':' + port);

            ws.on('open', function () {

                ws.send('*');

                setTimeout(function () {

                    server.inject('/?debug=123', function (res) {

                        expect(res.result).to.equal('1');
                    });
                }, 100);
            });

            ws.once('message', function (data, flags) {

                expect(JSON.parse(data).data.agent).to.equal('shot');
                done();
            });
        });
    });
});


