
 require.config({
  paths: {

        jQuery:'lib/js/require/jquery',
        Underscore:'lib/js/require/underscore',
        Backbone:'lib/js/backbone/backbone',
        tmpl:'lib/js/require/tmpl',
        order:'lib/js/require/order'

        
   },
    baseUrl:"/app"

});

require([

  // Load our app module and pass it to our definition function
  'app'
//  ,
//
//  // Some plugins have to be loaded in order due to there non AMD compliance
//  // Because these scripts are not "modules" they do not pass any values to the definition function below
//  'order!lib/js/require/jquery',
//  'order!lib/js/require/underscore',
//  'order!lib/js/backbone/backbone'
], function(App){
    console.log("lllllllllllllllllllllll",App);
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
});