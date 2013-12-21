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
    };


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
    };


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
    };

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

    function formatDate(date) {

        var d = new Date(date);

        var result = d.toLocaleTimeString() + ' ' + d.getMilliseconds() + 'ms';
        return result;
    }

    function formatJSON(obj) {

        var list = $('<ul>'),
            container = $('<div>');

        for (var prop in obj) {
            var item = $('<li>');
            item.append('<span class="json-key">' + prop + '</span>: ');

            if (obj[prop] === Object(obj[prop])) {
                item.append( formatJSON(obj[prop]) );
            } else if (typeof obj[prop] == 'string' || obj[prop] instanceof String) {
                item.append('<span class="json-value">"'+obj[prop]+'"</span>');
            } else {
                item.append('<span class="json-value">'+obj[prop]+'</span>');
            }
            list.append(item);
        }
        container.append(list);
        return container.html();
    }

    function attachEvents (ws) {

        var $table = $('.table');

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
                timestamp: formatDate(payload.timestamp),
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

            $.tv.grouping.group($(html), function (err, className) {

                if (className) {
                    var el = $(html)
                    el.addClass(className);
                    html = $('<div>').append(el.clone()).html();
                }

                if ($('#' + requestData.requestId).length) {
                    $('#' + requestData.requestId).replaceWith(html);
                }
                else {
                    $('tbody').prepend(html);
                }
            });
        };

        $('#subscribe').click(function (e) {

            $('#filterButton').show();
            ws.send($('#session').val());
            $('#active-subscriber').addClass('active');
            $('#session').val('');
            e.preventDefault();
        });


        $('#tagList').on('change', ':checkbox', function() {

            requestList.forEach(filterRequests);
            $('tbody').html('');
            requestList.forEach(function (requestData) {

                $('tbody').prepend($.tv.templates.row(requestData));
            });
        });

        $("#group-responses").on('change', ':checkbox', function() {
            $.tv.grouping.toggle();
        });

        $table.on('click', '.data ul', function(e) {
            $(this).toggleClass('expanded');
            e.stopPropagation();
        });
    }

    function compileTemplates () {

        $.tv.templates = $.tv.templates || {};
        $.tv.templates.row = Handlebars.compile($('#row-template').html());
        $.tv.templates.tags = Handlebars.compile($('#tags-template').html());
    };

    // Grouping Stuff
    var Grouping = function () {

        this._enabled = false;
        this._groupQueue = [];
        this._isLocked = false;
    };

    Grouping.prototype.toggle = function () {

        if (this._enabled) {
            this.off();
        }
        else {
            this.on();
        }
    };

    Grouping.prototype.on = function () {

        this._enabled = true;
        $('table').removeClass('table-striped');
        this.groupAll();
    };

    Grouping.prototype.off = function () {

        this._enabled = false;
        $('tbody tr').removeClass('even odd');
        $('table').addClass('table-striped');
    };

    Grouping.prototype.groupAll = function () {

        var self = this;
        this._isLocked = true;
        $('tbody tr').each(function(index, d){

            var el = $(d);
            var prev = el.prev();
            if (prev.length == 0) {
                el.addClass('even');
            }
            else {
                self._group(el, self.elToRow($(prev[0])), function(err, className){

                    if (className) {
                        el.addClass(className);
                    }
                });
            }
        });
        this.dequeue();
        this._isLocked = false;
    };

    Grouping.prototype.dequeue = function () {

        while (this._groupQueue.length > 0) {
            var selection = this._groupQueue.shift();
            this.group(selection[0], selection[1]);
        }
    };

    Grouping.prototype.group = function (el, callback) {

        if (this._enabled) {
            if (this._isLocked) {
                this._groupQueue.push([el, callback]);
            }
            else {
                this._group(el, this.getLastRow(), callback);
            }
        }
        else {
            return callback && callback(null, false);
        }
    };

    Grouping.prototype._group = function (el, lastRow, callback) {

        var currentPath = this.getPathFromEl(el);

        if (this.isAGroup(currentPath, lastRow.path)) {
            return callback(null, lastRow.className);
        }
        else {
            if (lastRow.className == 'even') {
                return callback(null, 'odd');
            }
            else {
                return callback(null, 'even');
            }
        }
    };

    Grouping.prototype.getLastRow = function () {

        var elLast = $('tbody tr').first();
        return this.elToRow(elLast);
    };

    Grouping.prototype.elToRow = function (el) {

        var result = {
            path: this.getPathFromEl(el),
            className: this.getClassFromEl(el)
        };
        return result;
    };

    Grouping.prototype.getPathFromEl = function (el) {

        return el.children('td.path').children('a').attr('href');
    };

    Grouping.prototype.getClassFromEl = function (el) {
        return ( el.hasClass('odd') ? 'odd' : 'even' );
    };

    Grouping.prototype.isAGroup2 = function (pathName, lastPathName) {

        // This is the primary function that defines what makes a "group", change this as needed
        if (!pathName || !lastPathName) {
            return false;
        }

        return pathName.indexOf(lastPathName) >= 0 || lastPathName.indexOf(pathName) >= 0;
    };

    Grouping.prototype.isAGroup = function (pathName, lastPathName) {

        // This is the primary function that defines what makes a "group", change this as needed
        if (!pathName || !lastPathName) {
            return false;
        }

        return pathName.split('/')[1] == lastPathName.split('/')[1];
    };

    // End Grouping Stuff

    $.tv.register = function (options) {

        $.tv.grouping = new Grouping();
        attachEvents(new WebSocket('ws://' + options.host + ':' + options.port));
        compileTemplates();

        Handlebars.registerHelper('printData', function (data) {

            var string = JSON.stringify(data, dataReplacer, 2),
                result = formatJSON(JSON.parse(string));

            return new Handlebars.SafeString(result);
        });
    };
})(window, jQuery);