var React = require('react');
var MessageParser = require('./messageParser');

var messageParser = MessageParser.create();
var clientId = '*';
var ws = new WebSocket('ws://' + host + ':' + port);
ws.onopen = function() {
  ws.send(clientId);
  ws.onmessage = function(message) {
    console.log('message', JSON.parse(message.data));
    messageParser.addMessage(message);
    appComponent.setState({requests: messageParser.requests});
  }
}

var FeedComponent = React.createClass({

  render: function() {
    var createRequest = function(request) {
      return (
        <tr>
          <td>{request.path}</td>
          <td>{request.method}</td>
          <td>{request.statusCode}</td>
          <td>{JSON.stringify(request.data)}</td>
          <td>{request.timestamp}</td>
        </tr>
      );
    };

    return (
      <table>
        <thead>
          <th>Path</th>
          <th>Method</th>
          <th>Status</th>
          <th>Data</th>
          <th>Timestamp</th>
        </thead>
        <tbody>
          {this.props.requests.map(createRequest)}
        </tbody>
      </table>
    );
  }

});

var AppComponent = React.createClass({

  getInitialState: function() { return { requests: [] }; },

  render: function() {
    return (
      <div>
        <FeedComponent requests={this.state.requests}/>
      </div>
    );
  }

});

var appComponent = React.render(
  AppComponent(),
  $('body').get(0)
);