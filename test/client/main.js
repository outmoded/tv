require('es5-shim');

require('./clientIdGenerator');
require('./clipboard');
require('./jQuerySnippet');
require('./messageParser');
require('./webSocketManager');
require('./settingsStore');
require('./app.js');
        
// describe blocks for test organization

describe('Utilities', function() {
    require('./utils/dateTimeFormatter');
    require('./utils/handlebarsHelpers');
    require('./utils/searchCriteria');    
});

describe('Backbone', function() {
    describe('Models', function() {
        require('./models/request');
        require('./models/settings');
    });
    describe('Views', function() {
        require('./views/channelSelector');
        require('./views/request');
    });
});

host = 'localhost';
port = 8000;

var sinonChai = require('sinon-chai');
chai.use(sinonChai);

if (window.mochaPhantomJS) {
  mochaPhantomJS.run();
} else {
  mocha.run();
}
