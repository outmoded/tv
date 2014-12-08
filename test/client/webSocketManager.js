// Load modules

//var Lab = require('lab');
var Sinon = require('sinon');
var WebSocketManager = require('../../source/js/webSocketManager');

// Declare internals

var internals = {};

// Test shortcuts

//var lab = exports.lab = Lab.script();
//var describe = lab.describe;
//var beforeEach = lab.beforeEach;
//var afterEach = lab.afterEach;
//var context = lab.describe;
//var it = lab.it;
//var expect = Lab.expect;
var spy = Sinon.spy;

describe('WebSocketManager', function() {

    describe('#create', function() {

        it('creates a new instance of a WebSocketManager', function(done) {
            var webSocketMock = { send: function(){} };

            expect(WebSocketManager.create(webSocketMock)).to.be.an.instanceOf(WebSocketManager);

            done();
        });

    });

    describe('initialization', function() {

        context('without a client id', function() {

            it('receives all messages', function(done) {
                var webSocketMock = { send: spy() };

                WebSocketManager.create(webSocketMock);
                webSocketMock.onopen();

                expect(webSocketMock.send.callCount).to.equal(1);
                expect(webSocketMock.send.args[0][0]).to.equal('*');

                done();
            });

        });

        context('with a client id', function() {

            it('only receives messages for the given client id', function(done) {
                var webSocketMock = { send: spy() };

                WebSocketManager.create(webSocketMock, '123');
                webSocketMock.onopen();

                expect(webSocketMock.send.callCount).to.equal(1);
                expect(webSocketMock.send.args[0][0]).to.equal('123');

                done();
            });

        });

    });

    describe('#applyFilter', function(){

        beforeEach(function(done){
            this.webSocketMock = { send: spy() };
            this.webSocketManager = WebSocketManager.create(this.webSocketMock);

            done();
        });

        afterEach(function(done){
            delete this.webSocketMock;
            delete this.webSocketManager;

            done();
        });

        context('with a webSocket connection that\'s not open yet', function() {

            it('filters the messages by the given client id when the connection is open', function(done) {
                this.webSocketManager.applyFilter('456');

                expect(this.webSocketMock.send.callCount).to.equal(0);

                this.webSocketMock.onopen();

                expect(this.webSocketMock.send.callCount).to.equal(1);
                expect(this.webSocketMock.send.args[0][0]).to.equal('456');

                done();
            });

        });

        context('with a webSocket connection that is open', function() {
            it('filters the messages by the given client id', function(done) {
                this.webSocketMock.onopen();

                this.webSocketManager.applyFilter('456');

                expect(this.webSocketMock.send.callCount).to.equal(2);
                expect(this.webSocketMock.send.args[1][0]).to.equal('456');

                done();
            });
        });

    });

    describe('#clearFilter', function() {

        it('clears any previously set filter so all messages are received', function(done) {
            var webSocketMock = { send: spy() };

            var webSocketManager = WebSocketManager.create(webSocketMock, '123');

            webSocketMock.onopen();

            webSocketManager.clearFilter();

            expect(webSocketMock.send.callCount).to.equal(2);
            expect(webSocketMock.send.args[1][0]).to.equal('*');

            done();
        });

    });

    describe('#onMessage', function(){

        it('registers a callback that\'s called whenever a message is received', function(done) {
            var webSocketMock = { send: spy() };

            var webSocketManager = WebSocketManager.create(webSocketMock, '123');

            var onMessageFn = function() {};
            webSocketManager.onMessage(onMessageFn);

            expect(webSocketMock.onmessage).to.equal(onMessageFn);

            done();
        });

    });

    describe('#pause', function(){

        it('stops forwarding messages to the onMesssage callback', function(done) {
            var onmessageSpy = spy();

            var webSocketMock = { onmessage: onmessageSpy };

            var webSocketManager = WebSocketManager.create(webSocketMock, '123');

            var onMessageFn = function() {};
            webSocketManager.onMessage(onMessageFn);

            webSocketManager.pause();

            expect(webSocketMock.onmessage).to.equal(null);

            done();
        });

    });

    describe('#resume', function(){

        it('resumes forwarding messages to the onMesssage callback', function(done) {
            var onmessageSpy = spy();

            var webSocketMock = { onmessage: onmessageSpy };

            var webSocketManager = WebSocketManager.create(webSocketMock, '123');

            var onMessageFn = function() {};
            webSocketManager.onMessage(onMessageFn);

            webSocketManager.pause();

            webSocketManager.resume();

            expect(webSocketMock.onmessage).to.equal(onMessageFn);

            done();
        });

    });

});













