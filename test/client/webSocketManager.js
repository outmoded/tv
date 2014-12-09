// Load modules

var sinon = require('sinon');

var WebSocketManager = require('../../source/js/webSocketManager');


// Declare internals

var internals = {};


describe('WebSocketManager', function() {

    describe('#create', function() {

        it('creates a new instance of a WebSocketManager', function(done) {
            var mockWebSocket = { send: function(){} };

            expect(WebSocketManager.create(mockWebSocket)).to.be.an.instanceOf(WebSocketManager);

            done();
        });

    });

    describe('when a websocket is openned', function() {

        it('calls teh onSocketOpen callback', function() {
            var mockWebSocket = { send: sinon.spy() };
            var manager = WebSocketManager.create(mockWebSocket);

            var onSocketOpenSpy = sinon.spy(manager, 'onSocketOpen');

            mockWebSocket.onopen();

            expect(onSocketOpenSpy).to.have.been.calledOnce;
        });

    });

    describe('#applyFilter', function(){

        beforeEach(function(done){
            this.mockWebSocket = { send: sinon.spy() };
            this.webSocketManager = WebSocketManager.create(this.mockWebSocket);

            done();
        });

        afterEach(function(done){
            delete this.mockWebSocket;
            delete this.webSocketManager;

            done();
        });

        context('with a webSocket connection that is open', function() {
            it('filters the messages by the given client id', function(done) {
                this.mockWebSocket.onopen();

                this.webSocketManager.applyFilter('456');

                expect(this.mockWebSocket.send.callCount).to.equal(2);
                expect(this.mockWebSocket.send.args[1][0]).to.equal('subscribe:456');

                done();
            });
        });

    });

    describe('#clearFilter', function() {

        it('clears any previously set filter so all messages are received', function(done) {
            var mockWebSocket = { send: sinon.spy() };

            var webSocketManager = WebSocketManager.create(mockWebSocket, '123');

            mockWebSocket.onopen();

            webSocketManager.clearFilter();

            expect(mockWebSocket.send.callCount).to.equal(2);
            expect(mockWebSocket.send.args[1][0]).to.equal('subscribe:*');

            done();
        });

    });

    describe('#onMessage', function(){

        it('registers a callback that\'s called whenever a message is received', function(done) {
            var mockWebSocket = { send: sinon.spy() };

            var webSocketManager = WebSocketManager.create(mockWebSocket, '123');

            var onMessageFn = function() {};
            webSocketManager.onMessage(onMessageFn);

            expect(mockWebSocket.onmessage).to.equal(onMessageFn);

            done();
        });

    });

    describe('#pause', function(){

        it('stops forwarding messages to the onMesssage callback', function(done) {
            var onmessageSpy = sinon.spy();

            var mockWebSocket = { onmessage: onmessageSpy };

            var webSocketManager = WebSocketManager.create(mockWebSocket, '123');

            var onMessageFn = function() {};
            webSocketManager.onMessage(onMessageFn);

            webSocketManager.pause();

            expect(mockWebSocket.onmessage).to.equal(null);

            done();
        });

    });

    describe('#resume', function(){

        it('resumes forwarding messages to the onMesssage callback', function(done) {
            var onmessageSpy = sinon.spy();

            var mockWebSocket = { onmessage: onmessageSpy };

            var webSocketManager = WebSocketManager.create(mockWebSocket, '123');

            var onMessageFn = function() {};
            webSocketManager.onMessage(onMessageFn);

            webSocketManager.pause();

            webSocketManager.resume();

            expect(mockWebSocket.onmessage).to.equal(onMessageFn);

            done();
        });

    });

});
