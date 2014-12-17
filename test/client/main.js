host = 'localhost';
port = 8000;

require('es5-shim');

// Test files

require('./utils/search/searchCriteria');
require('./utils/search/searchCriterion');

require('./utils/dateTimeFormatter');
require('./utils/handlebarsHelpers');

require('./models/request');
require('./models/settings');

require('./views/channelSelector');
require('./views/request');
require('./views/serverLogs');
require('./views/settings');
require('./views/app');

require('./app.js');
require('./clientIdGenerator');
require('./clipboard');
require('./messageParser');
require('./settingsStore');
require('./webSocketManager');

// Test setup

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
