var interact = require('interact');
var _ = require('lodash');

(function (window, $, _, interact) {

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
    var defaultColumnList = [
        { "name": "timestamp" },
        { "name": "method" },
        { "name": "path" },
        { "name": "data" },
        { "name": "tags" }
    ];

    var columnList = JSON.parse(localStorage.getItem("columnList")) || _.clone(defaultColumnList, true);

    var $dragEl = null;
    var $resizeCol = null;

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

    function merge (target, source, keyList) {

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

            if (keyList) {
                if ($.inArray(key, keyList) === -1) {
                    return false;
                }
            }

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

        var mergeKeys = ["method", "path"];
        requestList = requestList.map(function (request) {

            if (request.requestId === requestData.requestId) {

                requestData = merge(requestData, request, mergeKeys);

                return request;
            }

            return request;
        });

        requestList.push(requestData);

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

            var requestData = {
                requestId: requestId,
                method: payload.data && payload.data.method && payload.data.method.toUpperCase(),
                path: path,
                data: payload.data,
                rawTimestamp: payload.timestamp,
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
                    var el = $(html);
                    el.addClass(className);
                    html = $('<div>').append(el.clone()).html();
                }

                $('tbody').prepend(html);

                if ($.tv.grouping._enabled) {
                    $.tv.grouping.on();
                }
            });
        };

        $('#subscribe').click(function (e) {

            $('#filterButton').show();
            ws.send($('#session').val());
            $('#active-subscriber').addClass('active');
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

        $('#reset-columns').on('click', function(e) {
            e.preventDefault();

            resetCols();
        });

        $table.on('click', '.data ul', function(e) {
            $(this).toggleClass('expanded');
            e.stopPropagation();
        }).on('dragstart th', function(e) {
            $dragEl = $(e.target);

            // Firefox requires setData for drag and drop behavior.
            e.originalEvent.dataTransfer.setData('text/plain', '');
            e.originalEvent.dataTransfer.effectAllowed = 'move';
        }).on('dragover th', function(e) {
            var $dragEl = $(e.target);

            e.preventDefault();

            $dragEl.addClass("is-droppable");
        }).on('dragleave th', function(e) {
            var $dragEl = $(e.target);

            $dragEl.removeClass("is-droppable");
        }).on('drop th', function(e) {
            var $dropEl = $(e.target);

            e.stopPropagation();

            if (!$dropEl.is('th') || $dropEl.is($dragEl)) { return; }

            if ($dropEl.prevAll().filter($dragEl).length) {
                $dragEl.insertAfter($dropEl);
            } else {
                $dragEl.insertBefore($dropEl);
            }

            orderCols();
        }).on('dragend', function(e) {
            $('th').removeClass('is-droppable');
        });

        $('thead').on('mouseenter', function() {
            $('.cursor-styles').html('html { cursor: move; }');
        }).on('mouseleave', function() {
            $('.cursor-styles').html('');
        });

        interact("th").resizeable({
            onstart: function(e) {
                startColResize($(e.target));
            },
            onmove: function(e) {
                adjustColWidth(e.dx);
            },
            onend: function (e) {
                saveColWidth();
            }
        });
    }

    function startColResize ($sourceEl) {
        var index = $("th").index($sourceEl);
        $resizeCol = $("col").eq(index);

        $resizeCol.width($sourceEl.outerWidth());
    }

    function adjustColWidth (widthChange) {
        $resizeCol.width($resizeCol.width() + widthChange);
    }

    function saveColWidth () {
        _.forEach(columnList, function (col) {
            if (col.name === $resizeCol.data('name')) {
                col.width = $resizeCol.width();
            }
        });

        saveCols();

        $resizeCol = null;
    }

    function compileTemplates () {

        $.tv.templates = $.tv.templates || {};
        $.tv.templates.row = Handlebars.compile($('#row-template').html());
        $.tv.templates.tags = Handlebars.compile($('#tags-template').html());
        $.tv.templates.thead = Handlebars.compile($('#thead-template').html());
        $.tv.templates.colgroup = Handlebars.compile($('#colgroup-template').html());

        $.tv.templates.colEl = Handlebars.compile($('#col-element-template').html());
        $.tv.templates.colHeadingTpl = Handlebars.compile($('#colheading-template').html());

        // Column partials
        $.tv.templates.col = $.tv.templates.col || {};
        $.tv.templates.col.timestamp = Handlebars.compile($('#col-timestamp-template').html());
        $.tv.templates.col.method = Handlebars.compile($('#col-method-template').html());
        $.tv.templates.col.path = Handlebars.compile($('#col-path-template').html());
        $.tv.templates.col.data = Handlebars.compile($('#col-data-template').html());
        $.tv.templates.col.tags = Handlebars.compile($('#col-tags-template').html());
    }

    function orderCols () {
        var reorderedColumnList = [];

        $("th").each(function () {
            var col = _.where(columnList, { name: $(this).html() });

            reorderedColumnList.push(col[0]);
        });

        columnList = reorderedColumnList;

        saveCols();

        render();
    }

    function saveCols () {
        localStorage.setItem("columnList", JSON.stringify(columnList));
    }

    function resetCols () {
        localStorage.setItem("columnList", null);

        columnList = defaultColumnList;

        render();
    }

    function render () {
        $('colgroup')
            .html('')
            .append($.tv.templates.colgroup());

        $('thead')
            .html('')
            .append($.tv.templates.thead());

        $('tbody').html('');

        requestList.forEach(function (requestData) {
            $('tbody').prepend($.tv.templates.row(requestData));
        });
    }

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

        this.sortByGroup();
        this._enabled = true;
        $('table').removeClass('table-striped');
        this.groupAll();
    };

    Grouping.prototype.off = function () {

        this.sortByTimestamp();
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
            if (prev.length === 0) {
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

        var currentRequestId = this.getRequestIdFromEl(el);

        if (this.isAGroup(currentRequestId, lastRow.requestId)) {
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
            requestId: this.getRequestIdFromEl(el),
            className: this.getClassFromEl(el)
        };
        return result;
    };

    Grouping.prototype.getPathFromEl = function (el) {

        return el.children('td.path').children('a').attr('href');
    };

    Grouping.prototype.getRequestIdFromEl = function (el) {

        return el.data("request-id");
    };

    Grouping.prototype.getClassFromEl = function (el) {

        return ( el.hasClass('odd') ? 'odd' : 'even' );
    };

    Grouping.prototype.isAGroup = function (requestId, lastRequestId) {

        // This is the primary function that defines what makes a "group", change this as needed
        if (!requestId || !lastRequestId) {
            return false;
        }

        return requestId === lastRequestId;
    };

    Grouping.prototype.sortByGroup = function () {

        $('tbody').html('');

        _.chain(requestList)
            .groupBy("requestId")
            .sortBy("rawTimestamp")
            .flatten()
            .value()
            .forEach(function (requestData) {
                $('tbody').prepend($.tv.templates.row(requestData));
            });
    };

    Grouping.prototype.sortByTimestamp = function () {

        $('tbody').html('');

        requestList.forEach(function (requestData) {
            $('tbody').prepend($.tv.templates.row(requestData));
        });
    };

    // End Grouping Stuff

    $.tv.register = function (options) {

        $.tv.grouping = new Grouping();
        attachEvents(new WebSocket('ws://' + options.host + ':' + options.port));
        compileTemplates();

        Handlebars.registerHelper('printData', function (data) {
            if (!data) return false;

            var string = JSON.stringify(data, dataReplacer, 2),
                result = formatJSON(JSON.parse(string));

            return new Handlebars.SafeString(result);
        });

        Handlebars.registerHelper('columnHeadings', function () {
            var self = this,
                colHeadings = [];

            _.forEach(columnList, function (col) {
                colHeadings.push($.tv.templates.colHeadingTpl(col));
            });

            return new Handlebars.SafeString(colHeadings.join(''));
        });

        Handlebars.registerHelper('columnElements', function () {
            var self = this,
                cols = [];

            _.forEach(columnList, function (col) {
                cols.push($.tv.templates.colEl(col));
            });

            return new Handlebars.SafeString(cols.join(''));
        });

        Handlebars.registerHelper('columnList', function () {
            var self = this,
                colList = [];

            _.forEach(columnList, function (col) {
                colList.push($.tv.templates.col[col.name](self));
            });

            return new Handlebars.SafeString(colList.join(''));
        });

        render();
    };
})(window, jQuery, _, interact);