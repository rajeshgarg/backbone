define(["order!jquery"],

    function ($) {

        $.fn.disabledOverlay = function (options) {
            options = options || {};
            var remove = options["remove"] || false;

            function disableElement(obj) {
                var $overlay = $('<div class="disabled-overlay" />')
                    .width(obj.width())
                    .height(obj.height() + 1)
                    .css({
                        'position':'absolute',
                        'background':'white',
                        'left':'0px',
                        'z-index':'9999',
                        'opacity':0.8
                    });
                if (obj.find('.disabled-overlay').length == 0) {
                    obj.prepend($overlay);
                }

            }

            this.each(function () {
                if (remove) {
                    $(this).find('.disabled-overlay').remove();
                } else {
                    disableElement($(this))
                }
            })
        };

        $.fn.csrfToken = function () {
            var token = $("meta[name='csrf-token']").attr("content");

            return  this.each(function () {
                $(this).append('<input type="hidden" name="authenticity_token" value="' + token + '">');
            })
        };


        $.fn.observeField = function (frequency, callback) {
            return this.each(function () {
                var element = $(this);
                var prev = element.val();

                var chk = function () {
                    var val = element.val();
                    if (prev != val) {
                        prev = val;
                        element.map(callback);
                    }
                };
                chk();
                frequency = frequency * 1000;
                var ti = setInterval(chk, frequency);
                element.on('keyup', function () {
                    ti && clearInterval(ti);
                    ti = setInterval(chk, frequency);
                });
            });

        };

        $.fn.ellipsis = function () {
            return this.each(function () {
                var el = $(this);

                if (el.css("overflow") === "hidden") {
                    var text = el.html();
                    var multiline = el.hasClass('multiline');
                    var t = $(this.cloneNode(true))
                            .hide()
                            .css('position', 'absolute')
                            .css('overflow', 'visible')
                            .width(multiline ? el.width() : 'auto')
                            .height(multiline ? 'auto' : el.height())
                        ;

                    el.after(t);

                    function height() {
                        return t.height() > el.height();
                    }

                    function width() {
                        return t.width() > el.width();
                    }

                    var func = multiline ? height : width;

                    while (text.length > 0 && func()) {
                        text = text.substr(0, text.length - 1);
                        t.html(text + "...");
                    }

                    el.html(t.html());
                    if (el.attr("title")) {
                        el.qtip({
                            content:{
                                attr:'title' // Use the ALT attribute of the area map for the content
                            },
                            position:{
                                my:'bottom left',
                                at:'top left',
                                adjust:{
                                    x:15
                                }

                            },
                            style:{
                                classes:'ui-tooltip-tipsy ui-tooltip-shadow',
                                tip:{
                                    corner:true,
                                    mimic:'bottom center',
                                    offset:15
                                }
                            }
                        });
                    }
                    t.remove();
                }
            });
        }

        /**
         * Cookie plugin
         *
         * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
         * Dual licensed under the MIT and GPL licenses:
         * http://www.opensource.org/licenses/mit-license.php
         * http://www.gnu.org/licenses/gpl.html
         *
         */

        $.cookie = function (name, value, options) {
            if (typeof value != 'undefined') { // name and value given, set cookie
                options = options || {};
                if (value === null) {
                    value = '';
                    options.expires = -1;
                }
                var expires = '';
                if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                    var date;
                    if (typeof options.expires == 'number') {
                        date = new Date();
                        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                    } else {
                        date = options.expires;
                    }
                    expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
                }
                // CAUTION: Needed to parenthesize options.path and options.domain
                // in the following expressions, otherwise they evaluate to undefined
                // in the packed version for some reason...
                var path = options.path ? '; path=' + (options.path) : '';
                var domain = options.domain ? '; domain=' + (options.domain) : '';
                var secure = options.secure ? '; secure' : '';
                document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
            } else { // only name given, get cookie
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = $.trim(cookies[i]);
                        // Does this cookie string begin with the name we want?
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
        };


        /**
         * TextAreaExpander plugin for jQuery
         * v1.0
         * Expands or contracts a textarea height depending on the
         * quatity of content entered by the user in the box.
         *
         * By Craig Buckler, Optimalworks.net
         *
         * As featured on SitePoint.com:
         * http://www.sitepoint.com/blogs/2009/07/29/build-auto-expanding-textarea-1/
         *
         * Please use as you wish at your own risk.
         */

            // jQuery plugin definition
        $.fn.TextAreaExpander = function (minHeight, maxHeight) {

            var hCheck = !($.browser.msie || $.browser.opera);

            // resize a textarea
            function ResizeTextarea(e) {

                // event or initialize element?
                e = e.target || e;

                // find content length and box width
                var vlen = e.value.length, ewidth = e.offsetWidth;
                if (vlen != e.valLength || ewidth != e.boxWidth) {

                    if (hCheck && (vlen < e.valLength || ewidth != e.boxWidth)) e.style.height = "0px";
                    var h = Math.max(e.expandMin, Math.min(e.scrollHeight, e.expandMax));

                    e.style.overflow = (e.scrollHeight > h ? "auto" : "hidden");
                    e.style.height = h + "px";

                    e.valLength = vlen;
                    e.boxWidth = ewidth;
                }

                return true;
            }


            // initialize
            this.each(function () {

                // is a textarea?
                if (this.nodeName.toLowerCase() != "textarea") return;

                // set height restrictions
                var p = this.className.match(/expand(\d+)\-*(\d+)*/i);
                this.expandMin = minHeight || (p ? parseInt('0' + p[1], 10) : 0);
                this.expandMax = maxHeight || (p ? parseInt('0' + p[2], 10) : 99999);

                // initial resize
                ResizeTextarea(this);

                // zero vertical padding and add events
                if (!this.Initialized) {
                    this.Initialized = true;
//                    $(this).css("padding-top", 0).css("padding-bottom", 0);
                    $(
                        this).bind("keyup", ResizeTextarea).bind("focus", ResizeTextarea);
                }
            });

            return this;
        };

        /*
         * Simple Placeholder by @marcgg under MIT License
         * Report bugs or contribute on Gihub: https://github.com/marcgg/Simple-Placeholder
         */

        $.simplePlaceholder = {
            placeholderClass:null,

            hidePlaceholder:function () {
                var $this = $(this);
                if ($this.val() == $this.attr('placeholder')) {
                    $this.val("").removeClass($.simplePlaceholder.placeholderClass);
                }
            },

            showPlaceholder:function () {
                var $this = $(this);
                if ($this.val() == "") {
                    $this.val($this.attr('placeholder')).addClass($.simplePlaceholder.placeholderClass);
                }
            },

            preventPlaceholderSubmit:function () {
                $(this).find(".simple-placeholder").each(function (e) {
                    var $this = $(this);
                    if ($this.val() == $this.attr('placeholder')) {
                        $this.val('');
                    }
                });
                return true;
            }
        };

        $.fn.simplePlaceholder = function (options) {
            if (!Modernizr.input.placeholder) {
                var config = {
                    placeholderClass:'placeholder'
                };

                if (options) $.extend(config, options);
                $.simplePlaceholder.placeholderClass = config.placeholderClass;

                this.each(function () {
                    var $this = $(this);
                    $this.focus($.simplePlaceholder.hidePlaceholder);
                    $this.blur($.simplePlaceholder.showPlaceholder);
                    if ($this.val() == '') {
                        $this.val($this.attr("placeholder"));
                        $this.addClass($.simplePlaceholder.placeholderClass);
                    }
                    $this.addClass("simple-placeholder");
                    $(this.form).submit($.simplePlaceholder.preventPlaceholderSubmit);
                });
            }

            return this;
        };


        /************************
         jquery-timepicker
         http://jonthornton.github.com/jquery-timepicker/

         requires jQuery 1.6+
         ************************/


        (function ($) {
            var _baseDate = new Date();
            _baseDate.setHours(0);
            _baseDate.setMinutes(0);
            var _ONE_DAY = 86400;
            var _defaults = {
                className:null,
                minTime:null,
                maxTime:null,
                durationTime:null,
                step:30,
                showDuration:false,
                timeFormat:'g:ia',
                defaultTim:null,
                scrollDefaultNow:false,
                onSelect:function () {
                }
            };

            var methods =
            {
                init:function (options) {
                    return this.each(function () {
                        var self = $(this);

                        // convert dropdowns to text input
                        if (self[0].tagName == 'SELECT') {
                            var input = $('<input />');
                            var attrs = { 'type':'text', 'value':self.val() };
                            var raw_attrs = self[0].attributes;

                            for (var i = 0; i < raw_attrs.length; i++) {
                                attrs[raw_attrs[i].nodeName] = raw_attrs[i].nodeValue;
                            }

                            input.attr(attrs);
                            self.replaceWith(input);
                            self = input;
                        }

                        var settings = $.extend({}, _defaults);

                        if (options) {
                            settings = $.extend(settings, options);
                        }

                        if (settings.minTime) {
                            settings.minTime = _time2int(settings.minTime);
                        }

                        if (settings.maxTime) {
                            settings.maxTime = _time2int(settings.maxTime);
                        }

                        if (settings.durationTime) {
                            settings.durationTime = _time2int(settings.durationTime);
                        }

                        self.data("settings", settings);
                        self.attr('autocomplete', 'off');
                        self.click(methods.show).focus(methods.show).keydown(_keyhandler);
                        self.addClass('ui-timepicker-input');

                        if (self.val()) {
                            var prettyTime = _int2time(_time2int(self.val()), settings.timeFormat);
                            self.val(prettyTime);
                        }

                        var container = $('<span class="ui-timepicker-container" />');
                        self.wrap(container);

                        // close the dropdown when container loses focus
                        $("body").attr("tabindex", -1).focusin(function (e) {
                            if ($(e.target).closest('.ui-timepicker-container').length == 0) {
                                methods.hide();
                            }
                        });

                    });
                },

                show:function (e) {
                    var self = $(this);
                    var list = self.siblings('.ui-timepicker-list');

                    // check if a flag was set to close this picker
                    if (self.hasClass('ui-timepicker-hideme')) {
                        self.removeClass('ui-timepicker-hideme');
                        list.hide();
                        return;
                    }

                    if (list.is(':visible')) {
                        return;
                    }

                    // make sure other pickers are hidden
                    methods.hide();

                    // check if list needs to be rendered
                    if (list.length == 0) {
                        _render(self);
                        list = self.siblings('.ui-timepicker-list');
                    }

                    if ((self.offset().top + self.outerHeight(true) + list.outerHeight()) > $(window).height() + $(window).scrollTop()) {
                        // position the dropdown on top
                        list.css({"top":self.position().top - list.outerHeight()});
                    } else {
                        // put it under the input
                        list.css({"top":self.position().top + self.outerHeight()});
                    }

                    list.show();

                    var settings = self.data("settings");
                    // position scrolling
                    var selected = list.find('.ui-timepicker-selected');

                    if (!selected.length) {
                        if (self.val()) {
                            selected = _findRow(self, list, _time2int(self.val()));
                        } else if (settings.minTime === null && settings.scrollDefaultNow) {
                            selected = _findRow(self, list, _time2int(new Date()));
                        }
                    }

                    if (selected && selected.length) {
                        var topOffset = list.scrollTop() + selected.position().top - selected.outerHeight();
                        list.scrollTop(topOffset);
                    } else {
                        list.scrollTop(0);
                    }
                },

                hide:function (e) {
                    $('.ui-timepicker-list:visible').each(function () {
                        var list = $(this);
                        var self = list.siblings('.ui-timepicker-input');
                        _selectValue(self);

                        list.hide();
                    });
                },

                option:function (key, value) {
                    var self = $(this);
                    var settings = self.data("settings");
                    var list = self.siblings('.ui-timepicker-list');

                    if (typeof key == 'object') {
                        settings = $.extend(settings, key);

                    } else if (typeof key == 'string' && typeof value != 'undefined') {
                        settings[key] = value;

                    } else if (typeof key == 'string') {
                        return settings[key];
                    }

                    if (settings.minTime) {
                        settings.minTime = _time2int(settings.minTime);
                    }

                    if (settings.maxTime) {
                        settings.maxTime = _time2int(settings.maxTime);
                    }

                    if (settings.durationTime) {
                        settings.durationTime = _time2int(settings.durationTime);
                    }

                    self.data("settings", settings);
                    list.remove();
                },

                getSecondsFromMidnight:function () {
                    return _time2int($(this).val());
                },

                setTime:function (value) {
                    var self = $(this);
                    var prettyTime = _int2time(_time2int(value), self.data('settings').timeFormat);
                    self.val(prettyTime);
                }

            };

            // private methods

            function _render(self) {
                var settings = self.data("settings");
                var list = self.siblings('.ui-timepicker-list');

                if (list && list.length) {
                    list.remove();
                }

                list = $('<ul />');
                list.attr('tabindex', -1);
                list.addClass('ui-timepicker-list');
                if (settings.className) {
                    list.addClass(settings.className);
                }

                var zIndex = self.css('zIndex');
                zIndex = (zIndex + 0 == zIndex) ? zIndex + 2 : 2;
                list.css({'display':'none', 'position':'absolute', "left":(self.position().left), 'zIndex':zIndex });

                if (settings.minTime !== null && settings.showDuration) {
                    list.addClass('ui-timepicker-with-duration');
                }

                var durStart = (settings.durationTime !== null) ? settings.durationTime : settings.minTime;
                var start = (settings.minTime !== null) ? settings.minTime : 0;
                var end = (settings.maxTime !== null) ? settings.maxTime : (start + _ONE_DAY - 1);

                if (end <= start) {
                    // make sure the end time is greater than start time, otherwise there will be no list to show
                    end += _ONE_DAY;
                }

                for (var i = start; i <= end; i += settings.step * 60) {
                    var timeInt = i % _ONE_DAY;
                    var row = $('<li />');
                    row.data('time', timeInt)
                    row.text(_int2time(timeInt, settings.timeFormat));

                    if (settings.minTime !== null && settings.showDuration) {
                        var duration = $('<span />');
                        duration.addClass('ui-timepicker-duration');
                        duration.text(' (' + _int2duration(i - durStart) + ')');
                        row.append(duration)
                    }

                    list.append(row);
                }

                self.after(list);
                _setSelected(self, list);

                list.delegate('li', 'click', { 'timepicker':self }, function (e) {
                    self.addClass('ui-timepicker-hideme');
                    self[0].focus();

                    // make sure only the clicked row is selected
                    list.find('li').removeClass('ui-timepicker-selected');
                    $(this).addClass('ui-timepicker-selected');

                    _selectValue(self);
                    list.hide();
                });
            }

            ;

            function _findRow(self, list, value) {
                if (!value && value !== 0) {
                    return false;
                }

                var settings = self.data("settings");
                var out = false;

                // loop through the menu items
                list.find('li').each(function (i, obj) {
                    var jObj = $(obj);

                    // check if the value is less than half a step from each row
                    if (Math.abs(jObj.data('time') - value) <= settings.step * 30) {
                        out = jObj;
                        return false;
                    }
                });

                return out;
            }

            ;

            function _setSelected(self, list) {
                var timeValue = _time2int(self.val());

                var selected = _findRow(self, list, timeValue);
                if (selected && selected.data('time') == timeValue) selected.addClass('ui-timepicker-selected')
            }

            ;

            function _keyhandler(e) {
                var self = $(this);
                var list = self.siblings('.ui-timepicker-list');

                if (!list.is(':visible')) {
                    if (e.keyCode == 40) {
                        self.focus();
                    } else {
                        return true;
                    }
                }
                ;

                switch (e.keyCode) {

                    case 13: // return
                        _selectValue(self);
                        methods.hide.apply(this);
                        e.preventDefault();
                        return false;
                        break;

                    case 38: // up
                        var selected = list.find('.ui-timepicker-selected');

                        if (!selected.length) {
                            var selected;
                            list.children().each(function (i, obj) {
                                if ($(obj).position().top > 0) {
                                    selected = $(obj);
                                    return false;
                                }
                            });
                            selected.addClass('ui-timepicker-selected');

                        } else if (!selected.is(':first-child')) {
                            selected.removeClass('ui-timepicker-selected');
                            selected.prev().addClass('ui-timepicker-selected');

                            if (selected.prev().position().top < selected.outerHeight()) {
                                list.scrollTop(list.scrollTop() - selected.outerHeight());
                            }
                        }

                        break;

                    case 40: // down
                        var selected = list.find('.ui-timepicker-selected');

                        if (selected.length == 0) {
                            var selected;
                            list.children().each(function (i, obj) {
                                if ($(obj).position().top > 0) {
                                    selected = $(obj);
                                    return false;
                                }
                            });

                            selected.addClass('ui-timepicker-selected');
                        } else if (!selected.is(':last-child')) {
                            selected.removeClass('ui-timepicker-selected');
                            selected.next().addClass('ui-timepicker-selected');

                            if (selected.next().position().top + 2 * selected.outerHeight() > list.outerHeight()) {
                                list.scrollTop(list.scrollTop() + selected.outerHeight());
                            }
                        }

                        break;

                    case 27:
                        list.find('li').removeClass('ui-timepicker-selected');
                        list.hide();
                        break;

                    case 9:
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                    case 33:
                    case 34:
                    case 35:
                    case 36:
                    case 37:
                    case 39:
                    case 45:
                        return;

                    default:
                        list.find('li').removeClass('ui-timepicker-selected');
                        return;
                }
            }

            ;

            function _selectValue(self) {
                var settings = self.data('settings')
                var list = self.siblings('.ui-timepicker-list');
                var timeValue = null;

                var cursor = list.find('.ui-timepicker-selected');

                if (cursor.length) {
                    // selected value found
                    var timeValue = cursor.data('time');

                } else if (self.val()) {

                    // no selected value; fall back on input value
                    var timeValue = _time2int(self.val());

                    _setSelected(self, list);
                }

                if (timeValue !== null) {
                    var timeString = _int2time(timeValue, settings.timeFormat);
                    self.attr('value', timeString);
                }

                settings.onSelect.call(self);
                self.trigger('change');
            }

            ;

            function _int2duration(seconds) {
                var minutes = Math.round(seconds / 60);

                if (minutes < 60) {
                    return minutes + ' mins'
                } else if (minutes == 60) {
                    return '1 hr';
                } else {
                    var hours = minutes / 60
                    return hours.toFixed(1) + ' hrs';
                }
            }

            ;

            function _int2time(seconds, format) {
                var time = new Date(_baseDate.valueOf() + (seconds * 1000));
                var output = '';

                for (var i = 0; i < format.length; i++) {

                    var code = format.charAt(i);
                    switch (code) {

                        case 'a':
                            output += (time.getHours() > 11) ? 'pm' : 'am';
                            break;

                        case 'A':
                            output += (time.getHours() > 11) ? 'PM' : 'AM';
                            break;

                        case 'g':
                            var hour = time.getHours() % 12;
                            output += (hour == 0) ? '12' : hour;
                            break;

                        case 'G':
                            output += time.getHours();
                            break;

                        case 'h':
                            var hour = time.getHours() % 12;

                            if (hour != 0 && hour < 10) {
                                hour = '0' + hour;
                            }

                            output += (hour == 0) ? '12' : hour;
                            break;

                        case 'H':
                            var hour = time.getHours();
                            output += (hour > 9) ? hour : '0' + hour;
                            break;

                        case 'i':
                            var minutes = time.getMinutes();
                            output += (minutes > 9) ? minutes : '0' + minutes;
                            break;

                        case 's':
                            var seconds = time.getSeconds();
                            output += (seconds > 9) ? seconds : '0' + seconds;
                            break;

                        default:
                            output += code;
                    }
                }

                return output;
            }

            ;

            function _time2int(timeString) {
                if (timeString == '') return null;
                if (timeString + 0 == timeString) return timeString;

                if (typeof(timeString) == 'object') {
                    timeString = timeString.getHours() + ':' + timeString.getMinutes();
                }

                var d = new Date(0);
                var time = timeString.toLowerCase().match(/(\d+)(?::(\d\d))?\s*([pa]?)/);

                if (!time) {
                    return null;
                }

                var hour = parseInt(time[1] * 1);

                if (time[3]) {
                    if (hour == 12) {
                        var hours = (time[3] == 'p') ? 12 : 0;
                    } else {
                        var hours = (hour + (time[3] == 'p' ? 12 : 0));
                    }

                } else {
                    var hours = hour;
                }

                var minutes = ( time[2] * 1 || 0 );
                return hours * 3600 + minutes * 60;
            }

            ;

            // Plugin entry
            $.fn.timepicker = function (method) {
                if (methods[method]) {
                    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
                }
                else if (typeof method === "object" || !method) {
                    return methods.init.apply(this, arguments);
                }
                else {
                    $.error("Method " + method + " does not exist on jQuery.timepicker");
                }
            };
        })($);


        // ZeroClipboard
// Simple Set Clipboard System
// Author: Joseph Huckaby
        var ZeroClipboard = {

            version:"1.0.7",
            clients:{},
            // registered upload clients on page, indexed by id
            moviePath:'ZeroClipboard.swf',
            // URL to movie
            nextId:1,
            // ID of next movie
            $:function (thingy) {
                // simple DOM lookup utility function
                if (typeof(thingy) == 'string') thingy = document.getElementById(thingy);
                if (!thingy.addClass) {
                    // extend element with a few useful methods
                    thingy.hide = function () {
                        this.style.display = 'none';
                    };
                    thingy.show = function () {
                        this.style.display = '';
                    };
                    thingy.addClass = function (name) {
                        this.removeClass(name);
                        this.className += ' ' + name;
                    };
                    thingy.removeClass = function (name) {
                        var classes = this.className.split(/\s+/);
                        var idx = -1;
                        for (var k = 0; k < classes.length; k++) {
                            if (classes[k] == name) {
                                idx = k;
                                k = classes.length;
                            }
                        }
                        if (idx > -1) {
                            classes.splice(idx, 1);
                            this.className = classes.join(' ');
                        }
                        return this;
                    };
                    thingy.hasClass = function (name) {
                        return !!this.className.match(new RegExp("\\s*" + name + "\\s*"));
                    };
                }
                return thingy;
            },

            setMoviePath:function (path) {
                // set path to ZeroClipboard.swf
                this.moviePath = path;
            },

            dispatch:function (id, eventName, args) {
                // receive event from flash movie, send to client
                var client = this.clients[id];
                if (client) {
                    client.receiveEvent(eventName, args);
                }
            },

            register:function (id, client) {
                // register new client to receive events
                this.clients[id] = client;
            },

            getDOMObjectPosition:function (obj, stopObj) {
                // get absolute coordinates for dom element
                var info = {
                    left:0,
                    top:0,
                    width:obj.width ? obj.width : obj.offsetWidth,
                    height:obj.height ? obj.height : obj.offsetHeight
                };

                if (obj && (obj != stopObj)) {
                    info.left += obj.offsetLeft;
                    info.top += obj.offsetTop;
                }

                return info;
            },

            Client:function (elem) {
                // constructor for new simple upload client
                this.handlers = {};

                // unique ID
                this.id = ZeroClipboard.nextId++;
                this.movieId = 'ZeroClipboardMovie_' + this.id;

                // register client with singleton to receive flash events
                ZeroClipboard.register(this.id, this);

                // create movie
                if (elem) this.glue(elem);
            }
        };

        ZeroClipboard.Client.prototype = {

            id:0,
            // unique ID for us
            ready:false,
            // whether movie is ready to receive events or not
            movie:null,
            // reference to movie object
            clipText:'',
            // text to copy to clipboard
            handCursorEnabled:true,
            // whether to show hand cursor, or default pointer cursor
            cssEffects:true,
            // enable CSS mouse effects on dom container
            handlers:null,
            // user event handlers
            glue:function (elem, appendElem, stylesToAdd) {
                // glue to DOM element
                // elem can be ID or actual DOM element object
                this.domElement = ZeroClipboard.$(elem);

                // float just above object, or zIndex 99 if dom element isn't set
                var zIndex = 99;
                if (this.domElement.style.zIndex) {
                    zIndex = parseInt(this.domElement.style.zIndex, 10) + 1;
                }

                if (typeof(appendElem) == 'string') {
                    appendElem = ZeroClipboard.$(appendElem);
                } else if (typeof(appendElem) == 'undefined') {
                    appendElem = document.getElementsByTagName('body')[0];
                }

                // find X/Y position of domElement
                var box = ZeroClipboard.getDOMObjectPosition(this.domElement, appendElem);

                // create floating DIV above element
                this.div = document.createElement('div');
                this.div.className = "zclip";
                this.div.id = "zclip-" + this.movieId;
                $(this.domElement).data('zclipId', 'zclip-' + this.movieId);
                var style = this.div.style;
                style.position = 'absolute';
                style.left = '' + box.left + 'px';
                style.top = '' + box.top + 'px';
                style.width = '' + box.width + 'px';
                style.height = '' + box.height + 'px';
                style.zIndex = zIndex;

                if (typeof(stylesToAdd) == 'object') {
                    for (addedStyle in stylesToAdd) {
                        style[addedStyle] = stylesToAdd[addedStyle];
                    }
                }

                // style.backgroundColor = '#f00'; // debug
                appendElem.appendChild(this.div);

                this.div.innerHTML = this.getHTML(box.width, box.height);
            },

            getHTML:function (width, height) {
                // return HTML for movie
                var html = '';
                var flashvars = 'id=' + this.id + '&width=' + width + '&height=' + height;

                if (navigator.userAgent.match(/MSIE/)) {
                    // IE gets an OBJECT tag
                    var protocol = location.href.match(/^https/i) ? 'https://' : 'http://';
                    html += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="' + protocol + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="' + width + '" height="' + height + '" id="' + this.movieId + '" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="' + ZeroClipboard.moviePath + '" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="' + flashvars + '"/><param name="wmode" value="transparent"/></object>';
                } else {
                    // all other browsers get an EMBED tag
                    html += '<embed id="' + this.movieId + '" src="' + ZeroClipboard.moviePath + '" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="' + width + '" height="' + height + '" name="' + this.movieId + '" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="' + flashvars + '" wmode="transparent" />';
                }
                return html;
            },

            hide:function () {
                // temporarily hide floater offscreen
                if (this.div) {
                    this.div.style.left = '-2000px';
                }
            },

            show:function () {
                // show ourselves after a call to hide()
                this.reposition();
            },

            destroy:function () {
                // destroy control and floater
                if (this.domElement && this.div) {
                    this.hide();
                    this.div.innerHTML = '';

                    var body = document.getElementsByTagName('body')[0];
                    try {
                        body.removeChild(this.div);
                    } catch (e) {
                        ;
                    }

                    this.domElement = null;
                    this.div = null;
                }
            },

            reposition:function (elem) {
                // reposition our floating div, optionally to new container
                // warning: container CANNOT change size, only position
                if (elem) {
                    this.domElement = ZeroClipboard.$(elem);
                    if (!this.domElement) this.hide();
                }

                if (this.domElement && this.div) {
                    var box = ZeroClipboard.getDOMObjectPosition(this.domElement);
                    var style = this.div.style;
                    style.left = '' + box.left + 'px';
                    style.top = '' + box.top + 'px';
                }
            },

            setText:function (newText) {
                // set text to be copied to clipboard
                this.clipText = newText;
                if (this.ready) {
                    this.movie.setText(newText);
                }
            },

            addEventListener:function (eventName, func) {
                // add user event listener for event
                // event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
                eventName = eventName.toString().toLowerCase().replace(/^on/, '');
                if (!this.handlers[eventName]) {
                    this.handlers[eventName] = [];
                }
                this.handlers[eventName].push(func);
            },

            setHandCursor:function (enabled) {
                // enable hand cursor (true), or default arrow cursor (false)
                this.handCursorEnabled = enabled;
                if (this.ready) {
                    this.movie.setHandCursor(enabled);
                }
            },

            setCSSEffects:function (enabled) {
                // enable or disable CSS effects on DOM container
                this.cssEffects = !!enabled;
            },

            receiveEvent:function (eventName, args) {
                // receive event from flash
                eventName = eventName.toString().toLowerCase().replace(/^on/, '');

                // special behavior for certain events
                switch (eventName) {
                    case 'load':
                        // movie claims it is ready, but in IE this isn't always the case...
                        // bug fix: Cannot extend EMBED DOM elements in Firefox, must use traditional function
                        this.movie = document.getElementById(this.movieId);
                        if (!this.movie) {
                            var self = this;
                            setTimeout(function () {
                                self.receiveEvent('load', null);
                            }, 1);
                            return;
                        }

                        // firefox on pc needs a "kick" in order to set these in certain cases
                        if (!this.ready && navigator.userAgent.match(/Firefox/) && navigator.userAgent.match(/Windows/)) {
                            var self = this;
                            setTimeout(function () {
                                self.receiveEvent('load', null);
                            }, 100);
                            this.ready = true;
                            return;
                        }

                        this.ready = true;
                        try {
                            this.movie.setText(this.clipText);
                        } catch (e) {
                        }
                        try {
                            this.movie.setHandCursor(this.handCursorEnabled);
                        } catch (e) {
                        }
                        break;

                    case 'mouseover':
                        if (this.domElement && this.cssEffects) {
                            this.domElement.addClass('hover');
                            if (this.recoverActive) {
                                this.domElement.addClass('active');
                            }


                        }


                        break;

                    case 'mouseout':
                        if (this.domElement && this.cssEffects) {
                            this.recoverActive = false;
                            if (this.domElement.hasClass('active')) {
                                this.domElement.removeClass('active');
                                this.recoverActive = true;
                            }
                            this.domElement.removeClass('hover');

                        }
                        break;

                    case 'mousedown':
                        if (this.domElement && this.cssEffects) {
                            this.domElement.addClass('active');
                        }
                        break;

                    case 'mouseup':
                        if (this.domElement && this.cssEffects) {
                            this.domElement.removeClass('active');
                            this.recoverActive = false;
                        }
                        break;
                } // switch eventName
                if (this.handlers[eventName]) {
                    for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
                        var func = this.handlers[eventName][idx];

                        if (typeof(func) == 'function') {
                            // actual function reference
                            func(this, args);
                        } else if ((typeof(func) == 'object') && (func.length == 2)) {
                            // PHP style object + method, i.e. [myObject, 'myMethod']
                            func[0][func[1]](this, args);
                        } else if (typeof(func) == 'string') {
                            // name of function
                            window[func](this, args);
                        }
                    } // foreach event handler defined
                } // user defined handler for event
            }

        };

        (function ($) {

            $.fn.zclip = function (params) {

                if (typeof params == "object" && !params.length) {

                    var settings = $.extend({

                        path:'ZeroClipboard.swf',
                        copy:null,
                        beforeCopy:null,
                        afterCopy:null,
                        clickAfter:true,
                        setHandCursor:true,
                        setCSSEffects:true

                    }, params);


                    return this.each(function () {

                        var o = $(this);

                        if (o.is(':visible') && (typeof settings.copy == 'string' || $.isFunction(settings.copy))) {

                            ZeroClipboard.setMoviePath(settings.path);
                            var clip = new ZeroClipboard.Client();

                            if ($.isFunction(settings.copy)) {
                                o.bind('zClip_copy', settings.copy);
                            }
                            if ($.isFunction(settings.beforeCopy)) {
                                o.bind('zClip_beforeCopy', settings.beforeCopy);
                            }
                            if ($.isFunction(settings.afterCopy)) {
                                o.bind('zClip_afterCopy', settings.afterCopy);
                            }

                            clip.setHandCursor(settings.setHandCursor);
                            clip.setCSSEffects(settings.setCSSEffects);
                            clip.addEventListener('mouseOver', function (client) {
                                o.trigger('mouseenter');
                            });
                            clip.addEventListener('mouseOut', function (client) {
                                o.trigger('mouseleave');
                            });
                            clip.addEventListener('mouseDown', function (client) {

                                o.trigger('mousedown');

                                if (!$.isFunction(settings.copy)) {
                                    clip.setText(settings.copy);
                                } else {
                                    clip.setText(o.triggerHandler('zClip_copy'));
                                }

                                if ($.isFunction(settings.beforeCopy)) {
                                    o.trigger('zClip_beforeCopy');
                                }

                            });

                            clip.addEventListener('complete', function (client, text) {

                                if ($.isFunction(settings.afterCopy)) {

                                    o.trigger('zClip_afterCopy');

                                } else {
                                    if (text.length > 500) {
                                        text = text.substr(0, 500) + "...\n\n(" + (text.length - 500) + " characters not shown)";
                                    }

                                    o.removeClass('hover');
                                    alert("Copied text to clipboard:\n\n " + text);
                                }

                                if (settings.clickAfter) {
                                    o.trigger('click');
                                }

                            });


                            clip.glue(o[0], o.parent()[0]);

                            $(window).bind('load resize', function () {
                                clip.reposition();
                            });


                        }

                    });

                } else if (typeof params == "string") {

                    return this.each(function () {

                        var o = $(this);

                        params = params.toLowerCase();
                        var zclipId = o.data('zclipId');
                        var clipElm = $('#' + zclipId + '.zclip');

                        if (params == "remove") {

                            clipElm.remove();
                            o.removeClass('active hover');

                        } else if (params == "hide") {

                            clipElm.hide();
                            o.removeClass('active hover');

                        } else if (params == "show") {

                            clipElm.show();

                        }

                    });

                }

            }


        })($);


    });

