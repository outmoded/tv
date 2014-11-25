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

            this.setStateSpy = spy();
            this.isScrolledToBottomStub = stub();
            this.scrollToBottomSpy = spy();
            this.reactRenderSpy = sinon.stub(React, 'render', function() {
                return {
                    setState: this.setStateSpy,
                    isScrolledToBottom: isScrolledToBottomStub,
                    scrollToBottom: scrollToBottomSpy
                }
            }.bind(this));

            app.start(mockWebSocketManager, this.messageParser, this.appComponent);

            done();
        });

        afterEach(function(done){
            React.render.restore();
            this.messageParser.addMessage.restore();

            delete this.messageParser;
            delete this.mockWebSocket;
            delete this.messageParserAddMessageSpy;
            delete this.reactRenderSpy;
            delete this.setStateSpy;
            delete this.isScrolledToBottomStub;
            delete this.scrollToBottomSpy;
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

                expect(this.setStateSpy.args[0][0].requests).to.equal(this.messageParser.requests);

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

                expect(this.setStateSpy.callCount).to.equal(1);
                expect(this.setStateSpy.args[0][0]).to.have.property('requests', parsedRequests);

                done();
            });

            context('with the browser window not scrolled to the bottom', function() {

                it('does not scroll the browser window to the bottom after posting the new message', function(done) {
                    this.isScrolledToBottomStub.returns(false);

                    this.mockWebSocket.onmessage('fake message');

                    expect(this.scrollToBottomSpy.callCount).to.equal(0);

                    done();
                });

            });

            context('with the browser window scrolled to the bottom', function() {

                it('scrolls the browser window to the bottom after posting the new message', function(done) {
                    this.isScrolledToBottomStub.returns(true);

                    this.mockWebSocket.onmessage('fake message');

                    expect(this.scrollToBottomSpy.callCount).to.equal(1);

                    done();
                });

            });
        });

    });

});
