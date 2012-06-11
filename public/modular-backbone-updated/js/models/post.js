define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var post = Backbone.Model.extend({
    defaults: {
      score: 10
    },
    initialize: function(){
    },
    url:"posts"
  });
  return post;

});
