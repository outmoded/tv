![tv Logo](https://raw.github.com/hapijs/tv/master/images/tv.png)

TV is an interactive debug console plugin for [**hapi**](https://github.com/hapijs/hapi)

[![Build Status](https://secure.travis-ci.org/hapijs/tv.png)](http://travis-ci.org/hapijs/tv)

Lead Maintainer: [Oscar A. Funes Martinez](https://github.com/osukaa)

TV is a simple web page in which developers can view server logs for their requests. Optionally, they can also filter the server logs to just their requests by attaching a unique client id to each request. The server will use WebSocket to stream the logs to the web application in real-time.

Here's what it looks like in action:

![TV interactive debug console](https://raw.github.com/hapijs/tv/master/images/tv-screenshot.png)

### Using TV in Your Application

To enable TV in a **hapi** application, install **tv** and register it.  Below is an example of registering the **tv** plugin:

```javascript
const Hapi = require('hapi');
const Tv = require('tv');

const server = new Hapi.Server();

server.register(Tv, (err) => {

    if (err) {
        throw err;
    }
    server.start();
});
```

In applications using multiple server instances, only one server can enable the debug interface using the default port.


### Options

Below are the options available to be passed into the **tv** plugin:

- `host` - the public hostname or IP address. Used only to set `server.info.host` and `server.info.uri`.
   Deaults to hostname and if not available to `localhost`(see hapi `new Server()`).
- `address` - the hostname of IP address the WebSocket connection will bind to. Defaults to `host` if present otherwise `0.0.0.0`(see hapi `new Server()`).
- `port` - the port used by the WebSocket connection. Defaults to _0_ and therefore an ephemeral port (see hapi `new Server()`).
- `endpoint` - the debug console request path added to the server routes. Defaults to _'/debug/console'_.
- `queryKey` - the name or the request query parameter used to mark requests being debugged. Defaults to _debug_.
- `template` - the name of the template to use for the debug console.  Defaults to _index_.
- `authenticateEndpoint` - set this to true to use auth schemes for TVs main- and file delivering routes (defaults to false)

Below is an example of registering the tv plugin with some options:

```javascript
const Hapi = require('hapi');
const Tv = require('tv');
const options = { endpoint: '/awesome' };

const server = new Hapi.Server();

server.register({ register: Tv, options: options }, function (err) {
    ...
});
```
