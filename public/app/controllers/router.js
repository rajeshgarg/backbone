define(['jQuery'
    , 'Underscore'
    , 'Backbone'
    , 'tibbr'

    , 'controllers/users'


],

    function ($, _, Backbone, Tibbr,   UsersController  ) {
        var setNavigation = function (name) {
            $("#global-nav > li").removeClass("active");
            $("#gn-" + name).addClass("active");
            $("#content").empty().removeClass("search-results-wrap max-width");
            if (name === "event_streams") {
                $("#content").attr("style", "width:100%");
                $("#content").addClass("sans-sidebar");

            } else {
                $("#content").removeAttr("style")
                $("#content").removeClass("sans-sidebar");
            }
            if (name === "static_pages") {
                $("#content").addClass("mobile-app-wrap max-width");
            } else {
                $("#content").removeClass("mobile-app-wrap max-width");
            }
            $("#sidebar").show();
            $("iframe.client-stream").remove();

        };


        return Tibbr.Routes = Tibbr.Router.extend({
            initialize:function () {
//                $('body').append($(Tibbr.UI.loader).hide())
            },
            index:function () {
                setNavigation("home");
                return new HomeController();
            },
            profile:function (id) {
                $("#main-sidebar, #sidebar").empty();
            },
            users:function () {
//                setNavigation("profile");
                new UsersController(arguments)
            },
            groups:function () {
                setNavigation("groups");
                new GroupsController(arguments)
            },
            subjects:function () {
                setNavigation("subjects");
                new SubjectsController(arguments);

            },
            test:function () {
                new TestController(arguments)
            },
            messages:function () {
                setNavigation("home");
                new MessageController(arguments)
            },
            explore:function () {
                setNavigation("people");
                $("#main-sidebar, #sidebar").empty();
                 new ExploreController(arguments)
            },
            events:function () {
                setNavigation("event_streams");
                $("#main-sidebar, #sidebar").empty();
                 new EventsController(arguments)
            },
            static_pages:function () {
                setNavigation("static_pages");
                $("#main-sidebar, #sidebar").empty();
                 new StaticPagesController(arguments)
            }

        })
    });
