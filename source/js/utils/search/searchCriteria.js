'use strict';
// Load modules

const _ = require('lodash');

const SearchCriterion = require('./searchCriterion');


// Declare internals

const internals = {};


exports = module.exports = internals.SearchCriteria = function (queryString) {

    const fragments = queryString.split(' ');

    this.criteria = _.map(fragments, (fragment) => {

        return SearchCriterion.create(fragment);
    });
};


internals.SearchCriteria.create = function (queryString) {

    return new internals.SearchCriteria(queryString);
};


internals.SearchCriteria.prototype.matches = function (request) {

    return _.chain(this.criteria)
        .reject((criterion) => {

            return criterion.ignored;
        })
        .every((criterion) => {

            return criterion.matches(request);
        })
        .value();
};
