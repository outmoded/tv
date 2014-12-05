var _ = require('lodash');


var internals = {};



var SearchCriteria = exports.SearchCriteria = function(qs) {
    var fragments  = qs.split(' ');

    this.criteria = _.map(fragments, function(fragment) {
        return SearchCriterion.create(fragment);
    });
}

SearchCriteria.prototype.matches = function (request) {
    return _.chain(this.criteria)
        .reject(function(criterion) { return criterion.ignored; })
        .every(function(criterion) { return criterion.matches(request); })
        .value();
}

SearchCriteria.create = function(qs) {
    return new SearchCriteria(qs);
}

var SearchCriterion = exports.SearchCriterion = function(fragment) {
    this.fragment = fragment;

    if (this._isScoped()) {
        this.scoped = true;
        this.scopedProperty = this._parseScopedProperty();
        this.scopedPropertyValues = this._parseScopedPropertyValues();
    } else if(this._isValidAny()) {
        this.scoped = false;
        this.scopedProperty = null;
    } else {
        this.ignored = true;
    }
}

SearchCriterion.prototype._isValidAny = function() {
    var pieces = this.fragment.split(':');
    if(pieces.length > 1) {
        if(_.contains(SearchCriterion.VALID_SCOPED_PROPERTIES, pieces[0])) {
            return false;
        }
    }

    return true;
}

SearchCriterion.prototype._parseScopedPropertyValues = function() {
    var pieces = this.fragment.split(':');

    return pieces[1].split(',');
}

SearchCriterion.prototype._isScoped = function() {
    var pieces = this.fragment.split(':');

    if(pieces.length > 1 && pieces[1].length) {
        return _.contains(internals.VALID_SCOPED_PROPERTIES, pieces[0]);
    }

    return false;
}

SearchCriterion.prototype._parseScopedProperty = function() {
    return this.fragment.split(':')[0];
}

SearchCriterion.prototype.matches = function(request) {
    if (this.scoped) {
        return this._matchesScopedProperty(request);
    } else {
        return this._matchesAny(request);
    }
}

SearchCriterion.prototype._matchesScopedProperty = function(request) {
    return _.any(this.scopedPropertyValues, function(value) {
        return this._matchesValue(request, this.scopedProperty, value);
    }.bind(this));
}

SearchCriterion.prototype._matchesAny = function(request) {
    return _.any(SearchCriterion.VALID_SCOPED_PROPERTIES, function(property) {
        return this._matchesValue(request, property, this.fragment);
    }.bind(this));
}

SearchCriterion.prototype._matchesValue = function(request, property, expectedValue) {
    var actualValue = null;
    var customValueFunction = internals.CUSTOM_PROPERTY_FUNCTIONS[property];
    if (customValueFunction) {
        actualValue = customValueFunction(request);
    } else {
        actualValue = request[property]
    }

    return actualValue.toString().toLowerCase().indexOf(expectedValue.toLowerCase()) !== -1;
}

SearchCriterion.create = function(fragment) {
    return new SearchCriterion(fragment);
}

SearchCriterion.VALID_SCOPED_PROPERTIES = internals.VALID_SCOPED_PROPERTIES = ['path', 'method', 'status', 'tags'];

SearchCriterion.CUSTOM_PROPERTY_FUNCTIONS = internals.CUSTOM_PROPERTY_FUNCTIONS = {
    tags: function(request) {
        return _.chain(request.serverLogs)
            .pluck('tags')
            .flatten()
            .uniq()
            .value();
    },
    status: function(request) {
        return request.statusCode || '';
    }
}
