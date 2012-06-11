define([
  'Underscore',
  'Backbone',
  // Pull in the Model module from above
  'models/project'
], function(_, Backbone, projectModel){
  var projectCollection = Backbone.Collection.extend({
    model: projectModel
  });
  // You don't usually return a collection instantiated
  return new projectCollection;
});