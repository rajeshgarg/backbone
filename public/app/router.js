define([

  'Backbone',
  'views/project/list',

], function(  Backbone,projectListView){
  var AppRouter = Backbone.Router.extend({
    routes: {
 // Define some URL routes
      '/projects': 'showProjects',
      '/users': 'about',

      // Default
      '*actions': 'defaultAction'
    },
    
    showProjects: function(){
      // Call render on the module we loaded in via the dependency array
      // 'views/projects/list'
      window.Backbone = Backbone;
      projectListView.render();
    },
      // As above, call render on our loaded module
      // 'views/users/list'
    about: function(){
        alert("ok");
     console.log("dddddddddddd");
    },
    defaultAction: function(actions){
      // We have no matching route, lets just log what the URL was
      console.log('No route:', actions);
    }
  });

  var initialize = function(){
      console.log("ffffffffffff");
    var app_router = new AppRouter;
    Backbone.history.start();
  };
  return  {
    initialize: initialize
  }
});