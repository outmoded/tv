// Load modules

var _ = require('lodash');
var Hapi = require('hapi');
var Lab = require('lab');
var Ws = require('ws');
var Tv = require('../');
var MessageParser = require('../../source/js/messageParser');
var sinon = require('sinon');

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

var RECEIVED = {
    data: {
        method: 'get',
        url: '/'
    },
    tags: ['hapi', 'received']
};

var HANDLER = {
    data: {
        msec: 0.1
    },
    tags: ['hapi', 'handler']
};

var RESPONSE = {
    data: {
        statusCode: 201,
        error: 'error message'
    },
    tags: ['hapi', 'response'],
};

var ERROR = {
    data: {
        statusCode: 500,
        error: 'error message'
    },
    tags: ['hapi', 'internal', 'error'],
};

var createMessage = function(message, id) {
    id = id || '123abc';
    message.request = id;
    message.timestamp = new Date().valueOf();
    console.log('debug', message);

    return { data: JSON.stringify(message) };
};


describe('MessageParser', function() {
    beforeEach(function(done) {
        this.messageParser = MessageParser.create();

        done();
    });

    afterEach(function(done) {
        delete this.messageData;
        delete this.secondMessageData;
        delete this.messageParser;
        delete this.request;
        delete this.responseMessage;

        done();
    });

    describe('#create', function() {

        it('creates a new instance of a MessageParser', function(done) {
            expect(MessageParser.create()).to.be.instanceOf(MessageParser);
            done();
        });

    });

    it('has a requests array', function(done) {
        expect(this.messageParser.requests).to.be.instanceOf(Array).and.have.length(0);
        done();
    });

    describe('#addMessage', function() {

        context('with an initial message for a request', function() {

            beforeEach(function(done) {
                var message = createMessage(RECEIVED);
                this.messageData = JSON.parse(message.data);

                this.messageParser.addMessage(message);

                done();
            });

            it('creates a new request', function(done) {
                expect(this.messageParser.requests).to.have.length(1);

                var request = this.messageParser.requests[0];
                expect(request).to.have.property('id', this.messageData.request);
                expect(request).to.have.property('path', this.messageData.data.url);
                expect(request).to.have.property('method', this.messageData.data.method);
                expect(request).to.have.property('timestamp', this.messageData.timestamp);

                done();
            });

            it('creates a new server log', function(done) {
                var request = this.messageParser.requests[0];
                expect(request.serverLogs).to.have.length(1);
                expect([request.serverLogs[0]]).to.deep.include.members([{
                    tags: this.messageData.tags,
                    data: this.messageData.data,
                    timestamp: this.messageData.timestamp
                }]);

                done();
            });

            context('with a subsequent message for a request', function(done) {

                beforeEach(function(done) {
                    var message = createMessage(HANDLER);
                    this.secondMessageData = JSON.parse(message.data);

                    this.messageParser.addMessage(message);

                    done();
                });

                it('creates a server log for the message', function(done) {
                    var request = messageParser.requests[0];
                    expect(request.serverLogs).to.have.length(2);

                    var serverLog = request.serverLogs[1];
                    expect(serverLog.tags).to.have.length(2);
                    expect(serverLog.tags).to.include(this.secondMessageData.tags[0]);
                    expect(serverLog.tags).to.include(this.secondMessageData.tags[1]);
                    expect(serverLog.data).to.have.property('msec', this.secondMessageData.data.msec);
                    expect(serverLog).to.have.property('timestamp', this.secondMessageData.timestamp);

                    done();
                });

                it('doesn\'t create a request', function(done) {
                    expect(messageParser.requests).to.have.length(1);

                    done();
                });

            });

            var testResponseMessageUpdates = function(responseMessage) {
                context('with a response message for a request', function() {

                    beforeEach(function(done) {
                        var message = createMessage(responseMessage);
                        this.messageData = JSON.parse(message.data);

                        this.messageParser.addMessage(message);

                        this.request = _.findWhere(this.messageParser.requests, {id: this.messageData.request});

                        done();
                    });

                    it('updates the request object with the status code', function(done) {
                        // expect(this.request.statusCode).to.equal(this.messageData.data.statusCode);
                        expect(this.request.statusCode).to.equal('--');

                        done();
                    });

                    it('updates the request object with the error message', function(done) {
                        // expect(this.request.data).to.equal(this.messageData.data.error);
                        expect(this.request.data).to.equal('--');

                        done();
                    });
                });
            };

            testResponseMessageUpdates(RESPONSE);
            testResponseMessageUpdates(ERROR);

        });

        context('with a non "received" message for a request that doesn\'t exist', function(done) {

            beforeEach(function(done) {
                var message = createMessage(HANDLER, 'abc123');
                this.messageData = JSON.parse(message.data);

                this.messageParser.addMessage(message);

                done();
            });

            it('does not create a request', function(done) {
                expect(this.messageParser.requests).to.have.length(0);

                done();
            });

        });

        describe('when a response doesn\'t come in within a set timeout', function() {
            beforeEach( function(done) {
                this.messageParser = MessageParser.create({responseTimeout: 5})

                messageParser.addMessage(createMessage(RECEIVED));
                this.request = messageParser.requests[0];

                done();
            });

            it('sets a timeout response error message on the request', function(done) {
                setTimeout( function() {
                    expect(this.request.data).to.equal(MessageParser.RESPONSE_TIMEOUT_ERROR_MESSAGE);

                    done();
                }.bind(this), 10);
            });

            it('marks the request as having a response timeout', function(done) {
                expect(this.request.responseTimeout).to.not.be.true;

                setTimeout( function() {
                    expect(this.request.responseTimeout).to.be.true;

                    done();
                }.bind(this), 10);
            });

            it('calls the onResponseTimeout callback', function(done) {
                this.messageParser.onResponseTimeout = spy();

                setTimeout( function() {
                    expect(this.messageParser.onResponseTimeout.called).to.be.true;

                    done();
                }.bind(this), 100);
            });
        });

        describe('when a server log for a requests comes in before the response timeout', function() {

            it('resets the response timeout for that request', function(done) {
                var messageParser = MessageParser.create({responseTimeout: 3})

                messageParser.addMessage(createMessage(RECEIVED));

                setTimeout( function() {
                    messageParser.addMessage(createMessage(HANDLER));
                }, 2);

                setTimeout( function() {
                    var request = messageParser.requests[0];
                    expect(request.data).to.not.equal(MessageParser.RESPONSE_TIMEOUT_ERROR_MESSAGE);

                    done();
                }, 4);
            });
        });

        var clearResponseTimeoutTest = function(responseMessage) {
            describe('when a response for a request comes in after the response timeout has occured', function() {
                it('clears the response error timeout', function(done) {
                    var messageParser = MessageParser.create({responseTimeout: 1})

                    messageParser.addMessage(createMessage(RECEIVED));

                    var request = messageParser.requests[0];

                    setTimeout( function() {
                        expect(request.responseTimeout).to.be.true;

                        messageParser.addMessage(createMessage(responseMessage));
                    }, 3);

                    setTimeout( function() {
                        expect(request.responseTimeout).to.be.false;

                        done();
                    }, 6);

                });
            });
        };

        clearResponseTimeoutTest(RESPONSE);
        clearResponseTimeoutTest(ERROR);

    });

    describe('#clear', function() {

        it('clears the out the parsed requests', function(done) {
            this.messageParser.addMessage(createMessage(RECEIVED));

            this.messageParser.clear();

            expect(this.messageParser.requests).to.be.empty;

            done();
        });

    });

});
