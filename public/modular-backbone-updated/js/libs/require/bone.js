


require([

  // Load our app module and pass it to our definition function

  'backbone'

], function(Backbone){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
var bone = bone|| {}
  bone.view = Backbone.View.extend({});
  bone.model = Backbone.Model.extend();
  bone.collection = Backbone.Collection.extend();
  bone.controller = Backbone.Router.extend();
  window.bone = bone;
  return bone;
  
});
