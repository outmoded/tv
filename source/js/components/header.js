var React = require('react');

var Header = React.createClass({

    render: function() {
        return (
            <div className="header">
                <button className="clear" onClick={this.props.clearHandler}>clear</button>
            </div>
        );
    }

});

module.exports = Header;
