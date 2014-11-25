var React = require('react');

var Feed = require('./feed');

var App = React.createClass({

  getInitialState: function() { 
    return { requests: [] }
  },

  render: function() {
    return (
      <div>
        <Feed requests={this.state.requests}/>
      </div>
    );
  }

});

module.exports = App;
