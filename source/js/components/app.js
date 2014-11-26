var React = require('react');
var SettingsStore = require('../settingsStore');
var Feed = require('./feed');
var Intro = require('./intro');


var App = React.createClass({

  _store: SettingsStore,

  getInitialState: function() { 
    return { requests: [] }
  },

  intro: function() {
    if (!this._store.get('channel')) {
      return <Intro />
    }
  },

  render: function() {
    return (
      <div>
        <Feed requests={this.state.requests}/>
        {this.intro()}
      </div>
    );
  }

});

module.exports = App;
