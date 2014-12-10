// Load modules

var sinon = require('sinon');
var Backbone = require('backbone');
var RequestView = require('../../../source/js/views/request');
var Request = require('../../../source/js/models/request');

// Declare internals

var internals = {};


// Test shortcuts

var Spy = sinon.spy;




require('../../../source/js/utils/handlebarsHelpers');
Backbone.$ = require('jquery');



internals.generateView = function(options) {
    options = options || {};
    options.model = options.model || new Request({ serverLogs: new Backbone.Collection() });

    return new RequestView(options);
}





describe('RequestView', function() {

    describe('#template', function() {
      
        it('returns html', function() {
            var view = internals.generateView();

            expect(view.template()).to.match(/<[a-z][\s\S]*>/); // html elements
        });
    
    });

    describe('#events', function() {
      
        context('with a click on .request-details', function() {

            beforeEach(function() {
                this.view = internals.generateView();
                this.view.render();

                this.click = function() {
                    this.view.$('.request-details').click();
                }.bind(this);
            });

            afterEach(function() {
                delete this.view;
                delete this.click;
            });



            it('toggles the server logs pane', function() {
                expect(this.view.$el.hasClass('active')).to.be.false;
                
                this.click();

                expect(this.view.$el.hasClass('active')).to.be.true;
                expect(this.view.serverLogsView.$el.css('display')).to.equal('block');

                this.click();

                expect(this.view.$el.hasClass('active')).to.be.false;
                expect(this.view.serverLogsView.$el.css('display')).to.equal('none');
            });

            it('builds the server logs view once and only once', function() {
                expect(this.view.serverLogsView).to.be.undefined;
                
                this.click();

                var serverLogsView = this.view.serverLogsView;
                expect(this.view.serverLogsView).to.be.instanceOf(Backbone.View);

                this.click();

                expect(this.view.serverLogsView).to.equal(serverLogsView);
            });

            it('toggles .active', function() {
                expect(this.view.active).to.be.false;

                this.click();

                expect(this.view.active).to.be.true;

                this.click();

                expect(this.view.active).to.be.false;                
            });

            it('emits the "serverLogsToggle" event with "true" when shown', function() {
                var spy = Spy();
                this.view.on('serverLogsToggle', spy);

                this.click();

                expect(spy).to.have.been.calledWith(true);
            });

            it('emits the "serverLogsToggle" event with "false" when hidden', function() {
                var spy = Spy();
                this.view.on('serverLogsToggle', spy);

                this.click();

                expect(spy).to.have.been.calledWith(true);

                this.click();

                expect(spy).to.have.been.calledWith(false);
            });

        });

        context('with a click on .favorite', function() {

            beforeEach(function() {
                this.view = internals.generateView();
                this.view.render();

                this.click = function() {
                    this.view.$('.favorite').click();
                }.bind(this);
            });

            afterEach(function() {
                delete this.view;
                delete this.click;
            });



            it('toggles .favorited', function() {
                expect(this.view.favorited).to.be.false;

                this.click();

                expect(this.view.favorited).to.be.true;

                this.click();

                expect(this.view.favorited).to.be.false;                
            });

            it('toggles the .active class', function() {
                expect(this.view.$('.favorite').hasClass('active')).to.be.false;

                this.click();

                expect(this.view.$('.favorite').hasClass('active')).to.be.true;

                this.click();

                expect(this.view.$('.favorite').hasClass('active')).to.be.false;
            });

            it('emits the "favoriteToggle" event with "true" when favorited', function() {
                var spy = Spy();
                this.view.on('favoriteToggle', spy);

                this.click();

                expect(spy).to.have.been.calledWith(true);
            });

            it('emits the "favoriteToggle" event with "false" when unfavorited', function() {
                var spy = Spy();
                this.view.on('favoriteToggle', spy);

                this.click();

                expect(spy).to.have.been.calledWith(true);

                this.click();

                expect(spy).to.have.been.calledWith(false);
            });

        });
    
    });

    describe('#initialize', function() {
      
        context('with a change to the settings model clientId', function() {
          
            it('sets default boolean properties', function() {
                this.view = internals.generateView();
                
                expect(this.view.active).to.be.false;
                expect(this.view.favorited).to.be.false;
            });

        });
        
    });

    describe('#render', function() {
      
        it('has the expected markup', function() {
            this.view = internals.generateView();
            this.view.render();

            expect(this.view.$('.request-details')).to.have.length(1);
            expect(this.view.$('.server-logs')).to.have.length(1);
        });

    });

});