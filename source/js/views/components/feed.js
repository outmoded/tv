var React = require('react');
require('bootstrap/js/collapse');
var _ = require('lodash');

var FeedComponent = React.createClass({

  render: function() {
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
            this.props.requests.map(this._requestGroup)
          }
        </tbody>
      </table>
    );
  },

  _toggle: function(e) {
    var $requestRow = $(e.currentTarget);

    var $current = $requestRow.next();
    var serverLogRows = [];
    do {
      serverLogRows.push($current);
      $current = $current.next();
    } while($current.hasClass('server-log'))

    var hide = !serverLogRows[0].hasClass('hidden');

    if(hide) {
      $requestRow.removeClass('active');
      _.each(serverLogRows, function($row) { $row.addClass('hidden'); });
    } else {
      $requestRow.addClass('active');
      _.each(serverLogRows, function($row) { $row.removeClass('hidden'); });
    }
  },

  _requestGroup: function(request, index) {
    var stripe = index % 2 === 0 ? 'dark' : 'light';

    var requestRowMarkup = this._requestRow(request, stripe);
    var serverLogRowsMarkup = request.serverLogs.map(function(serverLog) {
      return this._serverLogRow(serverLog, stripe);
    }.bind(this));

    return _.flatten([requestRowMarkup, serverLogRowsMarkup], true);
  },

  _requestRow: function(request, stripe) {
    var statusCodeContent = request.statusCode ? request.statusCode : <div className="spinner"></div>;

    return (
      <tr className={"request " + stripe} onClick={this._toggle}>
        <td>{request.path}</td>
        <td className="method">{request.method}</td>
        <td>{statusCodeContent}</td>
        <td>{JSON.stringify(request.data)}</td>
        <td>{request.timestamp}</td>
      </tr>
    );
  },

  _serverLogRow: function(serverLog, stripe) {
    return (
      <tr className={"server-log hidden " + stripe}>
        <td colSpan="3">{serverLog.tags.join(', ')}</td>
        <td>{serverLog.data}</td>
        <td>{serverLog.timestamp}</td>
      </tr>
    );
  }

});

module.exports = FeedComponent;