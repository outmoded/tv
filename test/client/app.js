'use strict';
// Load modules

const Backbone = require('backbone');
const Sinon = require('sinon');

const App = require('../../source/js/app');
const WebSocketManager = require('../../source/js/webSocketManager');
const MessageParser = require('../../source/js/messageParser');


// Declare internals

const internals = {};


describe('App', function () {

    describe('#start', function () {

        beforeEach(function () {

            this.fakeAppModel = new Backbone.Model();
            const fakeAppView = new Backbone.View({ model: this.fakeAppModel });
            fakeAppView.settingsView = new Backbone.View();
            this.mockAppViewClass = function () {

                return fakeAppView;
            };

            this.mockWebSocketManager = {
                onMessage: function () { },
                applyFilter: function () { }
            };

            const mockWebSocketManagerClass = {
                create: () => {

                    return this.mockWebSocketManager;
                }
            };
            this.mockMessageParser = { addMessage: function () { } };
            this.mockSettingsStore = { exists: function (){ }, get: function () { } };

            this.settingsRenderSpy = Sinon.spy(fakeAppView.settingsView, 'render');
            this.settingsShowSpy = Sinon.spy();
            fakeAppView.settingsView.show = this.settingsShowSpy;
            this.appRenderSpy = Sinon.spy(fakeAppView, 'render');

            this.appStart = function () {

                App.start('localhost', 8000, {
                    messageParser: this.mockMessageParser,
                    appViewClass: this.mockAppViewClass,
                    settingsStore: this.mockSettingsStore,
                    webSocketManagerClass: mockWebSocketManagerClass
                });
            };

        });

        it('renders the App view', function () {

            this.appStart();

            expect(this.appRenderSpy).to.have.been.calledOnce;
        });

        describe('when the socket is openned', function () {

            it('sets the channel as the web socket\'s filter', function () {

                const applyFilterSpy = Sinon.spy(this.mockWebSocketManager, 'applyFilter');
                Sinon.stub(this.mockSettingsStore, 'get').withArgs('channel').returns('foo');

                this.appStart();
                this.mockWebSocketManager.onSocketOpen();

                expect(applyFilterSpy).to.have.been.calledWith('foo');
            });

        });

        describe('when a message is received', function (){

            it('adds the message to the message parser', function () {

                const onMessageSpy = Sinon.spy(this.mockWebSocketManager, 'onMessage');
                const addMessageSpy = Sinon.spy(this.mockMessageParser, 'addMessage');

                this.appStart();
                expect(onMessageSpy.callCount).to.eq(1);
                const onMessageHandler = onMessageSpy.getCall(0).args[0];

                onMessageHandler('foo');

                expect(addMessageSpy).to.have.been.calledWith('foo');
            });

        });

    });

});
