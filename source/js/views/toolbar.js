// Load modules

var Backbone = require('backbone');
var _ = require('lodash');

var ChannelSelectorView = require('./channelSelector');


// Declare internals

var internals = {};


exports = module.exports = internals.ToolbarView = Backbone.View.extend({

    template: require('../templates/toolbar.hbs'),

    events: {
        'keyup .search': '_triggerSearchChanged',
        'click .settings': '_triggerShowSettings',
        'click .clear': '_triggerClearFeed',
        'click .pause-resume': '_pauseResumeRequests'
    },

    render: function () {

        this.$el.html(this.template());

        new ChannelSelectorView({ el: this.$('.channel-selector-container'), model: this.model }).render();

        return this;
    },

    _pauseResumeRequests: function (e) {

        var paused = $(e.currentTarget).find('.resume:visible').length === 1;

        if (paused) {
            this._resumeRequests();
        }
        else {
            this._pauseRequests();
        }
    },

    _pauseRequests: function () {

        this.$el.find('.pause').addClass('hidden');
        this.$el.find('.resume').removeClass('hidden');
        this.trigger('pause');
    },

    _resumeRequests: function () {

        this.$el.find('.pause').removeClass('hidden');
        this.$el.find('.resume').addClass('hidden');
        this.trigger('resume');
    },

    _triggerSearchChanged: _.debounce(function (e) {

        var queryString = $(e.currentTarget).val();
        this.trigger('searchChanged', queryString);
    }, 200),

    _triggerShowSettings: function () {

        this.trigger('showSettings');
    },

    _triggerClearFeed: function () {

        this.trigger('clearFeed');
    }

});
