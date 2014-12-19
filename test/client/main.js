host = 'localhost';
port = 8000;

require('es5-shim');

// Test files

require('./utils/search/searchCriteria');
require('./utils/search/searchCriterion');

require('./utils/clientIdGenerator');
require('./utils/dateTimeFormatter');
require('./utils/handlebarsHelpers');
require('./utils/jQuerySnippetGenerator');
require('./utils/requestToTextConverter');

require('./models/request');
require('./models/settings');

require('./views/app');
require('./views/channelSelector');
require('./views/feedBody');
require('./views/feedHeader');
require('./views/request');
require('./views/requestDetails');
require('./views/serverLogs');
require('./views/settings');
require('./views/toolbar');

require('./app.js');
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
