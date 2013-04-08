(function (window, $) {

    $.tv = $.tv || {};


    var tagList = [];							// Complete Tag List
    var requestIdList = [];
    var colorsList = [
        "Brown",
        "Blue",
        "Red",
        "Green",
        "Salmon",
        "Orange",
        "Purple",
        "LightSlateGrey",
        "DarkGoldenRod",
        "Black",
        "DeepPink"
    ];

    function addFilterTag(tag) {

        if (tagList.indexOf(tag) === -1) {
            tagList.push(tag);
            $("#checkboxes").append('<span class="checkboxWrapper" style="color:' + colorsList[tagList.indexOf(tag)] + '"><input type="checkbox" name="tag" class="' + tag + '" value="' + tag + '">' + tag + '</span><br>');
        }
    }

    // Finds which tags are still shown, and removes unnecessary ones

    function filterTagList() {

        var filteredTagList = {};
        $('dd').each(function() {
            if ($(this).css('display') === 'none') {
                return true;
            }

            var tagArray = $(this).attr('class').split(' ');
            for (var i = 0, tagArrayLength = tagArray.length; i < tagArrayLength; ++i) {
                filteredTagList[tagArray[i]] = true;
            }
        });

        for (var i = 0, il = tagList.length; i < il; ++i) {
            var tag = tagList[i];
            if (filteredTagList[tag]) {
                $('input:checkbox.' + tag).removeAttr('disabled');
            }
            else {
                $('input:checkbox.' + tag).attr('disabled', true);
            }
        }
    }

    function filterRequestId() {

        $('dt').each(function() {

            var requestSelector = this;
            var childrenList = $(requestSelector).children('dd').length;
            var count = 0;

            $(requestSelector).children('dd').each(function() {

                if ($(this).css('display') === 'block') {
                    $(requestSelector).show();
                }
                else {
                    ++count;
                }
            });

            if (childrenList === count) {
                $(requestSelector).hide();
            }
        });
    }

    function filterSome() {

        var checkedLength = $('input:checked').length;
        var tag = '';
        for(var i = 0; i< checkedLength; ++i) {
            tag += '.' + $('input:checked')[i].value;
        }

        $(tag).removeClass('filtered');
    }


    function filterAll() {

        $('dd').each(function() {
            $(this).removeClass('filtered');
        });
    }


    function checkBoxCount() {

        var checkboxLength = $(':checkbox').length;
        var checkedLength = $('input:checked').length;

        if (checkboxLength === checkedLength) {
            filterAll();
        }
        else if (checkedLength === 0) {
            filterAll();
        }
        else {
            filterSome();
        }
    }


    function filter() {

        $('dt').show();
        $('dd').show();

        $('dd').each(function() {

            if (!$(this).hasClass('filtered')) {
                $(this).addClass('filtered');
            }
        });

        checkBoxCount();

        $('.filtered').hide();

        filterRequestId();
        filterTagList();
    }

    // Checks expands/collapse signs

    function checkSigns() {

        $('dt').each(function() {

            var dt = this;
            var done = false;
            var isVisible = false;
            var ddList = $(dt).children('dd');

            for (var i = 0, ddListLength = ddList.length; i < ddListLength; ++i ) {

                if ($(ddList[i]).css('display') === 'block') {
                    isVisible = true;
                    var currentSign = $(dt).find('.sign').html();

                    if (currentSign === ' + ') {
                        $(dt).find('.sign').html(' - ');
                        done = true;
                        break;
                    }
                }
            }

            if (!done) {
                if (!isVisible) {
                    if ($(dt).find('.sign').html() === ' - ') {
                        $(dt).find('.sign').html(' + ');
                    }
                }
            }
        });
    }

    function attachEvents(ws) {

        ws.onclose = function() {};
        ws.onmessage = function(message) {

            var payload = JSON.parse(message.data);
            var tag = payload.tags || ['noTag'];
            var tagClass = tag[0].toString();
            var requestId = payload.request;

            addFilterTag(tagClass);

            var tagString = '<span class="' + tag[0].toString() + '" style="color:' + colorsList[tagList.indexOf(tag[0])] + '">' + tag[0].toString() + '</span>';
            for (var i = 1, il = tag.length; i < il; ++i) {
                addFilterTag(tag[i]);
                tagString = tagString + ', ' + '<span class="' + tag[i].toString() + '" style="color:' + colorsList[tagList.indexOf(tag[i])] + '">' + tag[i].toString() + '</span>';
                tagClass += ' ' + tag[i];
            }

            tagClass = '"' + tagClass + '"';

            if (payload.data) {
                var url = payload.data.url || null;
            }

            if (url) {
                var urlLength = url.length || null;
                if (urlLength > 15) {
                    var urlFirstHalf = url.substring(0, 15);
                    var urlSecondHalf = url.substring(15, urlLength);
                    url = urlFirstHalf + '<span class="urlEllipses">...</span>' + '<span class="urlSecondHalf" style="display: none">' + urlSecondHalf + '</span>';
                }
            }

            if (requestIdList.indexOf(requestId) === -1) {
                $("#streamList").prepend('<br><dt class=' + requestId + '><p class="requestId"><span class="sign"> - </span>' + payload.data.method.toUpperCase() + "  |  " + url +  '</p></dt>');
                requestIdList.push(requestId);
            }

            var newPayload = {}
            newPayload.time = new Date(payload.timestamp);
            newPayload.tags = payload.tags;
            var newData = payload.data;
            var clearData = organizeData(newData);
            var tagsLength = newPayload.tags.length;
            var tagsClass = newPayload.tags;
            var tagsClassString = "";
            var newDate = new Date(newPayload.time);

            var msec = newDate.getMilliseconds().toString();
            if (msec.length < 3) {
                if (msec.length === 2) {
                    msec = "0" + msec;
                }
                else if (msec.length === 1) {
                    msec = "00" + msec;
                }
            }

            newDate = newDate.toLocaleTimeString() + "." + msec;
            for (var i = 0, il = tagsClass.length; i < il; ++i) {
                tagsClassString += " " + tagsClass[i];
            }

            tagsClassString = "span2 tags" + tagsClassString;
            $("." + requestId).append('<dd class=' + tagClass + '><div class="row">' +
                '<div class="span1"></div><div class="span2">' + newDate + '</div>' +
                '<div class="span2 tags">' + tagString + '</div>' +
                '<div class="span5">' + clearData + '</div>' +
                '</div></dd>');

            filter();
        };

        $('#subscribe').click(function () {

            $('#filterButton').show();
            ws.send($('#session').val());
        });


        $('dt p .sign').click(function(e) {

            $(this).parent().parent().children('dd').each(function() {

                if ($(this).css('display') === 'block') {
                    $(this).hide();
                }
                else if (!$(this).hasClass('filtered')) {
                    $(this).show();
                }
            });

            checkSigns();
        });

        $('.firstPair').click(function(){

            if ($(this).siblings('.pairEllipses').html() === '...') {
                $(this).parent().children('.otherPair').show();
                $(this).siblings('.pairEllipses').html('');
            }
            else {
                $(this).parent().children('.otherPair').hide();
                $(this).siblings('.pairEllipses').html('...');
            }
        });

        $(window).on('change', ':checkbox', function(){

            filter();
        });

        $(window).on('click', '.urlEllipses', function() {

            $(this).hide();
            $(this).siblings('.urlSecondHalf').show();
        });
        $(window).on('click', '.urlSecondHalf', function() {

            $(this).hide();
            $(this).siblings('.urlEllipses').show();
        });
    }

    function organizeData(data) {

        var dataString = '';
        if (typeof data === 'undefined') {
            return dataString;
        }

        var dataLength = Object.keys(data).length;
        if (dataLength === 1) {
            for (var key in data) {
                dataString += key + ' : ' + data[key];
            }

            return dataString + '<br>';
        }

        var firstKey = true;
        for (var key in data) {
            if (key === "url" || key === "method") continue;
            if (firstKey) {
                dataString += '<span class="firstPair">' + key + ' : ' + data[key] + '</span><span class="pairEllipses">...</span><br>';
                firstKey = false;
            }
            else {
                dataString += '<span class="otherPair" style="display: none">' + key + ' : ' + data[key] + '<br></span>';
            }
        }

        return dataString;
    }

    $.tv.register = function (options) {

        var ws = new WebSocket('ws://' + options.host + ':' + options.port);
        attachEvents(ws);
    };

})(window, jQuery);