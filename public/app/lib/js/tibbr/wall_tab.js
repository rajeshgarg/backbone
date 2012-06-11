define(["order!jquery", "order!require/jquery-ui", "underscore", "tibbr"], function ($, $UI, _, Tibbr) {
    return Tibbr.WallTab = function ($) {

        var counter, content = "", id = "wall-tabs", $tabs, currentIndex,
            add = function (options) {
                $tabs = defaultTemplate($tabs, options.close !== false, options.id);
                content = options.content;
                $tabs.tabs("add", "#" + id + "-" + counter, options.title || "Tibbr Tab " + counter, options.index);
                if(options["switch"]) $tabs.tabs("select", currentIndex);
                counter++;
                return counter - 1;
            },
            addEvents = function (aTabs) {
                $tabs = defaultTemplate($tabs, false);
                $.each(aTabs, function (i, v) {
                    content = v.content;
                    $tabs.tabs("add", "#event" + _.dasherize(v.name), v.name)
                })
            },
            remove = function (index) {
                $("#" + id).tabs("remove", index)
            },
            show = function (index) {
                $("#" + id).tabs("select", index);
            },

            defaultTemplate = function (tabs, displayClose, id) {
                var close = displayClose ? "<span class='ui-icon ui-icon-close'>Remove Tab</span>" : "";
                return  tabs.tabs({
                    tabTemplate:"<li><a href='#{href}'>#{label}</a> " + close + "</li>",
                    add:function (event, ui) {
                        currentIndex = ui.index;
                        if(id) $(ui.tab).attr({"data-id": id, 'data-index': ui.index});
                        $(ui.panel).append($("<p style='margin:0px;'></p>").append(content));
                    }
                })
            },
            iframe = function (src, height) {
                if (height == undefined) {
                    height = 500;
                }
                return '<div class="streams"><iframe id="iframe' + id + counter + '" name="iframe' + id + counter + '" src = " ' + src + '" frameBorder="0" border="0" style="visibility:visible;overflow: auto;width:100%;border:0px;height:' + height + 'px;" src="about:blank"></iframe></div>'
            },
            zoomHeader = function () {
                return "<div id=\"expand-icon-wrap\" class=\"expand-icon-wrap\"><a href=\"#\" id=\"expand-icon\" class=\"expand-icon\">X</a></div>"
            }
            ,
            addWithIframe = function (options) {
                var $content = "";
                if (options.zoomView) {
                    $content = zoomHeader();
                }
                options.content  =  $content + iframe(options.src, options.height);
                return add(options);
            },
            init = function (_id) {
                id = _id;
                var tabs = $("#" + id);
                tabs.tabs({cache:true});
                $tabs = defaultTemplate(tabs, true);
                $tabs.on("click", "span.ui-icon-close", function () {
                    var index = $("li", $tabs).index($(this).parent());
                    $tabs.tabs("remove", index);
                });
                counter = tabs.tabs("length") + 1;
            };

        return {
            add:add,
            init:init,
            show: show,
            addEvents:addEvents,
            addWithIframe:addWithIframe ,
            remove: remove
        }
    }($)
});