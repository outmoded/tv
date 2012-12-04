

var tagList = [];

function htmlEscape(string) { 

	return string.replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
}

function addFilterTag(tag) {

	if (tagList.indexOf(tag) == -1) {

		tagList.push(tag);
		$("#checkboxes").append("<input type='checkbox' name='tag' value='" + tag + "'>" + tag + "<br>");
	}
}

function wsSend() {

	$('#filterButton').show();
	ws.send($('#session').val());
}

function filter() {

	for (var i = 0, tagListLength = tagList.length; i < tagListLength; ++i) {

		$('.' + tagList[i]).hide();
	}

	var checkedLength = $('input:checked').length;

	for(var i = 0; i< checkedLength; ++i) {

		var tag = $('input:checked')[i].value;
		$('.' + tag).show();
	}
}

var ws = new WebSocket('ws://{{host}}:{{port}}');

ws.onopen = function() {};

ws.onmessage = function(message) { 

	var payload = JSON.parse(message.data);
	var tag = payload.tags || ["noTag"];
	var tagString = tag[0].toString();

	addFilterTag(tagString);

	for (var i = 1, iLength = tag.length; i < iLength; ++i) {
		
		addFilterTag(tag[i]);
		tagString += " " + tag[i];
	}

	tagString = "'" + tagString + "'";

	$("#streamList").append("<li class=" + tagString.toString() + ">" + htmlEscape(dataString) + "</li>");
};

ws.onclose = function() {};

$(document).ready(function() {

	$('#filterButton').hide();
})