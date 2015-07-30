// Load modules

var _ = require('lodash');

var SearchCriterion = require('./searchCriterion');


// Declare internals

var internals = {};


exports = module.exports = internals.SearchCriteria = function (queryString) {

    var fragments = queryString.split(' ');

    this.criteria = _.map(fragments, function (fragment) {

        return SearchCriterion.create(fragment);
    });
};


internals.SearchCriteria.create = function (queryString) {

    return new internals.SearchCriteria(queryString);
};


internals.SearchCriteria.prototype.matches = function (request) {

    return _.chain(this.criteria)
        .reject(function (criterion) {

            return criterion.ignored;
        })
        .every(function (criterion) {

            return criterion.matches(request);
        })
        .value();
};
