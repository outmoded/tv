var React = require('react');

var FeedComponent = require('./feed');

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

module.exports = AppComponent;
