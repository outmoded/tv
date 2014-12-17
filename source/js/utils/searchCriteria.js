var _ = require('lodash');


var internals = {};



var SearchCriteria = exports.SearchCriteria = function (qs) {

    var fragments  = qs.split(' ');

    this.criteria = _.map(fragments, function (fragment) {

        return SearchCriterion.create(fragment);
    });
};


SearchCriteria.create = function (qs) {

    return new SearchCriteria(qs);
};


SearchCriteria.prototype.matches = function (request) {

    return _.chain(this.criteria)
        .reject(function (criterion) {

            return criterion.ignored;
        })
        .every(function (criterion) {

            return criterion.matches(request);
        })
        .value();
};


var SearchCriterion = exports.SearchCriterion = function (fragment) {

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


SearchCriterion.prototype._isValidAny = function () {

    var pieces = this._fragment.split(':');

    if (pieces.length > 1) {
        if (_.contains(SearchCriterion.VALID_SCOPED_PROPERTIES, pieces[0])) {
            return false;
        }
    }

    return true;
};


SearchCriterion.prototype._parseScopedPropertyValues = function () {

    var pieces = this._fragment.split(':');
    var values = pieces[1].split(',');

    return _.reject(values, function (value) {

        return value.length === 0;
    });
};


SearchCriterion.prototype._isScoped = function () {

    var pieces = this._fragment.split(':');

    if (pieces.length > 1 && pieces[1].length) {
        return _.contains(internals.VALID_SCOPED_PROPERTIES, pieces[0]);
    }

    return false;
};

SearchCriterion.prototype._parseScopedProperty = function () {

    return this._fragment.split(':')[0];
};


SearchCriterion.prototype.matches = function (request) {

    var matches;

    if (this.scoped) {
        matches = this._matchesScopedProperty(request);
    }
    else {
        matches = this._matchesAny(request);
    }

    return matches;
};


SearchCriterion.prototype._matchesScopedProperty = function (request) {

    var self = this;

    return _.any(this.scopedPropertyValues, function (value) {

        return self._matchesValue(request, self.scopedProperty, value);
    });
};


SearchCriterion.prototype._matchesAny = function (request) {

    var self = this;

    return _.any(SearchCriterion.VALID_SCOPED_PROPERTIES, function (property) {

        return self._matchesValue(request, property, self._fragment);
    });
};


SearchCriterion.prototype._matchesValue = function (request, property, expectedValue) {

    var actualValue;
    var customValueFunction = internals.CUSTOM_PROPERTY_FUNCTIONS[property];

    if (customValueFunction) {
        actualValue = customValueFunction(request);
    }
    else {
        actualValue = request[property];
    }

    return actualValue.toString().toLowerCase().indexOf(expectedValue.toLowerCase()) !== -1;
};


SearchCriterion.create = function (fragment) {

    return new SearchCriterion(fragment);
};


SearchCriterion.VALID_SCOPED_PROPERTIES = internals.VALID_SCOPED_PROPERTIES =
    ['path', 'method', 'status', 'tags', 'data'];


SearchCriterion.CUSTOM_PROPERTY_FUNCTIONS = internals.CUSTOM_PROPERTY_FUNCTIONS = {

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
            .map(function (a) {

                return JSON.stringify(a);
            })
            .value();
    },

    status: function (request) {

        return request.statusCode || '';
    }

};
