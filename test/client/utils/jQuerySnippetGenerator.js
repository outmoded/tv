// Load modules

var JQuerySnippetGenerator = require('../../../source/js/utils/jQuerySnippetGenerator');


// Declare internals

var internals = {};


describe('jQuerySnippetGenerator', function () {

    describe('.generate', function () {

        it('generates a snippet with the given clientId', function () {

            expect(JQuerySnippetGenerator.generate('foo')).to.contain('var clientId = \'foo\';');
            expect(JQuerySnippetGenerator.generate('bar')).to.contain('var clientId = \'bar\';');
        });

    });

});
