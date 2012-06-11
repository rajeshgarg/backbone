define([ "order!jquery"]
    , function (jQuery) {

        /**
         FCBKcomplete 2.7.5
         - Jquery version required: 1.2.x, 1.3.x, 1.4.x

         Special thanks to Guillermo Rauch <http://devthought.com> for his contribution

         Changelog:
         - 2.00 new version of fcbkcomplete

         - 2.01 fixed bugs & added features
         fixed filter bug for preadded items
         focus on the input after selecting tag
         the element removed pressing backspace when the element is selected
         input tag in the control has a border in IE7
         added iterate over each match and apply the plugin separately
         set focus on the input after selecting tag

         - 2.02 fixed fist element selected bug
         fixed defaultfilter error bug

         - 2.5  removed selected="selected" attribute due ie bug
         element search algorithm changed
         better performance fix added
         fixed many small bugs
         onselect event added
         onremove event added

         - 2.6  ie6/7 support fix added
         added new public method addItem due request
         added new options "firstselected" that you can set true/false to select first element on dropdown list
         autoexpand input element added
         removeItem bug fixed
         and many more bug fixed
         fixed public method to use it $("elem").trigger("addItem",[{"title": "test", "value": "test"}]);

         - 2.7   jquery 1.4 compability
         item lock possability added by adding locked class to preadded option <option value="value" class="selected locked">text</option>
         maximum item that can be added

         - 2.7.1 bug fixed
         ajax delay added thanks to http://github.com/dolorian

         - 2.7.2 some minor bug fixed
         minified version recompacted due some problems

         - 2.7.3 event call fixed thanks to William Parry <williamparry!at!gmail.com>

         - 2.7.4 standart event change call added on addItem, removeItem
         preSet also check if item have "selected" attribute
         addItem minor fix

         - 2.7.5  event call removeItem fixed
         new public method destroy added needed to remove fcbkcomplete element from dome

         */
        /* Coded by: emposha <admin@emposha.com> */
        /* Copyright: Emposha.com <http://www.emposha.com> - Distributed under MIT - Keep this message! */
        /* Copyright: Guillermo Rauch <http://devthought.com/> - Distributed under MIT - Keep this message! */
        /**
         * input_function   - function to get data, should take 2 parameters search string and callback
         * json_url         - url to fetch json object
         * cache            - use cache
         * height           - maximum number of element shown before scroll will apear
         * newel            - show typed text like a element
         * firstselected    - automaticly select first element from dropdown
         * filter_case      - case sensitive filter
         * filter_selected  - filter selected items from list
         * complete_text    - text for complete page
         * maxshownitems    - maximum numbers that will be shown at dropdown list (less better performance)
         * onselect         - fire event on item select
         * onremove         - fire event on item remove
         * maxitimes        - maximum items that can be added
         * delay            - delay between ajax request (bigger delay, lower server time request)
         * addontab         - add first visible element on tab or enter hit
         * attachto         - after this element fcbkcomplete insert own elements
         */
        return (function( $, undefined ) { // taken from latest version of FCBKcomplete (2.8.2)
           $.fn.fcbkcomplete = function(opt) {
                return this.each(function() {
                    function init() {
                        createFCBK();
                        preSet();
                        addInput(0);
                    }

                    function createFCBK() {
                        element.hide();
                        element.attr("multiple", "multiple");
                        if (element.attr("name").indexOf("[]") == -1) {
                            element.attr("name", element.attr("name") + "[]");
                        }

                        holder = $(document.createElement("ul"));
                        holder.attr("class", "holder " +options.validateFunction);

                        if (options.attachto) {
                            if (typeof(options.attachto) == "object") {
                                options.attachto.append(holder);
                            }
                            else {
                                $(options.attachto).append(holder);
                            }

                        }
                        else {
                            element.after(holder);
                        }

                        complete = $(document.createElement("div"));
                        complete.addClass("facebook-auto");
                        //Tibco Modification: creating default div as variable to map click event
                        defaultDiv = $('<div class="default">' + options.complete_text + "</div>");
                        complete.append(defaultDiv);
                        // Tibco Modificaition ends
                        complete.hover(function() {
                            complete_hover = 0; // changed options.complete_hover to complete_hover, taken from latest version
                        }, function() {
                            complete_hover = 1; // changed options.complete_hover to complete_hover, taken from latest version
                        });

                        feed = $(document.createElement("ul"));
                        feed.attr("id", elemid + "_feed");

                        complete.prepend(feed);
                        holder.after(complete);
                        feed.css("width", complete.width());
                    }

                    function preSet() {
                        element.children("option").each(function(i, option) {
                            option = $(option);
                            if (option.hasClass("selected")) {
                                addItem(option.text(), option.val(), true, option.hasClass("locked"));
                                option.attr("selected", "selected");
                            }
                            cache.push({
                                caption: option.text(),
                                value: option.val()
                            });
                            search_string += "" + (cache.length - 1) + ":" + option.text() + ";";
                        });
                    }

                    //public method to add new item
                    $(this).bind("addItem",
                        function(event, data) {
                            addItem(data.title, data.value, 0, 0, 0);
                        });

                    //public method to remove item
                    $(this).bind("removeItem",
                        function(event, data) {
                            var item = holder.children('li[rel=' + data.value + ']');
                            if (item.length) {
                                removeItem(item);
                            }
                        });

                    //public method to remove item
                    $(this).bind("destroy",
                        function(event, data) {
                            holder.remove();
                            complete.remove();
                            element.show();
                        });

                    function addItem() {
                        /*TIBCO modification:-Adding support for type*/
                        var title = arguments[0], value = arguments[1],
                            preadded = arguments[2], locked = arguments[3],
                            focusme = arguments[4];

                        if (!maxItems()) {
                            return false;
                        }
                        var li = document.createElement("li");
                        var txt = document.createTextNode(title);
                        var aclose = document.createElement("a");
                        var liclass = "bit-box" + (locked ? " locked" : "");
                        $(li).attr({
                            "class": liclass,
                            "rel": value
                        });
                        $(li).prepend(txt);
                        $(aclose).attr({
                            "class": "closebutton",
                            "href": "#"
                        });


                        li.appendChild(aclose);
                        holder.append(li);

                        $(aclose).click(function() {
                            removeItem($(this).parent("li"));
                            return false;
                        });

                        if (!preadded) {
                            $("#" + elemid + "_annoninput").remove();
                            var _item;
                            addInput(focusme);
                            if (element.children("option[value=" + value + "]").length) {
                                _item = element.children("option[value=" + value + "]");
                                _item.get(0).setAttribute("selected", "selected");
                                _item.attr("selected", "selected");

                                if (!_item.hasClass("selected")) {
                                    _item.addClass("selected");
                                }
                            }
                            else {
                                var _item = $(document.createElement("option"));
                                _item.attr("value", value).get(0).setAttribute("selected", "selected");
                                _item.attr("value", value).attr("selected", "selected");
                                _item.attr("value", value).addClass("selected");

                                _item.text(title);
                                element.append(_item);
                            }
                            element.change();
                            if (options.onselect) {
                                funCall(options.onselect, element)
                            }

                        }
                        holder.children("li.bit-box.deleted").removeClass("deleted");
                        feed.hide();
                    }

                    function removeItem(item) {

                        if (!item.hasClass('locked')) {
                            item.fadeOut("fast");
                            /*TIBCO modification:-Adding support for type, calling on remove function after remove the element*/
                            var _item = element.children("option[value=" + item.attr("rel") + "]");

                            element.children('option[value="' + item.attr("rel") + '"]').remove();
                            item.remove();
                            element.change();
                            deleting = 0;
                            if (options.onremove) {
                                funCall(options.onremove, element)
                            }
                        }
                    }

                    function addInput(focusme) {
                        var li = $(document.createElement("li"));
                        var input = $(document.createElement("input"));
                        var getBoxTimeout = 0;

                        li.attr({
                            "class": "bit-input",
                            "id": elemid + "_annoninput"
                        });
                        input.attr({
                            "type": "text",
                            "class": "maininput " + options.validateFunction,
                            "autocomplete": "off",
                            "id" :   elemid + "_maininput",
                            "size": "1"
                        });
                        holder.append(li.append(input));

                        input.focus(function() {
                            complete.fadeIn("fast");
                        });

                        input.blur(function() {
                            if (complete_hover) { // changed options.complete_hover to complete_hover, taken from latest version
                                complete.fadeOut("fast");
                            }
                            else {
                                // input.focus(); //Tibco Modified, don't focus on input to prevent the stack overflow issue on IE'
                            }
                        });
                        //Tibco Modified, focusing on input when clicked on default text div
                        defaultDiv.click(function(){
                            input.focus();
                        })
                        // Tibco Modified ends
                        holder.click(function() {
                            input.focus();
                            if (feed.length && input.val().length) {
                                feed.show();
                            }
                            else {
                                feed.hide();
                                // do not display default message
                                if ($("#" + elemid + " option:selected").not(".default").length < 1)
                                    complete.children(".default").show();
                            }
                        });

                        input.keypress(function(event) {
                            if (event.keyCode == 13) {
                                return false;
                            }
                            //auto expand input
                            input.attr("size", input.val().length + 1);
                        });

                        input.keydown(function(event) {
                            //prevent to enter some bad chars when input is empty
                            if (event.keyCode == 191) {
                                event.preventDefault();
                                return false;
                            }
                        });

                        input.keyup(function(event) {
                            var etext = xssPrevent(input.val());

                            if (event.keyCode == 8 && etext.length == 0) {
                                feed.hide();
                                if (!holder.children("li.bit-box:last").hasClass('locked')) {
                                    if (holder.children("li.bit-box.deleted").length == 0) {
                                        holder.children("li.bit-box:last").addClass("deleted");
                                        return false;
                                    }
                                    else {
                                        if (deleting) {
                                            return;
                                        }
                                        deleting = 1;
                                        holder.children("li.bit-box.deleted").fadeOut("fast",
                                            function() {
                                                removeItem($(this));
                                                return false;
                                            });
                                    }
                                }
                            }

                            //Tibco modify  allow empty search string
                            if(etext.length == 0)  return;
                            etext = $.trim(etext);
                            if (event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 37 && event.keyCode != 39) {
                                counter = 0;

                                if (options.json_url) {
                                    if (options.cache && json_cache) {
                                        addMembers(etext);
                                        bindEvents();
                                    }
                                    else {
                                        getBoxTimeout++;
                                        var getBoxTimeoutValue = getBoxTimeout;
                                        setTimeout(function() {
                                                if (getBoxTimeoutValue != getBoxTimeout) return;
                                                //Tibco modify  part start
                                                if (holder.has(".spinner").size() > 0) return;
                                                $("li.no_select").remove();
                                                holder.find(".maininput").after(spinner);
                                                //Tibco modify part end
                                                if(options.input_function)
                                                {
                                                    options.input_function({id: elemid,text: etext,url: options.json_url ,callback: function(data){
                                                        addMembers(etext, data);
                                                        json_cache = true;
                                                        bindEvents();
                                                        holder.find(".spinner").remove();
                                                    }})
                                                }else{
                                                    $.getJSON(options.json_url, {tag: etext},
                                                        function(data) {
                                                            addMembers(etext, data);
                                                            json_cache = true;
                                                            bindEvents();
                                                            holder.find(".spinner").remove();
                                                        });
                                                }

                                            },
                                            options.delay);
                                    }
                                }
                                else {
                                    addMembers(etext);
                                    bindEvents();
                                }
                                complete.children(".default").hide();
                                feed.show();
                            }
                        });
                        if (focusme) {
                            setTimeout(function() {
                                    input.focus();
//                        complete.children(".default").show();
                                },
                                1);
                        }
                    }

                    function addMembers(etext, data) {
                        feed.html('');
                        remains = new Array();
                        if (!options.cache && data != null) {
                            cache = new Array();
                            search_string = "";
                        }

                        addTextItem(etext);
                        var addedIds = [];
                        if (data != null && data.length) {
                            $.each(data,
                                function(i, val) {
                                    cache.push({
                                        caption: val.caption,
                                        value: val.value
                                    });
                                    addedIds.push(cache.length-1)
                                    search_string += "" + (cache.length - 1) + ":" + val.caption + ";";
                                });
                        }


                        var maximum = options.maxshownitems < cache.length ? options.maxshownitems : cache.length;
                        var filter = "i";
                        if (options.filter_case) {
                            filter = "";
                        }

                        var myregexp,
                            match;
                        try {
                            myregexp = eval('/(?:^|;)\\s*(\\d+)\\s*:[^;]*?' + etext + '[^;]*/g' + filter);
                            match = myregexp.exec(search_string);
                        }
                        catch(ex) {
                        }
                        ;

                        var content = '';
                        var excludes = ($("#" + elemid + "_excludes").val() || "").split(",");
                        while (match != null) {
                            var id = match[1];
                            var object = cache[id];
                            if (options.filter_selected && element.children("option[value=" + object.value + "]").hasClass("selected")) {
                                //nothing here...
                            }
                            else if(excludes.indexOf(object.value.toString()) !== -1){
                                //nothing here...
                            }
                            else {
                                if (maximum > 0) {
                                    content += '<li  rel="' + object.value + '">' + itemIllumination(object.caption, etext) + '</li>';
                                    counter++;
                                    maximum --
                                }else{
                                    remains.push(object);
                                }
                            }
                            match = myregexp.exec(search_string);
                        }
                        if(match == null && counter == 0 && addedIds.length > 0){
                            $.each(addedIds,function(i,val){
                                var object = cache[val];
                                if (options.filter_selected && element.children("option[value=" + object.value + "]").hasClass("selected")) {
                                    //nothing here...
                                }
                                else if(excludes.indexOf(object.value.toString()) !== -1){
                                    //nothing here...
                                }
                                else {
                                    if (maximum > 0) {
                                        content += '<li  rel="' + object.value + '">' + itemIllumination(object.caption, etext) + '</li>';
                                        counter++;
                                        maximum --
                                    }else{
                                        remains.push(object);
                                    }
                                }});
                        }
                        if(match == null && counter == 0) content += '<li class="no_select"> ' +Tibbr.Localization.Common.resultNotFound + '"'+etext+'"</li>';
                        feed.append(content);
                        if (remains.length > 0) bindFeedScrollEvent(etext);

                        if (options.firstselected) {
                            focuson = feed.children("li:visible:first");
                            focuson.addClass("auto-focus");
                        }

                        if (counter > options.height) {
                            feed.css({
                                "height": (options.height * 24) + "px",
                                "overflow": "auto"
                            });
                        }
                        else {
                            feed.css("height", "auto");
                        }
                    }

                    function itemIllumination(text, etext) {
                        if (options.filter_case) {
                            try {
                                eval("var text = text.replace(/(.*)(" + etext + ")(.*)/gi,'$1<em>$2</em>$3');");
                            }
                            catch(ex) {
                            }
                            ;
                        }
                        else {
                            try {
                                eval("var text = text.replace(/(.*)(" + etext.toLowerCase() + ")(.*)/gi,'$1<em>$2</em>$3');");
                            }
                            catch(ex) {
                            }
                            ;
                        }
                        return text;
                    }

                    function bindFeedEvent() {
                        var input = $("#" + elemid + "_annoninput").children(".maininput");
                        feed.children("li:not('.no_select')").mouseover(function() {
                            feed.children("li:not('.no_select')").removeClass("auto-focus");
                            $(this).addClass("auto-focus");
                            focuson = $(this);
                            input.val($(this).text()).attr("size", $(this).text().length + 1);
                        });

                        feed.children("li").mouseout(function() {
                            $(this).removeClass("auto-focus");
                            focuson = null;
                        });
                    }

                    function bindFeedScrollEvent(string) {
                        feed.scroll(function() {
                            var $self = $(this);
                            var scrollTop = $self.attr('scrollTop');
                            var scrollHeight = $self.attr('scrollHeight');
                            var windowHeight = $self.attr('clientHeight');
                            var scrollOffset = 0;
                            var content = "";
                            var inLoop = false
                            if (remains.length == 0 || inLoop) return;
                            if (scrollTop >= (scrollHeight - (windowHeight + scrollOffset))) {
                                setTimeout(function() {
                                    for (var i = 0; i < options.maxshownitems; i++) {
                                        var obj = remains[i];
                                        inLoop = true;
                                        if (obj == undefined) continue;
                                        var value = obj.value
                                        if (feed.find("li[rel=" + value + "]").length == 0) {
                                            content += '<li rel="' + value + '">' + itemIllumination(obj.caption, string) + '</li>';
                                        }
                                        remains.splice(i, 1);
                                    }
                                    inLoop = false;
                                    feed.append(content);
                                    bindEvents();
                                }, 50);
                            }
                        });
                    }

                    function removeFeedEvent() {
                        feed.children("li:not('.no_select')").unbind("mouseover");
                        feed.children("li:not('.no_select')").unbind("mouseout");
                        feed.mousemove(function() {
                            bindFeedEvent();
                            feed.unbind("mousemove");
                        });
                    }

// TIBCO Modification: ingored the no result found li to be select on pressing UP/Down arrow key. Changed selector li:visible to li:visible:not('.no_select') all places in following function.
                    function bindEvents() {
                        var maininput = $("#" + elemid + "_annoninput").children(".maininput");
                        bindFeedEvent();
                        feed.children("li:not('.no_select')").unbind("mousedown");
                        feed.children("li:not('.no_select')").mousedown(function() {
                            var option = $(this);
                            /*TIBCO modification:-Adding support for type*/
                            addItem(option.text(), option.attr("rel"), 0, 0, 1);
                            feed.hide();
                            complete.hide();
                        });


                        feed.children("li.no_select").bind("click",function(){
                            holder.find('.maininput').val("");
                        });
                        maininput.unbind("keydown");
                        maininput.keydown(function(event) {
                            if (event.keyCode == 191) {
                                event.preventDefault();
                                return false;
                            }

                            if (event.keyCode != 8) {
                                holder.children("li.bit-box.deleted").removeClass("deleted");
                            }

                            if ((event.keyCode == 13 || event.keyCode == 9) && checkFocusOn()) {
                                var option = focuson;
                                addItem(option.text(), option.attr("rel"), 0, 0, 1);
                                complete.hide();
                                event.preventDefault();
                                focuson = null;
                                return false;
                            }

                            if ((event.keyCode == 13 || event.keyCode == 9) && !checkFocusOn()) {
                                if (options.newel) {
                                    var value = xssPrevent($(this).val());
                                    addItem(value, value, 0, 0, 1);
                                    complete.hide();
                                    event.preventDefault();
                                    focuson = null;
                                    return false;
                                }

                                if (options.addontab) {
                                    focuson = feed.children("li:visible:not('.no_select'):first");
                                    var option = focuson;
                                    addItem(option.text(), option.attr("rel"), 0, 0, 1);
                                    complete.hide();
                                    event.preventDefault();
                                    focuson = null;
                                    return false;
                                }
                            }

                            if (event.keyCode == 40) {
                                removeFeedEvent();
                                if (focuson == null || focuson.length == 0) {
                                    focuson = feed.children("li:visible:not('.no_select'):first");
                                    feed.get(0).scrollTop = 0;
                                }
                                else {
                                    focuson.removeClass("auto-focus");
                                    focuson = focuson.nextAll("li:visible:not('.no_select'):first");
                                    var prev = parseInt(focuson.prevAll("li:visible:not('.no_select')").length, 10);
                                    var next = parseInt(focuson.nextAll("li:visible:not('.no_select')").length, 10);
                                    if ((prev > Math.round(options.height / 2) || next <= Math.round(options.height / 2)) && typeof(focuson.get(0)) != "undefined") {
                                        feed.get(0).scrollTop = parseInt(focuson.get(0).scrollHeight, 10) * (prev - Math.round(options.height / 2));
                                    }
                                }
                                feed.children("li").removeClass("auto-focus");
                                focuson.addClass("auto-focus");
                                $("#" + elemid + "_annoninput").children(".maininput").val(focuson.text()).attr("size",focuson.text().length + 1);
                            }
                            if (event.keyCode == 38) {
                                removeFeedEvent();
                                if (focuson == null || focuson.length == 0) {
                                    focuson = feed.children("li:visible:not('.no_select'):last");
                                    if(focuson.length > 0) // if no li is present then ignore scrolling
                                        feed.get(0).scrollTop = parseInt(focuson.get(0).scrollHeight, 10) * (parseInt(feed.children("li:visible:not('.no_select')").length, 10) - Math.round(options.height / 2));
                                }
                                else {
                                    focuson.removeClass("auto-focus");
                                    focuson = focuson.prevAll("li:visible:not('.no_select'):first");
                                    var prev = parseInt(focuson.prevAll("li:visible:not('.no_select')").length, 10);
                                    var next = parseInt(focuson.nextAll("li:visible:not('.no_select')").length, 10);
                                    if ((next > Math.round(options.height / 2) || prev <= Math.round(options.height / 2)) && typeof(focuson.get(0)) != "undefined") {
                                        feed.get(0).scrollTop = parseInt(focuson.get(0).scrollHeight, 10) * (prev - Math.round(options.height / 2));
                                    }
                                }
                                feed.children("li").removeClass("auto-focus");
                                focuson.addClass("auto-focus");
                                $("#" + elemid + "_annoninput").children(".maininput").val(focuson.text()).attr("size",focuson.text().length + 1);
                            }
                        });
                    }

                    function maxItems() {
                        if (options.maxitems != 0) {
                            if (holder.children("li.bit-box").length < options.maxitems) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                    }

                    function addTextItem(value) {
                        if (options.newel && maxItems()) {
                            feed.children("li[fckb=1]").remove();
                            if (value.length == 0) {
                                return;
                            }
                            var li = $(document.createElement("li"));
                            li.attr({
                                "rel": value,
                                "fckb": "1"
                            }).html(value);
                            feed.prepend(li);
                            counter++;
                        }
                        else {
                            return;
                        }
                    }

                    function funCall(func, item) {
                        var _object = "";
                        for (i = 0; i < item.get(0).attributes.length; i++) {
                            if (item.get(0).attributes[i].nodeValue != null) {
                                _object += "\"_" + item.get(0).attributes[i].nodeName + "\": \"" + item.get(0).attributes[i].nodeValue + "\",";
                            }
                        }
                        _object = "{" + _object + " notinuse: 0}";
                        func.call(func, _object);
                    }

                    function checkFocusOn() {
                        if (focuson == null) {
                            return false;
                        }
                        if (focuson.length == 0) {
                            return false;
                        }
                        return true;
                    }

                    function xssPrevent(string) {
                        string = string.replace(/[\"\'][\s]*javascript:(.*)[\"\']/g, "\"\"");
                        string = string.replace(/script(.*)/g, "");
                        string = string.replace(/eval\((.*)\)/g, "");
                        string = string.replace('/([\x00-\x08,\x0b-\x0c,\x0e-\x19])/', '');
                        return string;
                    }

                    var options = $.extend({
                            json_url: null,
                            cache: false,
                            height: "10",
                            newel: false,
                            addontab: false,
                            firstselected: false,
                            filter_case: false,
                            filter_hide: false,
                            complete_text: "Start to type...",
                            maxshownitems: 30,
                            maxitems: 10,
                            onselect: null,
                            onremove: null,
                            attachto: null,
                            delay: 350,
                            validateFunction: "validateSubjects"
                        },
                        opt);

                    //system variables
                    var holder = null;
                    var feed = null;
                    var complete = null;
                    var counter = 0;
                    var cache = new Array();
                    var remains = new Array();
                    var json_cache = false;
                    var search_string = "";
                    var focuson = null;
                    var deleting = 0;
                    var complete_hover = 1;
                    var defaultDiv = null; //Tibco Modified, added variable to hold default div element

                    var element = $(this);
                    var elemid = element.attr("id");
                    init();
                    element.change();
                    return this;
                });
            };
        })(jQuery); // taken from latest version of FCBKcomplete (2.8.2)


    });