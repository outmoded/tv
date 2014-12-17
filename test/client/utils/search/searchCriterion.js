// Load modules

var _ = require('lodash');

var SearchCriterion = require('../../../../source/js/utils/search/searchCriterion');


// Declare internals

var internals = {};


describe('SearchCriterion', function () {

    describe('.create', function () {

        it('returns a new instance of SearchCriterion', function () {

            expect(SearchCriterion.create('')).to.be.instanceOf(SearchCriterion);
        });

        context('with a scoped search criterion', function () {

            it('marks the criterion as scoped', function () {

                _.each(SearchCriterion.VALID_SCOPED_PROPERTIES, function (property) {
                    var fragment = property + ':value';
                    var searchCriterion = SearchCriterion.create(fragment);

                    expect(searchCriterion.scoped).to.equal(true);
                });
            });

            it('specifies the scoped property', function () {

                var fragment = 'path:bar';
                var searchCriterion = SearchCriterion.create(fragment);

                expect(searchCriterion.scopedProperty).to.equal('path');
            });

        });

        context('with a scoped search criterion that doesn\'t specify a value', function () {

            it('marks the criterion as ignored', function (){

                expect(SearchCriterion.create('path:').ignored).to.equal(true);
            });

        });

        context('with a general search criterion that contains a colon', function () {

            it('does not ignore search criterion or mark it as ignored', function (){

                var criterion = SearchCriterion.create('foo:test');
                expect(criterion.ignored).to.not.equal(true);
                expect(criterion.scoped).to.equal(false);
            });

        });

        context('with a general search criterion', function () {

            it('marks the criterion as not scoped', function () {

                expect(SearchCriterion.create('foo').scoped).to.equal(false);
            });

            it('does not set a scoped property', function () {

                expect(SearchCriterion.create('foo').scopedProperty).to.equal(null);
            });

            it('marks the criterion as not ignored', function () {

                expect(SearchCriterion.create('foo').ignored).to.not.equal(true);
            });

        });

    });

    describe('#matches', function (){

        context('with a scoped criterion', function () {

            context('with a single value', function () {

                context('that matches the request', function () {

                    it('returns true', function () {

                        var request = {
                            path: '/customers',
                            statusCode: 200,
                            method: 'GET',
                            serverLogs: [{
                                tags: ['received'],
                                data: '{foo: "bar"}'
                            }]
                        };

                        _.each([
                            'path:customers',
                            'path:custom',
                            'path:Customer',
                            'status:200',
                            'status:20',
                            'method:get',
                            'method:ge',
                            'tags:received',
                            'tags:rec'
                        ], function (fragment) {

                            expect(SearchCriterion.create(fragment).matches(request)).to.equal(true);
                        });
                    });

                });

                context('that doesn\'t match the request', function () {

                    it('returns false', function () {

                        var request = {
                            path: '/invoices',
                            statusCode: 200,
                            method: 'GET',
                            serverLogs: [{
                                tags: ['received']
                            }]
                        };

                        _.each([
                            'path:customers',
                            'status:404',
                            'method:POST',
                            'tags:error'
                        ], function (fragment) {

                            expect(SearchCriterion.create(fragment).matches(request)).to.equal(false);
                        });
                    });

                });

            });

            context('with multiple values', function () {

                context('with one that matches the request', function () {

                    it('returns true', function () {

                        var request = {
                            path: '/customers',
                            statusCode: 200,
                            method: 'GET',
                            serverLogs: [{
                                tags: ['received']
                            }]
                        };

                        _.each([
                            'path:customers,invoices',
                            'path:cust,invoices',
                            'status:20,400',
                            'method:ge,post',
                            'tags:rec,foo'
                        ], function (fragment) {

                            expect(SearchCriterion.create(fragment).matches(request)).to.equal(true);
                        });
                    });

                });

                context('with none that match the request', function () {

                    it('returns false', function () {

                        var request = {
                            path: '/invoices',
                            statusCode: 200,
                            method: 'GET',
                            serverLogs: [{
                                tags: ['received']
                            }]
                        };

                        _.each([
                            'path:customers,orders',
                            'tags:error'
                        ], function (fragment) {

                            expect(SearchCriterion.create(fragment).matches(request)).to.equal(false);
                        });
                    });

                });

                context('and a trailing comma', function () {

                    it('ignores the empty value', function () {

                        var request = {
                            path: '/invoices',
                            statusCode: 200,
                            method: 'GET',
                            serverLogs: [{
                                tags: ['received']
                            }]
                        };

                        _.each([
                            'path:customers,'
                        ], function (fragment) {

                            expect(SearchCriterion.create(fragment).matches(request)).to.equal(false);
                        });
                    });
                });

            });

        });

        context('with a general criterion', function () {

            context('that matches the request', function () {

                it('returns true', function () {

                    var request = {
                        path: '/customers',
                        statusCode: 200,
                        method: 'GET',
                        serverLogs: [{
                            tags: ['received']
                        }]
                    };

                    _.each([
                        'customers',
                        'custo',
                        'stomers',
                        'get',
                        'GE',
                        '00',
                        '200',
                        'received',
                        'rec'
                    ], function (fragment) {

                        expect(SearchCriterion.create(fragment).matches(request)).to.equal(true);
                    });
                });

            });

            context('that doesn\'t match the request', function () {

                it('returns false', function () {

                    var request = {
                        path: '/customers',
                        statusCode: 200,
                        method: 'GET',
                        serverLogs: [{
                            tags: ['received']
                        }]
                    };

                    _.each([
                        'customerss',
                        '500',
                        'post',
                        'error'
                    ], function (fragment) {

                        expect(SearchCriterion.create(fragment).matches(request)).to.equal(false);
                    });
                });

            });

        });

        context('without a status code', function () {

            it('doesn\'t error', function () {

                var request = {
                    path: '/customers',
                    method: 'GET',
                    serverLogs: [{
                        tags: ['received']
                    }]
                };

                expect(function () {

                    SearchCriterion.create('foo').matches(request);
                }).to.not.throw();
            });

        });

    });

});
