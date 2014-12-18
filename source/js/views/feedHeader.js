// Load modules

var Backbone = require('backbone');


exports = module.exports = internals.FeedHeaderView = Backbone.View.extend({

    template: require('../templates/feedHeader.hbs'),

    events: {
        'click .expander': '_collapseAll',
        'click .favorite.enabled': '_applyFavoritesFilter',
        'click .favorite.active': '_removeFavoritesFilter'
    },

    render: function () {

        this.$el.html(this.template());

        return this;
    },

    clear: function () {

        this.disableCollapseAll();
        this.disableFavoritesFilter();
    },

    enableCollapseAll: function () {

        this.$('.expander').addClass('expanded');
    },

    disableCollapseAll: function () {

        this.$('.expander').removeClass('expanded');
    },

    enableFavoritesFilter: function () {

        this.$('.favorite').addClass('enabled');
    },

    disableFavoritesFilter: function () {

        this.$('.favorite')
            .removeClass('enabled')
            .removeClass('active')
            .addClass('empty');

        this.trigger('toggleFavorites', false);
    },

    _collapseAll: function () {

        this.$('.expander').removeClass('expanded');

        this.trigger('collapseAll');
    },

    _applyFavoritesFilter: function (e) {

        $(e.currentTarget)
            .removeClass('enabled')
            .addClass('active');

        this.trigger('toggleFavorites', true);
    },

    _removeFavoritesFilter: function (e) {

        $(e.currentTarget)
            .removeClass('active')
            .addClass('enabled');

        this.trigger('toggleFavorites', false);
    }

});
