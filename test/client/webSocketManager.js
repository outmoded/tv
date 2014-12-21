// Load modules

var sinon = require('sinon');

var WebSocketManager = require('../../source/js/webSocketManager');


// Declare internals

var internals = {};


describe('WebSocketManager', function () {

    beforeEach(function () {

        this.webSocketSendSpy = sinon.spy();
        this.onmessageSpy = sinon.spy();
        this.mockWebSocket = { send: this.webSocketSendSpy, onmessage: this.onmessageSpy };

        this.manager = WebSocketManager.create(this.mockWebSocket);
    });

    describe('#create', function () {

        it('creates a new instance of a WebSocketManager', function () {

            expect(WebSocketManager.create(this.mockWebSocket)).to.be.an.instanceOf(WebSocketManager);
        });

    });

    describe('when a websocket is openned', function () {

        it('calls teh onSocketOpen callback', function () {

            var onSocketOpenSpy = sinon.spy();
            this.manager.onSocketOpen = onSocketOpenSpy;

            this.mockWebSocket.onopen();

            expect(onSocketOpenSpy).to.have.been.calledOnce;
        });

    });

    describe('#applyFilter', function (){

        context('with a webSocket connection that is open', function () {

            it('filters the messages by the given client id', function () {

                this.mockWebSocket.onopen();

                this.manager.applyFilter('456');

                expect(this.mockWebSocket.send.callCount).to.equal(2);
                expect(this.mockWebSocket.send.args[1][0]).to.equal('subscribe:456');
            });
        });

    });

    describe('#clearFilter', function () {

        it('clears any previously set filter so all messages are received', function () {

            this.mockWebSocket.onopen();

            this.manager.clearFilter();

            expect(this.mockWebSocket.send.callCount).to.equal(2);
            expect(this.mockWebSocket.send.args[1][0]).to.equal('subscribe:*');
        });

    });

    describe('#onMessage', function (){

        it('registers a callback that\'s called whenever a message is received', function () {

            var onMessageFn = function () { };
            this.manager.onMessage(onMessageFn);

            expect(this.mockWebSocket.onmessage).to.equal(onMessageFn);
        });

    });

    describe('#pause', function (){

        it('stops forwarding messages to the onMesssage callback', function () {

            var onMessageFn = function () { };
            this.manager.onMessage(onMessageFn);

            this.manager.pause();

            expect(this.mockWebSocket.onmessage).to.equal(null);
        });

    });

    describe('#resume', function (){

        it('resumes forwarding messages to the onMesssage callback', function () {

            var onMessageFn = function () { };
            this.manager.onMessage(onMessageFn);

            this.manager.pause();

            this.manager.resume();

            expect(this.mockWebSocket.onmessage).to.equal(onMessageFn);
        });

    });

});
