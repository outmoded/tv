this["$"] = this["$"] || {};
this["$"]["tv"] = this["$"]["tv"] || {};
this["$"]["tv"]["templates"] = this["$"]["tv"]["templates"] || {};
this["$"]["tv"]["templates"]["col-data"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<td class=\"data\">"
    + escapeExpression(((helpers.printData || (depth0 && depth0.printData) || helperMissing).call(depth0, (depth0 != null ? depth0.data : depth0), {"name":"printData","hash":{},"data":data})))
    + "</code></td>";
},"useData":true});
this["$"]["tv"]["templates"]["col-element"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "style=\"width: "
    + escapeExpression(((helper = (helper = helpers.width || (depth0 != null ? depth0.width : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"width","hash":{},"data":data}) : helper)))
    + "px\"";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<col data-name=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\" class=\"col-"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.width : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + ">";
},"useData":true});
this["$"]["tv"]["templates"]["col-method"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "<td class=\"method\">"
    + escapeExpression(lambda((depth0 != null ? depth0.method : depth0), depth0))
    + "</td>";
},"useData":true});
this["$"]["tv"]["templates"]["col-path"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "<td class=\"path\"><a href='"
    + escapeExpression(lambda((depth0 != null ? depth0.path : depth0), depth0))
    + "'>"
    + escapeExpression(lambda((depth0 != null ? depth0.path : depth0), depth0))
    + "</a></td>";
},"useData":true});
this["$"]["tv"]["templates"]["col-tags"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "        <li class=\""
    + escapeExpression(lambda((depth0 != null ? depth0.color : depth0), depth0))
    + "\">"
    + escapeExpression(lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "</li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<td class=\"tags\">\n    <ul>\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.tags : depth0), {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </ul>\n</td>";
},"useData":true});
this["$"]["tv"]["templates"]["col-timestamp"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "<td class=\"timestamp\">"
    + escapeExpression(lambda((depth0 != null ? depth0.timestamp : depth0), depth0))
    + "</td>";
},"useData":true});
this["$"]["tv"]["templates"]["colgroup"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return escapeExpression(((helper = (helper = helpers.columnElements || (depth0 != null ? depth0.columnElements : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"columnElements","hash":{},"data":data}) : helper)));
  },"useData":true});
this["$"]["tv"]["templates"]["colheading"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<th draggable=\"true\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</th>";
},"useData":true});
this["$"]["tv"]["templates"]["row"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, lambda=this.lambda, escapeExpression=this.escapeExpression, functionType="function", helperMissing=helpers.helperMissing;
  return "    <tr data-request-id='"
    + escapeExpression(lambda((depth0 != null ? depth0.requestId : depth0), depth0))
    + "'>"
    + escapeExpression(((helper = (helper = helpers.columnList || (depth0 != null ? depth0.columnList : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"columnList","hash":{},"data":data}) : helper)))
    + "</tr>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.show : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true});
this["$"]["tv"]["templates"]["tags"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "<label class=\"checkbox\">\n    <input type=\"checkbox\" id=\""
    + escapeExpression(lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "\" checked />\n    <span class=\""
    + escapeExpression(lambda((depth0 != null ? depth0.color : depth0), depth0))
    + "\">"
    + escapeExpression(lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "</span>\n</label>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.tags : depth0), {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true});
this["$"]["tv"]["templates"]["thread"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<tr>"
    + escapeExpression(((helper = (helper = helpers.columnHeadings || (depth0 != null ? depth0.columnHeadings : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"columnHeadings","hash":{},"data":data}) : helper)))
    + "</tr>";
},"useData":true});