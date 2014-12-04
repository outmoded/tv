var Backbone = require('backbone');
var _ = require('lodash');

var ToolbarView = require('./toolbar');
var FeedView = require('./feed');
var RequestView = require('./request');
var SettingsView = require('./settings');
var SearchQuery = require('../utils/searchQuery');
var Settings = require('../models/settings');

var AppView = Backbone.View.extend({

    template: require('../templates/app.hbs'),

    initialize: function(opts) {
        this.model = new Settings({webSocketManager: opts.webSocketManager});

        this.webSocketManager = opts.webSocketManager;

        this.requestViews = [];

        this.listenTo(this.collection, 'add', this._addRequest);
    },

    events: {
        'keyup .search': '_filterRequests',
        'click .clear': '_clearRequests',
        'click .pause-resume': '_pauseResumeRequests',
    },

    render: function() {
        var $markup = $(this.template());

        this.toolbarView = new ToolbarView({ el: $markup.siblings('.toolbar'), model: this.model, appView: this }).render();
        this.feedView = new FeedView({ el: $markup.siblings('.feed'), model: this.model }).render();
        this.settingsView = new SettingsView({ el: $markup.siblings('.settings-modal-container'), settingsModel: this.model }).render();

        this.$el.html($markup);

        return this;
    },

    _addRequest: function(request) {
        this._checkToScrollToBottom( function() {
            var requestView = new RequestView({ model: request }).render();
            this.requestViews.push(requestView);

            this._updateRequestVisibility(requestView);

            this.listenTo(request, 'change:statusCode', function() {
                this._updateRequestVisibility(requestView);
            });

            this.$('.feed .body').append(requestView.el);
        }.bind(this) );
    },

    _updateRequestVisibility: function(requestView) {
        if(this.searchFilter) {
            requestView.$el.toggle(this.searchFilter(requestView));
        }
    },

    _checkToScrollToBottom: function(fn) {
        var isScrolledToBottom = this._isScrolledToBottom();

        fn();

        if(isScrolledToBottom) {
            this._scrollToBottom();
        }
    },

    _clearRequests: function() {
        this.$('.feed .body').html('');

        _.each(this.requestViews, function(requestView) {
            requestView.remove();
        });

        this.requestViews = [];
    },

    _pauseResumeRequests: function(e) {
        var paused = $(e.currentTarget).find('.resume:visible').length === 1;

        if(paused) {
            this._resumeRequests();
        } else {
            this._pauseRequests();
        }
    },

    _pauseRequests: function() {
        this.webSocketManager.pause();
        this.$el.find('.pause').addClass('hidden');
        this.$el.find('.resume').removeClass('hidden');
    },

    _resumeRequests: function() {
        this.webSocketManager.resume();
        this.$el.find('.pause').removeClass('hidden');
        this.$el.find('.resume').addClass('hidden');
    },

    _filterRequests: _.debounce(function(e) {
        var query = SearchQuery.toObject($('input.search').val());
        
        if(query) {
            this._setSearchFilter(query);
        } else {
            this._clearSearchFilter();
        }
    }, 200),

    _setSearchFilter: function(query) {
        this.searchFilter = function(requestView) {
            return _.every(query, function(values, property) {
                return this._hasMatch(requestView.model, property, values);
            }.bind(this));
        };

        _.each(this.requestViews, function(requestView) {
            requestView.$el.toggle(this.searchFilter(requestView));
        }.bind(this));
    },

    _hasMatch: function(request, property, values) {
        var modelValue;
        
        if (property === 'tags') {
            modelValue = _.uniq(_.flatten(request.get('serverLogs').pluck('tags'))); // unique list of all tags across all server logs
        } else {
            modelValue = [request.get(property)];
        }

        var modelValues = _.flatten(modelValue);
        
        return modelValues.length >= 1 && _.difference(values, modelValues).length === 0;
    },

    _clearSearchFilter: function() {
        this.searchFilter = null;

        _.each(this.requestViews, function(requestView) {
            requestView.$el.toggle(true);
        });
    },

    _isScrolledToBottom: function() {
        return ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
    },

    _scrollToBottom: function() {
        window.scrollTo(0,document.body.scrollHeight);
    }

});

module.exports = AppView;
