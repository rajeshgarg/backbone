define([
  'Underscore',
  'Backbone'
], function(_, Backbone){
  var projectModel = Backbone.Model.extend({
    defaults: {
      name: "Harry Potter"
    }
  });
  // You usually don't return a model instantiated
  return projectModel;
});