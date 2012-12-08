var Hapi = require("hapi")

var expect = require('chai').expect;
var jellyfish = require('jellyfish');


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

            var browser = jellyfish.createChrome();
            browser.go("http://localhost:8000/debug/console")
            .js("document.title", function(o) {
                assert.equal(o.result, "jelly")
            })
        });
    });
});