// Load modules

//var Lab = require('lab');
var JQuerySnippet = require('../../source/js/jquerySnippet');
var Sinon = require('sinon');

// Declare internals

var internals = {};


// Test shortcuts

//var lab = exports.lab = Lab.script();
//var describe = lab.describe;
//var beforeEach = lab.beforeEach;
//var afterEach = lab.afterEach;
//var context = lab.describe;
//var it = lab.it;
//var expect = Lab.expect;
var jQuery = {};
var spy = Sinon.spy;


var executeSnippet = function(clientId) {
    eval(JQuerySnippet.generate(clientId));
};

describe('JQuerySnippet', function() {
  
    describe('#generate', function() {
      
        beforeEach(function(done) {
            jQuery.ajaxSetup = spy();
            
            done();
        });

        it('evaluates to a valid function', function(done) {
            expect(executeSnippet('foobar')).to.not.throw;

            done();
        });

        // eventually add tests calling jQuery directly, 
        // ensuring the url has the values as a query string

    });

});
