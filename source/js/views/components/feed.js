var React = require('react');

var FeedComponent = React.createClass({

  render: function() {
    var createRequest = function(request) {
      return (
        <tr>
          <td>{request.path}</td>
          <td className="method">{request.method}</td>
          <td>{request.statusCode}</td>
          <td>{JSON.stringify(request.data)}</td>
          <td>{request.timestamp}</td>
        </tr>
      );
    };

    return (
      <table className="table table-striped">
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

module.exports = FeedComponent;