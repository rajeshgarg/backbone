// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
var bone = bone|| {}
require.config({
  paths: {
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore-min',
    backbone: 'libs/backbone/backbone-optamd3-min',
    bone: 'libs/require/bone',
    text: 'libs/require/text',
    templates: '../templates'
  }

});

require([

  // Load our app module and pass it to our definition function
  'app',
  'backbone'
 ,'bone'
  // Some plugins have to be loaded in order due to their non AMD compliance
  // Because these scripts are not "modules" they do not pass any values to the definition function below
], function(App,Backbone,bone ){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
//
//  bone.view = Backbone.View.extend({});
//  bone.model = Backbone.Model.extend();
//  bone.collection = Backbone.Collection.extend();
//  bone.controller = Backbone.Router.extend();
//  window.bone = bone;
  App.initialize();
});
