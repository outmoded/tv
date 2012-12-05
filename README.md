# helmet

Interactive debug console for [**hapi**](https://github.com/walmartlabs/hapi)

The debug console is a simple web page in which developers can subscribe to a debug id (or * for all), and then include that
debug id as an extra query parameter with each request. The server will use WebSocket to stream the subscribed request logs to
the web page in real-time. To enable the debug console in a **hapi** application, set the server's `debug` option to true or
to an object with custom configuration as described in the **hapi** documentation.

