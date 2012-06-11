define([
  'jQuery',
  'Underscore',
  'Backbone',
  'collections/projects',
  'text!templates/projects/list.html'
], function($,_, Backbone, projectsCollection, projectsListTemplate){
  var projectsListView = Backbone.View.extend({
    el: $("#container"),
    initialize: function(){
      this.collection = new projectsCollection;
      this.collection.add({ name: "Ginger Kid"});
      console.log(this.collection,"ggggggggggggggg");
      // Compile the template using Underscores micro-templating
      var compiledTemplate = _.template( projectsListTemplate, { projects: this.collection.models } );
      this.el.html(compiledTemplate);
    }
  });
  // Returning instantiated views can be quite useful for having "state"
  return new projectsListView;
});