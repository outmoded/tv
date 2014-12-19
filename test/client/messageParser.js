// Load modules

var _ = require('lodash');
var sinon = require('sinon');
var Backbone = require('backbone');

var MessageParser = require('../../source/js/messageParser');


// Declare internals

var internals = {};


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
    response: true,
    internal: true
};

internals.EMPTY_RESPONSE = {
    data: null,
    tags: ['response']
};

internals.createMessage = function (message, id) {

    id = id || '123abc';
    message.request = id;
    message.timestamp = new Date().valueOf();

    return { data: JSON.stringify(message) };
};


describe('MessageParser', function () {

    beforeEach(function () {

        this.messageParser = MessageParser.create();
    });

    describe('#create', function () {

        it('creates a new instance of a MessageParser', function () {

            expect(this.messageParser).to.be.instanceOf(MessageParser);
        });

    });

    describe('#addMessage', function () {

        context('with an initial message for a request', function () {

            beforeEach(function () {

                var message = internals.createMessage(internals.RECEIVED);
                this.messageData = JSON.parse(message.data);

                this.messageParser.addMessage(message);
            });

            it('creates a new request', function () {

                expect(this.messageParser.requests).to.have.length(1);

                var request = this.messageParser.requests.toJSON()[0];
                expect(request).to.have.property('id', this.messageData.request);
                expect(request).to.have.property('path', this.messageData.data.url);
                expect(request).to.have.property('method', this.messageData.data.method);
                expect(request).to.have.property('timestamp', this.messageData.timestamp);
            });

            it('creates a new server log', function () {

                var request = this.messageParser.requests.models[0];
                expect(request.get('serverLogs').toJSON()).to.have.length(1);
            });

            context('with an empty response message', function () {

                it('does not add the message to the response\'s server logs', function (){

                    var message = internals.createMessage(internals.EMPTY_RESPONSE);
                    this.messageData = JSON.parse(message.data);

                    this.messageParser.addMessage(message);

                    expect(this.messageParser.requests.first().get('serverLogs').last().toJSON().tags).to.not.include('response');
                });
            });

            context('with a subsequent message for a request', function () {

                beforeEach(function () {

                    var message = internals.createMessage(internals.HANDLER);
                    this.secondMessageData = JSON.parse(message.data);

                    this.messageParser.addMessage(message);
                });

                it('doesn\'t create a request', function () {

                    expect(this.messageParser.requests).to.have.length(1);
                });

                it('creates a new server log', function () {

                    var request = this.messageParser.requests.models[0];
                    expect(request.get('serverLogs').toJSON()).to.have.length(2);

                    var serverLog = request.get('serverLogs').toJSON()[1];
                    expect(serverLog.tags).to.have.length(2);
                });

            });

            var testResponseMessageUpdates = function (responseMessage) {

                context('with a response message for a request', function () {

                    beforeEach(function () {

                        var message = internals.createMessage(responseMessage);
                        this.messageData = JSON.parse(message.data);

                        this.messageParser.addMessage(message);

                        this.request = this.messageParser.requests.findWhere({id: this.messageData.request});
                    });

                    it('updates the request object with the status code', function () {

                        expect(this.request.get('statusCode')).to.equal(this.messageData.data.statusCode);
                    });

                    it('adds a response tag to the server log message', function () {

                        var serverLog = this.request.get('serverLogs').last().toJSON();

                        expect(serverLog.tags).to.include('response');
                    });
                });
            };

            testResponseMessageUpdates(internals.RESPONSE);
            testResponseMessageUpdates(internals.ERROR);

        });

        context('with a non "received" message for a request that doesn\'t exist', function () {

            beforeEach(function () {

                var message = internals.createMessage(internals.HANDLER, 'abc123');
                this.messageData = JSON.parse(message.data);

                this.messageParser.addMessage(message);
            });

            it('does not create a request', function () {

                expect(this.messageParser.requests).to.have.length(0);
            });

        });

        describe('when a response doesn\'t come in within a set timeout', function () {

            beforeEach(function () {

                this.messageParser = MessageParser.create({responseTimeout: 5});

                this.messageParser.addMessage(internals.createMessage(internals.RECEIVED));
                this.request = this.messageParser.requests.models[0];
            });

            it('marks the request as having a response timeout', function (done) {

                expect(this.request.get('responseTimeout')).to.not.be.true;

                setTimeout(function () {

                    expect(this.request.get('responseTimeout')).to.be.true;

                    done();
                }.bind(this), 10);
            });

            it('calls the onResponseTimeout callback', function (done) {

                this.messageParser.onResponseTimeout = sinon.spy();

                setTimeout(function () {

                    expect(this.messageParser.onResponseTimeout.called).to.be.true;

                    done();
                }.bind(this), 10);
            });

            it('overrides the timeout if a subsequent received message comes in after the timeout', function (done) {

                expect(this.request.get('responseTimeout')).to.not.be.true;

                setTimeout(function () {

                    expect(this.request.get('responseTimeout')).to.be.true;

                    this.messageParser.addMessage(internals.createMessage(internals.RECEIVED));
                    expect(this.request.get('responseTimeout')).to.be.false;

                    done();
                }.bind(this), 10);
            });
        });

        describe('when a server log for a requests comes in before the response timeout', function () {

            it('resets the response timeout for that request', function (done) {

                var messageParser = MessageParser.create({responseTimeout: 3});

                messageParser.addMessage(internals.createMessage(internals.RECEIVED));

                setTimeout(function () {

                    messageParser.addMessage(internals.createMessage(internals.HANDLER));
                }, 2);

                setTimeout(function () {

                    var request = messageParser.requests.first();
                    expect(request.get('isComplete')).to.not.equal.true;

                    done();
                }, 4);
            });
        });

        var clearResponseTimeoutTest = function (responseMessage) {

            describe('when a response for a request comes in after the response timeout has occured', function () {

                it('clears the response error timeout', function (done) {

                    var messageParser = MessageParser.create({responseTimeout: 1});

                    messageParser.addMessage(internals.createMessage(internals.RECEIVED));

                    var request = messageParser.requests.first();

                    setTimeout(function () {

                        expect(request.get('responseTimeout')).to.be.true;

                        messageParser.addMessage(internals.createMessage(responseMessage));
                    }, 3);

                    setTimeout(function () {

                        expect(request.get('responseTimeout')).to.be.false;

                        done();
                    }, 6);

                });
            });
        };

        clearResponseTimeoutTest(internals.RESPONSE);
        clearResponseTimeoutTest(internals.ERROR);

    });

});
