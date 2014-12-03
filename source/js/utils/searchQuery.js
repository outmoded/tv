var _ = require('lodash');


exports.toObject = function(qs) {
    var result = {};
    
    if (qs.length === 0 || _.isUndefined(qs) || qs.indexOf(':') === -1) return undefined;
    
    _.each(_.object(_.map(qs.split(' '), function(s) { 
        return s.split(':') 
    })), function(v, k) { 
        result[k] = v.length > 0 ? v.split(',') : undefined;
    });
    
    return result;
}