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

                return this.reply('1');
            }
        });

        server.plugin.allow({ ext: true }).require('../../../', options, function (err) {

            expect(err).to.not.exist;
            done();
        });
    });

    it('returns the console html', function (done) {

        server.inject({ method: 'GET', url: '/debug/console' }, function (res) {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('<!DOCTYPE html>');
            done();
        });
    });

    it('reports a request event', function (done) {

        var ws = new Ws(server.plugins.tv.uri);

        ws.on('open', function () {

            ws.send('*');

            setTimeout(function () {

                server.inject({ method: 'GET', url: '/?debug=123' }, function (res) {

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


