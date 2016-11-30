'use strict';
// Load modules

const _ = require('lodash');


// Declare internals

const internals = {
    VALID_SCOPED_PROPERTIES: ['path', 'method', 'status', 'tags', 'data'],
    CUSTOM_PROPERTY_FUNCTIONS: {
        tags: function (request) {

            return _.chain(request.serverLogs)
                .pluck('tags')
                .flatten()
                .uniq()
                .value();
        },
        data: function (request) {

            return _.chain(request.serverLogs)
                .pluck('data')
                .flatten()
                .map((a) => {

                    return JSON.stringify(a);
                })
                .value();
        },
        status: function (request) {

            return request.statusCode || '';
        }
    }
};


exports = module.exports = internals.SearchCriterion = function (fragment) {

    this._fragment = fragment;

    if (this._isScoped()) {
        this.scoped = true;
        this.scopedProperty = this._parseScopedProperty();
        this.scopedPropertyValues = this._parseScopedPropertyValues();
    }
    else if (this._isValidAny()) {
        this.scoped = false;
        this.scopedProperty = null;
    }
    else {
        this.ignored = true;
    }
};


internals.SearchCriterion.create = function (fragment) {

    return new internals.SearchCriterion(fragment);
};


internals.SearchCriterion.prototype.matches = function (request) {

    let matches;

    if (this.scoped) {
        matches = this._matchesScopedProperty(request);
    }
    else {
        matches = this._matchesAny(request);
    }

    return matches;
};


internals.SearchCriterion.prototype._isValidAny = function () {

    const pieces = this._fragment.split(':');

    if (pieces.length > 1) {
        if (_.contains(internals.VALID_SCOPED_PROPERTIES, pieces[0])) {
            return false;
        }
    }

    return true;
};


internals.SearchCriterion.prototype._parseScopedPropertyValues = function () {

    const pieces = this._fragment.split(':');
    const values = pieces[1].split(',');

    return _.reject(values, (value) => {

        return value.length === 0;
    });
};


internals.SearchCriterion.prototype._isScoped = function () {

    const pieces = this._fragment.split(':');

    if (pieces.length > 1 && pieces[1].length) {
        return _.contains(internals.VALID_SCOPED_PROPERTIES, pieces[0]);
    }

    return false;
};

internals.SearchCriterion.prototype._parseScopedProperty = function () {

    return this._fragment.split(':')[0];
};


internals.SearchCriterion.prototype._matchesScopedProperty = function (request) {

    return _.any(this.scopedPropertyValues, (value) => {

        return this._matchesValue(request, this.scopedProperty, value);
    });
};


internals.SearchCriterion.prototype._matchesAny = function (request) {

    return _.any(internals.VALID_SCOPED_PROPERTIES, (property) => {

        return this._matchesValue(request, property, this._fragment);
    });
};


internals.SearchCriterion.prototype._matchesValue = function (request, property, expectedValue) {

    let actualValue;
    const customValueFunction = internals.CUSTOM_PROPERTY_FUNCTIONS[property];

    if (customValueFunction) {
        actualValue = customValueFunction(request);
    }
    else {
        actualValue = request[property];
    }

    return actualValue.toString().toLowerCase().indexOf(expectedValue.toLowerCase()) !== -1;
};
