require('es5-shim');
require('./utils/searchCriteria');
require('./app.js');
require('./clientIdGenerator');
require('./clipboard');
require('./jQuerySnippet');
require('./messageParser');
require('./webSocketManager');

host = 'localhost';
port = 8000;

if (window.mochaPhantomJS) { 
  mochaPhantomJS.run(); 
}
else { 
  mocha.run(); 
}

