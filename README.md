<a href="https://github.com/spumko"><img src="https://raw.github.com/spumko/spumko/master/images/from.png" align="right" /></a>
![tv Logo](https://raw.github.com/spumko/tv/master/images/tv.png)

Interactive debug console for [**hapi**](https://github.com/spumko/hapi)

[![Build Status](https://secure.travis-ci.org/spumko/tv.png)](http://travis-ci.org/spumko/tv)

The debug console is a simple web page in which developers can subscribe to a debug id (or * for all), and then include that
debug id as an extra query parameter with each request. The server will use WebSocket to stream the subscribed request logs to
the web page in real-time. To enable the debug console in a **hapi** application, set the server's `debug` option to true or
to an object with custom configuration as described in the **hapi** documentation.



### Debug

To assist in debugging server events related to specific incoming requests, **hapi** includes an optional debug console which is turned _off_ by default.
The debug console is a simple web page in which developers can subscribe to a debug id, and then include that debug id as an extra query parameter in each
request. The server will use WebSocket to stream the subscribed request logs to the web page in real-time. In application using multiple server instances,
only one can enable the debug interface using the default port. To enable the debug console set the `debug` option to _true_ or to an object with custom
configuration:
- `websocketPort` - the port used by the WebSocket connection. Defaults to _3000_.
- `debugEndpoint` - the debug console request path added to the server routes. Defaults to _'/debug/console'_.
- `queryKey` - the name or the request query parameter used to mark requests being debugged. Defaults to _debug_.
