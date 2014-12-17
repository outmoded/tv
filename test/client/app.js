// Load modules

var Backbone = require('backbone');
Backbone.$ = require('jquery');

var sinon = require('sinon');

var app = require('../../source/js/app');
var WebSocketManager = require('../../source/js/webSocketManager');
var MessageParser = require('../../source/js/messageParser');


// Declare internals

var internals = {};


describe('app', function() {

    describe('#start', function() {

        beforeEach(function(){
            var self = this;

            this.fakeAppModel = new Backbone.Model();
            var fakeAppView = new Backbone.View({ model: this.fakeAppModel });
            fakeAppView.settingsView = new Backbone.View();
            this.mockAppViewClass = function() { return fakeAppView; };

            this.mockWebSocketManager = {
                onMessage: function() {},
                applyFilter: function() {}
            };

            var mockWebSocketManagerClass = {
                create: function() {
                    return self.mockWebSocketManager;
                }
            };

            this.mockMessageParser = { addMessage : function() {} };
            this.mockClientIdGenerator = { generate: function(){} };
            this.mockSettingsStore = { exists: function(){}, get: function() {} };

            this.settingsRenderSpy = sinon.spy(fakeAppView.settingsView, 'render');
            this.settingsShowSpy = sinon.spy();
            fakeAppView.settingsView.show = this.settingsShowSpy;
            this.appRenderSpy = sinon.spy(fakeAppView, 'render');

            this.appStart = function() {
                app.start('localhost', 8000, {
                    messageParser: this.mockMessageParser,
                    appViewClass: this.mockAppViewClass,
                    settingsStore: this.mockSettingsStore,
                    clientIdGenerator: this.mockClientIdGenerator,
                    webSocketManagerClass: mockWebSocketManagerClass
                });
            };

        });

        it('renders the app view', function() {
            this.appStart();

            expect(this.appRenderSpy).to.have.been.calledOnce;
        });

        context('without an existing clientId', function() {

            beforeEach(function() {
                sinon.stub(this.mockSettingsStore, 'exists').withArgs('clientId').returns(false);
            });

            it('sets the app\'s client id to a random generated client id', function() {
                sinon.stub(this.mockClientIdGenerator, 'generate').returns('random client id');

                this.appStart();

                expect(this.fakeAppModel.get('clientId')).to.eq('random client id');
            });

            it('renders the settings view', function(){
                this.appStart();

                expect(this.settingsRenderSpy).to.have.been.calledOnce;
            });
        });

        describe('when visiting the app for the first time', function() {

            beforeEach(function() {
                sinon.stub(this.mockSettingsStore, 'exists').withArgs('channel').returns(false);

                this.appStart();
            });

            it('defaults the channel to "all"', function() {
                expect(this.fakeAppModel.get('channel')).to.eq('*');
            });

            it('shows the settings view', function() {
                expect(this.settingsShowSpy).to.have.been.calledOnce;
            });

        });

        describe('when the socket is openned', function() {

            it('sets the channel as the web socket\'s filter', function() {
                var applyFilterSpy = sinon.spy(this.mockWebSocketManager, 'applyFilter');
                sinon.stub(this.mockSettingsStore, 'get').withArgs('channel').returns('foo');

                this.appStart();
                this.mockWebSocketManager.onSocketOpen();

                expect(applyFilterSpy).to.have.been.calledWith('foo');
            });

        });

        describe('when a message is received', function(){

            it('adds the message to the message parser', function() {
                var onMessageSpy = sinon.spy(this.mockWebSocketManager, 'onMessage');
                var addMessageSpy = sinon.spy(this.mockMessageParser, 'addMessage');

                this.appStart();
                expect(onMessageSpy.callCount).to.eq(1);
                var onMessageHandler = onMessageSpy.getCall(0).args[0];

                onMessageHandler('foo');

                expect(addMessageSpy).to.have.been.calledWith('foo');
            });

        });

    });

});
