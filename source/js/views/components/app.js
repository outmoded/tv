var React = require('react');

var FeedComponent = require('./feed');

var AppComponent = React.createClass({

  getInitialState: function() { 
    return {
      requests: [], 
      serverLogs: [] 
    }
  },

  render: function() {
    return (
      <div>
        <FeedComponent requests={this.state.requests} serverLogs={this.state.serverLogs}/>
      </div>
    );
  }

});

module.exports = AppComponent;
