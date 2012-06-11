// Filename: views/home/main
define([
  'jquery',
  'underscore',
  'backbone',

  'text!templates/home/main.html'
], function($, _, Backbone , mainHomeTemplate){

   bone.mainHomeView = Backbone.View.extend({
    el: $("#page"),
    
    render: function(){
        console.log(this.options.model);
      this.el.html(mainHomeTemplate );
    }
  });
  return   bone.mainHomeView;
});
