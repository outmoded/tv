require('es5-shim');

require('./utils/searchCriteria');
// require('./app.js');
require('./clientIdGenerator');
require('./clipboard');
require('./jQuerySnippet');
require('./messageParser');
// require('./webSocketManager');
require('./settingsStore');

host = 'localhost';
port = 8000;

if (window.mochaPhantomJS) { 
  mochaPhantomJS.run(); 
}
else { 
  mocha.run(); 
}