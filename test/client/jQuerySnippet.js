// Load modules

//var Lab = require('lab');
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
      
        beforeEach(function(done) {
            jQuery.ajaxSetup = Spy();
            
            done();
        });

        it('evaluates to a valid function', function(done) {
            expect(internals.executeSnippet('foobar')).to.not.throw;

            done();
        });

        // eventually add tests calling jQuery directly, 
        // ensuring the url has the values as a query string

    });

});
