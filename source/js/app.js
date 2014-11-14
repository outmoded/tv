var Backbone = require('backbone');
var AppView = require('./views/app');
var $ = require('jquery');

// Bootstrap jQuery onto Backbone
Backbone.$ = $;

$(document).ready(function(){
  var appView = new AppView();
});