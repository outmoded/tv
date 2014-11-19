var React = require('react');
require('bootstrap/js/collapse');

var LogFeedComponent = React.createClass({

  render: function() {
    var createLog = function(log) {
      return (
        <tr>
          <td colSpan="3">{log.tags.join(', ')}</td>
          <td>data</td>
          <td>{log.timestamp}</td>
        </tr>
      );
    };

    return (
      <table className="table">
        <tbody>
          {this.props.logs.map(createLog)}
        </tbody>
      </table>
    );
  }

})

var FeedComponent = React.createClass({

  render: function() {
    // var createRequest = function(request, index) {
    //   return (
    //     <tr className="request {stripe}" data-request-id="{request.id}">
    //       <tr className="request">
    //         <td>{request.path}</td>
    //         <td className="method">{request.method}</td>
    //         <td>{statusCodeContent}</td>
    //         <td>{JSON.stringify(request.data)}</td>
    //         <td>{request.timestamp}</td>
    //       </tr>
    //       <tr className="request-details" data-request-id="{request.id}">
    //         <LogFeedComponent logs={this.props.serverLogs.filter(isLogForRequest)} />
    //       </tr>
    //       </table>
    //     </tr>
    //   );
    // }.bind(this);

    var requestRow = function(request, index) {
      var stripe = index % 2 === 0 ? 'even' : 'odd';
      var statusCodeContent = request.statusCode ? request.statusCode : <div className="spinner"></div>;

      return (
        <tr className="request" data-toggle="collapse" data-parent="#requests" href={'#request-details-' + request.id}>
          <td>{request.path}</td>
          <td className="method">{request.method}</td>
          <td>{statusCodeContent}</td>
          <td>{JSON.stringify(request.data)}</td>
          <td>{request.timestamp}</td>
        </tr>
      );
    }.bind(this);

    var requestDetails = function(request) {
      var isLogForRequest = function(log) {
        return log.requestId === request.id
      };

      return (
        <tr id={'request-details-' + request.id} className="request-details panel-collapse collapse" data-request-id="{request.id}">
          <td colSpan="5">
            <LogFeedComponent logs={this.props.serverLogs.filter(isLogForRequest)} />
          </td>
        </tr>
      );
    }.bind(this);

    var requestMarkup = function(request) {
      return [requestRow(request), requestDetails(request)];
    };
    
    return (
      <table className="table table-striped" id="requests">
        <thead>
          <th>Path</th>
          <th>Method</th>
          <th>Status</th>
          <th>Data</th>
          <th>Timestamp</th>
        </thead>
        <tbody>
          {this.props.requests.map(requestMarkup)}
        </tbody>
      </table>
    );
  }

});

module.exports = FeedComponent;