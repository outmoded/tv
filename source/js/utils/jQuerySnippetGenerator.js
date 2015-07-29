// Load modules


// Declare internals

internals = {};


exports = module.exports = internals.jQuerySnippetGenerator = function () { };


internals.jQuerySnippetGenerator.generate = function (clientId) {

    return [
        'jQuery.ajaxSetup({',
        '    beforeSend: function (xhr, settings) {',
        '        var clientId = \'' + clientId + '\';',
        '        settings.url += ((settings.url.indexOf(\'?\') !== -1) ? \'&\' : \'?\') + \'debug=\' + clientId;',
        '    }',
        '});'
    ].join('\n');
};
