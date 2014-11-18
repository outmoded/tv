// Load modules

var Hapi = require('hapi');
var Lab = require('lab');
var Ws = require('ws');
var Tv = require('../');
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


describe('MessageParser', function() {
    beforeEach(function(done) {
        this.messageParser = MessageParser.create();

        done();
    });

    afterEach(function(done) {
        delete this.messageData;
        delete this.secondMessageData;
        delete this.messageParser;

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

    it('has a serverLogs array', function(done) {
        expect(this.messageParser.serverLogs).to.be.instanceOf(Array).and.have.length(0);
        done();
    });

    describe('#addMessage', function() {
    
        context('with an initial message for a request', function() {
          
            beforeEach(function(done) {
                this.messageData = {
                    data: {
                        id: '123abc',
                        method: 'get',
                        url: '/'
                    },
                    tags: ['hapi', 'received'],
                    timestamp: new Date().valueOf()
                };
                var message = { data: JSON.stringify(this.messageData) }

                this.messageParser.addMessage(message);
                
                done();
            });

            it('creates a new request', function(done) {
                expect(this.messageParser.requests).to.have.length(1);
                expect([this.messageParser.requests[0]]).to.deep.include.members([{
                    id: this.messageData.data.id,
                    path: this.messageData.data.url,
                    method: this.messageData.data.method,
                    timestamp: this.messageData.timestamp
                }]);

                done();
            });

            it('creates a new server log', function(done) {
                expect(this.messageParser.serverLogs).to.have.length(1);
                expect([this.messageParser.serverLogs[0]]).to.deep.include.members([{
                    tags: this.messageData.tags, 
                    data: this.messageData.data,
                    timestamp: this.messageData.timestamp
                }]);

                done();
            });

            context('with a subsequent message for a request', function(done) {

                beforeEach(function(done) {
                    this.secondMessageData = {
                        data: {
                            msec: 0.1
                        },
                        request: '123abc',
                        tags: ['hapi', 'handler'],
                        timestamp: new Date().valueOf()
                    };
                    var message = { data: JSON.stringify(this.secondMessageData) }

                    this.messageParser.addMessage(message);

                    done();
                });

                it('creates a server log for the message', function(done) {
                    expect(messageParser.serverLogs).to.have.length(2);

                    var serverLog = this.messageParser.serverLogs[1]
                    expect(serverLog.tags).to.have.length(2)
                    expect(serverLog.tags).to.include(this.secondMessageData.tags[0])
                    expect(serverLog.tags).to.include(this.secondMessageData.tags[1])
                    expect(serverLog.data).to.have.property('msec', this.secondMessageData.data.msec)
                    expect(serverLog).to.have.property('timestamp', this.secondMessageData.timestamp)

                    done();
                });

                it('doesn\'t create a request', function(done) {
                    expect(messageParser.requests).to.have.length(1);

                    done();
                });

            });
        
        });

        context('with a non \'received\' message for a request that doesn\'t exist', function(done) {
            
            beforeEach(function(done) {
                this.messageData = {
                    request: 'abc123',
                    tags: ['hapi', 'handler']
                };
                var message = { data: JSON.stringify(this.messageData) }
                this.messageParser.addMessage(message);

                done();
            });

            it('does not add a server log', function(done) {
                expect(this.messageParser.serverLogs).to.have.length(0);

                done();
            });

            it('does not add a request', function(done) {
                expect(this.messageParser.requests).to.have.length(0);

                done();
            });

        });

  
    });

});