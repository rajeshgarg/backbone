// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/main',
  'views/projects/list',
  'models/post',
  'views/users/list'
], function($, _, Backbone, mainHomeView, projectListView,Post, userListView ){
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Define some URL routes
      'projects': 'showProjects',
      'users': 'showUsers',

      // Default
      '*actions': 'defaultAction'
    },
    showProjects: function(){
      // Call render on the module we loaded in via the dependency array
      // 'views/projects/list'
      projectListView.render();
    },
      // As above, call render on our loaded module
      // 'views/users/list'
    showUsers: function(){
      userListView.render();
    },
    defaultAction: function(actions){
      // We have no matching route, lets display the home page
      var po = new Post();
      po.fetch();
      var view= new mainHomeView({model: po});
      view.render();
    }
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
  };
  return {
    initialize: initialize
  };
});
