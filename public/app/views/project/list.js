define([
  'jQuery',
  'Underscore',
  'Backbone',

  'text!templates/projects/list.html'
], function($, _, Backbone, projectListTemplate){
  var projectListView = Backbone.View.extend({
    el: $('#container'),
    render: function(){
      // Using Underscore we can compile our template with data
      var data = {};
      var compiledTemplate = _.template( projectListTemplate, data );
      // Append our compiled template to this Views "el"
       this.el.append( compiledTemplate );
    }
  });

  return new projectListView;
});