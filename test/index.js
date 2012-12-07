var Hapi = require("hapi")

var expect = require('chai').expect,
Browser = require('zombie'),
browser = new Browser();


var Hapi = require('hapi');

var options = {

	debug : {debugEndpoint : '/debug/console'}
}

// Create a server with a host and port
var server = new Hapi.Server('localhost', 8000, options);

// Define the route
var hello = {
    handler: function (request) {

        request.reply({ greeting: 'hello world' });
    }
};

// Add the route
server.addRoute({
    method: 'GET',
    path: '/hello',
    config: hello
});

// Start the server
server.start();
/*
browser.on("error", function(error) {

	console.error(error);
})*/

describe('Debug Console Page', function(){

	describe('Page Loads', function() {

		it('should load the page with the right title', function(done) {

			browser.visit("http://localhost:8000/debug/console", function (done2) {
            	
            	var text = browser.text("title");
            
            	//expect(1).to.equal(1);
            	assert.ok(browser.success);
            	assert.equal(browser.text("title"), "Debug Cos
            	nsole");
            	expect(browser.text("title")).to.equal("Debugs Console");
            	done2();
            	
            });
            done()
        });

        it('should not show a filter button on load', function(done) {

        	browser.visit("http://localhost:8000/debug/console", function() {

        		
        	})
        	done();
        })
    });
});