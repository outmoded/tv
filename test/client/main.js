require('es5-shim');

require('./clientIdGenerator');
require('./clipboard');
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
        require('./views/serverLogs');
        require('./views/settings');
        require('./views/app');
    });
});

host = 'localhost';
port = 8000;

chai.use(require('sinon-chai'));
chai.use(require('chai-jquery'));

var Backbone = require('backbone');
Backbone.$ = require('jquery');

require('../../source/js/utils/handlebarsHelpers');

if (window.mochaPhantomJS) {
  mochaPhantomJS.run();
}
else {
  mocha.run();
}
