var React = require('react');
require('bootstrap/js/collapse');
var _ = require('lodash');

var FeedComponent = React.createClass({

  toggle: function(e) {
    var $requestRow = $(e.currentTarget);

    var $current = $requestRow.next();
    var serverLogRows = [];
    do {
      serverLogRows.push($current);
      $current = $current.next();
    } while($current.hasClass('server-log'))

    var hide = !serverLogRows[0].hasClass('hidden');

    if(hide) {
      _.each(serverLogRows, function($row){ $row.addClass('hidden'); });
    } else {
      _.each(serverLogRows, function($row){ $row.removeClass('hidden'); });
    }
  },

  render: function() {
    var requestRow = function(request, stripe) {
      var statusCodeContent = request.statusCode ? request.statusCode : <div className="spinner"></div>;

      return (
        <tr className={"request " + stripe} onClick={this.toggle}>
          <td>{request.path}</td>
          <td className="method">{request.method}</td>
          <td>{statusCodeContent}</td>
          <td>{JSON.stringify(request.data)}</td>
          <td>{request.timestamp}</td>
        </tr>
      );
    }.bind(this);

    var serverLogRow = function(serverLog, stripe) {
      return (
        <tr className={"server-log hidden " + stripe}>
          <td colSpan="3">{serverLog.tags.join(', ')}</td>
          <td>{serverLog.data}</td>
          <td>{serverLog.timestamp}</td>
        </tr>
      );
    }.bind(this);

    return (
      <table className="table">
        <thead>
          <th>Path</th>
          <th>Method</th>
          <th>Status</th>
          <th>Data</th>
          <th>Timestamp</th>
        </thead>
        <tbody>
          {
            this.props.requests.map(function(request, index) {
              var stripe = index % 2 === 0 ? 'dark' : 'light';

              var requestRowMarkup = requestRow(request, stripe);
              var serverLogRowsMarkup = request.serverLogs.map(function(serverLog) {
                return serverLogRow(serverLog, stripe);
              });

              return _.flatten([requestRowMarkup, serverLogRowsMarkup], true);
            })
          }
        </tbody>
      </table>
    );
  }

});

module.exports = FeedComponent;
