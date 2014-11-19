// Load modules

var React = require('react');
var Lab = require('lab');
var sinon = require('sinon');
var app = require('../../source/js/app');
var WebSocketManager = require('../../source/js/webSocketManager');
var MessageParser = require('../../source/js/messageParser');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var context = lab.describe;
var it = lab.it;
var expect = Lab.expect;
var spy = sinon.spy;

describe('app', function() {
  
    describe('#start', function() {

        beforeEach(function(done){
            global.$ = sinon.stub().returns({ get: function(){} });

            this.mockWebSocket = { send: spy() };
            var mockWebSocketManager = WebSocketManager.create(this.mockWebSocket);
            this.messageParser = MessageParser.create();
            this.messageParserAddMessageSpy = sinon.stub(this.messageParser, 'addMessage', function() {});
            this.rootComponent = { render: spy(), setState: spy() };
            this.reactRenderSpy = sinon.stub(React, 'render');

            app.start(mockWebSocketManager, this.messageParser, this.rootComponent);

            done();
        });

        afterEach(function(done){
            React.render.restore();
            this.messageParser.addMessage.restore();

            delete this.messageParser;
            delete this.mockWebSocket;
            delete this.messageParserAddMessageSpy;
            delete this.reactRenderSpy;
            delete this.rootComponent;
            delete global.$;

            done();
        });

        it('renders the rootComponent', function(done) {
            expect(this.reactRenderSpy.callCount).to.equal(1);

            done();
        });

        describe('when a message is received', function(){
            
            it('adds the message to the message parser', function(done) {
                var message = 'fake message';

                this.mockWebSocket.onmessage(message);

                expect(this.messageParserAddMessageSpy.callCount).to.equal(1);
                expect(this.messageParserAddMessageSpy.args[0][0]).to.equal(message);

                done();
            });

            it('updates the root component\'s state to the message parser\'s results', function(done) {
                var message = 'fake message';
                var parsedRequests = 'fake parsed requests'
                this.messageParser.requests = parsedRequests;

                this.mockWebSocket.onmessage(message);

                expect(this.rootComponent.setState.callCount).to.equal(1);
                expect(this.rootComponent.setState.args[0][0]).to.have.property('requests', parsedRequests);

                done();
            });
        });

    });

});