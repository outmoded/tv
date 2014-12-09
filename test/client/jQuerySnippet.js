// Load modules

var Sinon = require('sinon');

var JQuerySnippet = require('../../source/js/jquerySnippet');


// Declare internals

var internals = {};


// Test Shortcuts

var Spy = Sinon.spy;


internals.executeSnippet = function(clientId) {
    eval(JQuerySnippet.generate(clientId));
};



describe('JQuerySnippet', function() {

    describe('#generate', function() {

        it('evaluates to a valid function', function(done) {
            expect(internals.executeSnippet('foobar')).to.not.throw;

            done();
        });

    });

    // describe('code snippet', function() {

    //     beforeEach(function(done) {
    //         internals.executeSnippet('foobar');

    //         done();
    //     });
    
    //     it('appends the query string to all ajax calls', function(done) {

    //     });

    // });

});
