// var Backbone = require('backbone');
// var React = require('react');
// var AppComponent = require('./components/app');

// var TableComponent = React.createClass({
//   getInitialState: function() { requests: [] }

//   render: function() {
//     var createRequest = function(request) {
//       return (
//         <tr>
//           <td>{request.path}</td>
//           <td>{request.method}</td>
//           <td>{request.statusCode}</td>
//           <td>{request.data}</td>
//           <td>{request.timestamp}</td>
//         </tr>
//       );
//     };
    
//     return (
//       <table>
//         <thead>
//           <th>Path</th>
//           <th>Method</th>
//           <th>Status</th>
//           <th>Data</th>
//           <th>Timestamp</th>
//         </thead>
//         <tbody>
//           {this.props.requests.map(createRequest)}
//         </tbody>
//       </table>
//     );
//   }

// });





// var AppView = Backbone.View.extend({
  
//   el: 'body',

//   initialize: function(options) {
//     this.ws = ws;

//     var data = {
//       hostExample: host,
//       portExample: port
//     };
//   },

//   addRequest: function(request) {
    
//     this.tableComponent = React.renderComponent(
//       TableComponent(message),
//       this.el
//     );

//     return this;
//   }

// });

// module.exports = AppView;