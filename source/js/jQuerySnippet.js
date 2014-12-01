exports = module.exports = function(clientId) {
    return [
        'jQuery.ajaxSetup({',
        '    beforeSend: function(xhr, settings) {',
        '        var clientId = \'' + clientId + '\';',
        '        settings.url += ((settings.url.indexOf(\'?\') !== -1) ? \'&\' : \'?\') + \'debug=\' + clientId;',
        '    }',
        '});'
    ].join('\n');
};