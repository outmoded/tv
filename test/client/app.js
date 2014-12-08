// Load modules

//var Lab = require('lab');
var sinon = require('sinon');
var app = require('../../source/js/app');
var WebSocketManager = require('../../source/js/webSocketManager');
var MessageParser = require('../../source/js/messageParser');


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
var spy = sinon.spy;
var stub = sinon.stub;

describe('app', function() {

    describe('#start', function() {

        beforeEach(function(done){
            global.$ = sinon.stub().returns({ get: function(){} });

            this.mockWebSocket = { send: spy() };
            var mockWebSocketManager = WebSocketManager.create(this.mockWebSocket);

            this.messageParser = MessageParser.create();
            this.messageParserAddMessageSpy = sinon.stub(this.messageParser, 'addMessage', function() {});

            this.appComponent = { render: spy(), setState: spy() };

            this.updateStateSpy = spy();

            app.start(mockWebSocketManager, this.messageParser, this.appComponent);

            done();
        });

        afterEach(function(done){
            this.messageParser.addMessage.restore();

            delete this.messageParser;
            delete this.mockWebSocket;
            delete this.messageParserAddMessageSpy;
            delete this.reactRenderSpy;
            delete this.updateStateSpy;
            delete this.appComponent;
            delete global.$;

            done();
        });

        it('renders the appComponent', function(done) {
            expect(this.reactRenderSpy.callCount).to.equal(1);

            done();
        });

        describe('when a response timeout occurs', function() {

            it('resets the state of the app component', function(done) {
                this.messageParser.onResponseTimeout();

                expect(this.updateStateSpy.called).to.be.true;

                done();
            });

        });

        describe('when a message is received', function(){

            it('adds the message to the message parser', function(done) {
                var message = 'fake message';

                this.mockWebSocket.onmessage(message);

                expect(this.messageParserAddMessageSpy.callCount).to.equal(1);
                expect(this.messageParserAddMessageSpy.args[0][0]).to.equal(message);

                done();
            });

            it('updates the app component\'s state to the message parser\'s results', function(done) {
                var message = 'fake message';
                var parsedRequests = 'fake parsed requests'
                this.messageParser.requests = parsedRequests;

                this.mockWebSocket.onmessage(message);

                expect(this.updateStateSpy.callCount).to.equal(1);
                expect(this.updateStateSpy.called).to.be.true;

                done();
            });

        });

    });

});
