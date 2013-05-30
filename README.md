<a href="https://github.com/spumko"><img src="https://raw.github.com/spumko/spumko/master/images/from.png" align="right" /></a>
![tv Logo](https://raw.github.com/spumko/tv/master/images/tv.png)

Interactive debug console plugin for [**hapi**](https://github.com/spumko/hapi)

[![Build Status](https://secure.travis-ci.org/spumko/tv.png)](http://travis-ci.org/spumko/tv)

The debug console is a simple web page in which developers can subscribe to a debug id (or * for all), and then include that
debug id as an extra query parameter with each request. The server will use WebSocket to stream the subscribed request logs to
the web page in real-time. To enable the debug console in a **hapi** application, install **tv** and require it using either the _'composer'_ configuration or with the _'plugin'_ interface.  Below is an example of incuding **tv** using the _'plugin'_ interface:

```javascript
var Hapi = require('hapi');

var server = new Hapi.Server();
var options = {
  webSocketPort: 3000,
  debugEndpoint: '/debug/console',
  queryKey: 'debug'
};

server.pack.require('./tv', options, function (err) {
  
  if (!err) {
    server.start();
  }
});
```


### Debug

The debug console is a simple web page in which developers can subscribe to a debug id, and then include that debug id as an extra query parameter in each
request. The server will use WebSockets to stream the subscribed request logs to the web page in real-time. In applications using multiple server instances,
only one server can enable the debug interface using the default port. Below are the options available to be passed into the **tv** plugin:

- `websocketPort` - the port used by the WebSocket connection. Defaults to _3000_.
- `debugEndpoint` - the debug console request path added to the server routes. Defaults to _'/debug/console'_.
- `queryKey` - the name or the request query parameter used to mark requests being debugged. Defaults to _debug_.
