(function (window, $) {

    $.tv = $.tv || {};                          // Add tv plugin namespace


    var tagList = [];                           // Complete Tag List
    var requestList = [];
    var colorsList = [
        "brown",
        "blue",
        "red",
        "green",
        "salmon",
        "orange",
        "purple",
        "lightslategrey",
        "darkgoldenrod",
        "black",
        "deeppink"
    ];

    function tagsContain (tags, tagName) {

        for (var i = 0, il = tags.length; i < il; ++i) {

            if (tags[i].name === tagName) {
                return true;
            }
        }

        return false;
    }


    function filterRequests (request) {

        var checked = $('#tagList :checked');
        for (var i = 0, il = checked.length; i < il; ++i) {

            var id = $(checked[i]).attr('id');
            if (tagsContain(request.tags, id)) {

                request.show = true;
                return;
            }
        }

        request.show = false;
    }


    function clone (obj, seen) {

        if (typeof obj !== 'object' ||
            obj === null) {

            return obj;
        }

        seen = seen || { orig: [], copy: [] };

        var lookup = seen.orig.indexOf(obj);
        if (lookup !== -1) {
            return seen.copy[lookup];
        }

        var newObj = (obj instanceof Array) ? [] : {};

        seen.orig.push(obj);
        seen.copy.push(newObj);

        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i] instanceof Date) {
                    newObj[i] = new Date(obj[i].getTime());
                }
                else if (obj[i] instanceof RegExp) {
                    var flags = '' + (obj[i].global ? 'g' : '') + (obj[i].ignoreCase ? 'i' : '') + (obj[i].multiline ? 'm' : '');
                    newObj[i] = new RegExp(obj[i].source, flags);
                }
                else {
                    newObj[i] = clone(obj[i], seen);
                }
            }
        }

        return newObj;
    }

    function merge (target, source) {

        if (!source) {
            return target;
        }

        if (source instanceof Array) {
            source.forEach(function (item) {

                if (!tagsContain(target, item.name)) {
                    target.push(item);
                }
            });

            return target;
        }

        Object.keys(source).forEach(function (key) {

            var value = source[key];
            if (value &&
                typeof value === 'object') {

                if (!target[key] ||
                    typeof target[key] !== 'object') {

                    target[key] = clone(value);
                }
                else {
                    merge(target[key], source[key]);
                }
            }
            else {
                if (value !== null && value !== undefined) {            // Explicit to preserve empty strings
                    target[key] = value;
                }
                else {                    // Defaults to true
                    target[key] = value;
                }
            }
        });

        return target;
    }


    function addTag (newTag) {

        var exists = false;
        var color;

        tagList.forEach(function (tag) {

            if (tag.name === newTag) {
                tag.count++;
                exists = true;
                color = tag.color;
            }
        });

        if (!exists) {
            color = colorsList[tagList.length];
            tagList.push({
                name: newTag,
                color: color,
                count: 1
            });
        }

        return color;
    }


    function addRequest (requestData) {

        var exists = false;
        requestList = requestList.map(function (request) {

            if (request.requestId === requestData.requestId) {

                requestData = merge(requestData, request);
                exists = true;

                return requestData;
            }

            return request;
        });

        if (!exists) {
            requestList.push(requestData);
        }

        return requestData;
    }


    function dataReplacer (key, value) {

        return key !== 'url' && key !== 'method' && key !== 'id' ? value: undefined;
    }


    function attachEvents (ws) {

        ws.onclose = function () {};
        ws.onmessage = function (message) {

            var payload = JSON.parse(message.data);
            var requestId = payload.request;
            var path = payload.data ? payload.data.url : null;
            var truncatedPath = path && path.length > 15 ? path.substring(0, 15) + '...' : path;

            var requestData = {
                requestId: requestId,
                method: payload.data && payload.data.method && payload.data.method.toUpperCase(),
                path: path,
                truncatedPath: truncatedPath,
                data: payload.data,
                timestamp: new Date(payload.timestamp).toLocaleTimeString(),
                tags: []
            };

            if (payload.tags) {
                payload.tags.forEach(function (tag) {
                    var color = addTag(tag);
                    requestData.tags.push({
                        name: tag,
                        color: color
                    });
                });
            }

            $('#tagList').html($.tv.templates.tags({ tags: tagList }));

            requestData = addRequest(requestData);
            requestList.forEach(filterRequests);
            var html = $.tv.templates.row(requestData);

            if ($('#' + requestData.requestId).length) {
                $('#' + requestData.requestId).replaceWith(html);
            }
            else {
                $('tbody').prepend(html);
            }
        };

        $('#subscribe').click(function (e) {

            $('#filterButton').show();
            ws.send($('#session').val());
            e.preventDefault();
        });


        $('#tagList').on('change', ':checkbox', function() {

            requestList.forEach(filterRequests);
            $('tbody').html('');
            requestList.forEach(function (requestData) {

                $('tbody').prepend($.tv.templates.row(requestData));
            });
        });
    }

    function compileTemplates () {

        $.tv.templates = $.tv.templates || {};
        $.tv.templates.row = Handlebars.compile($('#row-template').html());
        $.tv.templates.tags = Handlebars.compile($('#tags-template').html());
    }

    $.tv.register = function (options) {

        attachEvents(new WebSocket('ws://' + options.host + ':' + options.port));
        compileTemplates();

        Handlebars.registerHelper('prettyPrintData', function (data) {

            var string = JSON.stringify(data, dataReplacer, 2);

            return new Handlebars.SafeString(window.prettyPrintOne(string, 'json'));
        });
    };
})(window, jQuery);