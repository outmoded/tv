// Load modules

var Chai = require('chai');
var Hapi = require('hapi');
var Ws = require('ws');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Chai.expect;


describe('Tv', function () {

    var server = null;

    before(function (done) {

        var options = {
            websocketPort: 3007
        };

        server = new Hapi.Server();

        server.route({
            method: 'GET',
            path: '/',
            handler: function () {

                return this.reply('1');
            }
        });

        server.plugin().allow({ ext: true }).require('../', options, function (err) {

            expect(err).to.not.exist;
            done();
        });
    });

    it('returns the console html', function (done) {

        server.inject({ method: 'GET', url: '/debug/console' }, function (res) {

            expect(res.result).to.contain('<!DOCTYPE html>');
            done();
        });
    });

    it('reports a request event', function (done) {

        var ws = new Ws('ws://localhost:3007');

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


