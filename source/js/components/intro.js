var React = require('react');
var SettingsStore = require('../settingsStore');
var ChannelSelector = require('./channelSelector');
var JQuerySnippet = require('../jQuerySnippet');



var Intro = exports = module.exports = React.createClass({

    render: function() {
        return (
            <div className="intro well">
                <textarea className="json-markup expanded">{JQuerySnippet(this.props.channel)}</textarea>
                
                <p>Would you like to subscribe to all server requests or just yours?</p>
                <ChannelSelector />

                <button className="btn btn-default" name="save">Save</button>
            </div>
        );
    }

});