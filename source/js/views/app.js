var Backbone = require('backbone');
var React = require('react');
var AppComponent = require('./components/app');

var AppView = Backbone.View.extend({
  
  el: 'body',

  initialize: function(options) {
    var data = {
      hostExample: host,
      portExample: port
    };

    // this.appComponent = React.renderComponent(
    //   AppComponent(data),
    //   this.el
    // );
  }

});

module.exports = AppView;