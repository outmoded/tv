Please view our [hapijs contributing guide](https://github.com/hapijs/hapi/blob/master/CONTRIBUTING.md).

There are various npm run tasks that support the development process.
The notable task is `npm run start-dev`. This will build the assets, 
run the tests, run the `examples/simple.js` hapi server, and watch for changes.

`npm install`
`npm run start-dev`

Navigate to [http://localhost:8000/debug/console](http://localhost:8000/debug/console) to see the TV debug console.

In a different browser window, navigate to [http://localhost:8000/](http://localhost:8000/) and
notice a 200 request rendered in TV.

Likewise, navigate to [http://localhost:8000/foo](http://localhost:8000/foo) and
notice a 404 request rendered in TV.
