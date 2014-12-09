require('es5-shim');

require('./utils/searchCriteria');
require('./app.js');
require('./clientIdGenerator');
require('./clipboard');
require('./jQuerySnippet');
//require('./messageParser');
// require('./webSocketManager');
require('./settingsStore');

host = 'localhost';
port = 8000;

var sinonChai = require("sinon-chai");
chai.use(sinonChai);

if (window.mochaPhantomJS) { 
  mochaPhantomJS.run(); 
}
else { 
  mocha.run(); 
}
