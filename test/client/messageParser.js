// Load modules

var _ = require('lodash');
var Sinon = require('sinon');

var MessageParser = require('../../source/js/messageParser');


// Declare internals

var internals = {};


// Test Shortcuts

var Spy = Sinon.spy;



internals.RECEIVED = {
    data: {
        method: 'get',
        url: '/'
    },
    tags: ['received'],
    internal: true
};

internals.HANDLER = {
    data: {
        msec: 0.1
    },
    tags: ['handler'],
    internal: true
};

internals.RESPONSE = {
    data: {
        statusCode: 201,
        error: 'error message'
    },
    response: true
};

internals.ERROR = {
    data: {
        statusCode: 500,
        error: 'error message'
    },
    tags: ['error'],
    internal: true
};

var createMessage = function(message, id) {
    id = id || '123abc';
    message.request = id;
    message.timestamp = new Date().valueOf();

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
                var message = createMessage(internals.RECEIVED);
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

            context('with an empty response message', function() {
                it('does not add the message to the response\'s server logs', function(done){
                    throw('TODO');

                    done();
                });
            });

            context('with a subsequent message for a request', function(done) {

                beforeEach(function(done) {
                    var message = createMessage(internals.HANDLER);
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

                    it('adds a response tag to the server log message', function(done) {
                        throw('TODO');

                        done();
                    });
                });
            };

            testResponseMessageUpdates(internals.RESPONSE);
            testResponseMessageUpdates(internals.ERROR);

        });

        context('with a non "received" message for a request that doesn\'t exist', function(done) {

            beforeEach(function(done) {
                var message = createMessage(internals.HANDLER, 'abc123');
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

                messageParser.addMessage(createMessage(internals.RECEIVED));
                this.request = messageParser.requests[0];

                done();
            });

            it('sets a timeout response error message on the request', _.bind(function(done) {
                setTimeout( function() {
                    expect(this.request.data).to.equal(MessageParser.RESPONSE_TIMEOUT_ERROR_MESSAGE);

                    done();
                }, 10);
            }, this));

            it('marks the request as having a response timeout', _.bind(function(done) {
                expect(this.request.responseTimeout).to.not.be.true;

                setTimeout( function() {
                    expect(this.request.responseTimeout).to.be.true;

                    done();
                }, 10);
            }, this));

            it('calls the onResponseTimeout callback', _.bind(function(done) {
                this.messageParser.onResponseTimeout = Spy();

                setTimeout( function() {
                    expect(this.messageParser.onResponseTimeout.called).to.be.true;

                    done();
                }, 10);
            }, this));
        });

        describe('when a server log for a requests comes in before the response timeout', function() {

            it('resets the response timeout for that request', function(done) {
                var messageParser = MessageParser.create({responseTimeout: 3})

                messageParser.addMessage(createMessage(internals.RECEIVED));

                setTimeout( function() {
                    messageParser.addMessage(createMessage(internals.HANDLER));
                }, 2);

                setTimeout( function() {
                    var request = messageParser.requests[0];
                    expect(request.data).to.not.equal(MessageParser.RESPONSE_TIMEOUT_ERROR_MESSAGE);

                    done();
                }, 4);
            });
        })

        var clearResponseTimeoutTest = function(responseMessage) {
            describe('when a response for a request comes in after the response timeout has occured', function() {
                it('clears the response error timeout', function(done) {
                    var messageParser = MessageParser.create({responseTimeout: 1})

                    messageParser.addMessage(createMessage(internals.RECEIVED));

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

        clearResponseTimeoutTest(internals.RESPONSE);
        clearResponseTimeoutTest(internals.ERROR);

    });

});
