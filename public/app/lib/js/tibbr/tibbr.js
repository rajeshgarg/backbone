/**
 * ALL The tibbr module
 */

define(['jquery'
    , 'underscore'
    , 'require/underscore-string'
    , 'backbone'
    , 'routes'
    , 'modules/helper'
    , 'tmpl' 
    , "modules/tibbr_cache"
]
    , function ($, _, _String, Backbone, routes, Helper, tmpl,  Cache) {
        var Tibbr = Tibbr || {};

        Tibbr.Helper = Helper;
        Tibbr.context = Helper.context;
        Tibbr.asset = Helper.asset;

        Tibbr.$ = $;
        Tibbr._ = _;
        if (Tibbr.cache === undefined)
            Tibbr.cache = Cache;

        Tibbr.debug = window._debug_ || false;
        Tibbr.dateRegExp = new RegExp("([0-9]*)-([0-9]*)-([0-9]*)T(.*)[+|-](.*)");
        Tibbr.serverDateFormat = "YYYY-MM-DD";
        Tibbr.serverDateFormatLong = "YYYY-MM-DD h:mma";
        Tibbr.serverDatePickerFormat = "yy-mm-dd";
        Tibbr.dateSeparator = "-";
        Tibbr.wikiRegex = /@\[[^\]]+\]/igm;
        Tibbr._CSFR_TOEKN = $("meta[name='csrf-token']").attr("content");

        // assign i18n to tibbr
//        Tibbr.i18n = I18n.translations[I18n.locale] || I18n.translations[I18n.defaultLocale];
//
//        Tibbr.i18n.defaults.date.months = Tibbr.i18n.defaults.date.months.split("_");
//        Tibbr.i18n.defaults.date.monthsShort = Tibbr.i18n.defaults.date.monthsShort.split("_");
//        Tibbr.i18n.defaults.date.weekdays = Tibbr.i18n.defaults.date.weekdays.split("_");
//        Tibbr.i18n.defaults.date.weekdaysShort = Tibbr.i18n.defaults.date.weekdaysShort.split("_");
//        Tibbr.i18n.defaults.date.weekdaysMini = Tibbr.i18n.defaults.date.weekdaysMini.split("_");

//        Tibbr.dateFormat = I18n.t("defaults.date.longDateFormat");

        //todo: make it working with html5 pushState
        Tibbr.pushState = function () {
            //for the moment by default its not pushState
            return false;
//            return typeof history.pushState == "function";
        };

//        Tibbr.UI = {
//            loader:'<img src="' + Tibbr.context() + 'images/line-loader.gif" width="116" height="42" class="line-loader" >',
//            spinner:'<img src="' + Tibbr.context() + 'images/spinner.gif" width="16" height="16" class="spinner" >',
//            spinnerSquare:'<img src="' + Tibbr.context() + 'images/loading_sm.gif" class="spinner-square" >'
//        };
//
//        window.spinner = Tibbr.UI.spinner;
//        window.spinnerSquare = Tibbr.UI.spinnerSquare; //Can be used with non-white backgrounds where round spinner looks bad

        //
       
        /**
         * help abort all the current ajax call
         */
        Tibbr.xhrPool = [];
        Tibbr.xhrPool.abortAll = function () {
            _.each(this, function (jqXHR) {
                jqXHR.abort();
            });
        };
        $.ajaxSetup({
            beforeSend:function (jqXHR) {
                Tibbr.xhrPool.push(jqXHR);
            }
        });


        /**
         * Tibbr translate  as rails translate t
         * usages: t("user.name"), t("user.status %s", "online")
         *
         */

//        Tibbr.translate = i18n.translate;


        Tibbr._try = function (method, args, rescue) {
            args = args || [];
            try {
                return this[method].apply(this, args);
            } catch (e) {
                if (typeof rescue == "function") return rescue(e);

            }
        };

        Tibbr.bindZClip = function () {
            $('a.copy_link').each(function () {
                var link = $(this).data("link");
                $(this).zclip({
                    path:Tibbr.path('images/swf/ZeroClipboard.swf'),
                    copy:link,
                    afterCopy:function () {
                        alert(link)
                    }
                });
            })
        };


        /**
         * jquery template image tag
         */
        window._imageTag = Helper.imageTag

        $.extend($.tmpl.tag, {
            'imageTag':{
                _default:{$2:"null" },
                open:"if($notnull_1){__=__.concat(_imageTag($1,$2));}"
            }
        });


        /**
         * Tibbr template with jquery tmpl
         */
        Tibbr.Template = function () {
            return {
                render:function (template, data) {
                    var oldT = window.t, oldH = window.helper, tmpl;
                    window.t = Tibbr.translate;
                    window.helper = Helper;
                    tmpl = $.tmpl(template, data);
                    window.t = oldT;
                    window.helper = oldH;
                    return tmpl;
                }
            }

        };

        /**
         * Return tibbr server url base of tibbr_content
         * @param controller = controller_name
         * @param action  = action_name
         * @param id      =  Number user_id, message_id, subject_id
         */

        Tibbr.serverUrl = function (controller, action, id) {
            var url, generateURL = (function () {
                url = Tibbr.context() + controller;
                if (_.isNumber(id)) {
                    url = url + "/" + id;
                }
                if (action) {
                    url = url + "/" + action
                }
                return url;
            }());


            return url
        };
        /**
         * return tibbr client url base on html5 pushState
         * @param url  string url "/users/2"
         */
        Tibbr.url = function (url) {
            url = (url.charAt(0) == '/' ? '' : '/') + url;
            return Tibbr.pushState() ? url : "#" + url;
        };

        Tibbr.rootUrl = Tibbr.context;

        /**
         * return tibbr host url
         */
        Tibbr.host = function () {
            var loc = window.location,
                ulr = loc.protocol + "//" + loc.hostname;
            if (loc.port !== "") {
                ulr += ":" + loc.port;
            }
            return ulr + Tibbr.context();
        };

        /**
         * return tibbr client path
         * @param url  string url "/users/2"
         */
        Tibbr.path = function (url) {
            url = url.replace(/^\//, "");
            return  Tibbr.context() + url;
        };

        //to store data, currently using browser memory to store date
        Tibbr.Store = function () {

            this.data = [];
            this.reset = function () {
                this.data = [];
            };

            this.find = function (id, scope) {
                return _.find(this.data, function (obj) {
                    return (obj.scope === scope && obj.id === id)
                })
            };


            this.set = function (options) {
                var existed = this.find(options.id, options.scope)
                if (existed) {
                    this.data = _.reject(this.data, function (item) {
                        return item == existed
                    });
                }
                this.data.push(options);
            };

            this.get = function (id, scope) {
                return (this.find(id, scope) || {}).data;
            };
        };


        Tibbr.data = new Tibbr.Store();


        Tibbr.appConfig = function () {

        };


        //Tibbr Cookies
        Tibbr.cookie = function (key, options) {
            options = options || {};
            var path = options.path || "/", expires = options.expires, cookies = {};

            options = {path:path, expires:expires};

            function getCookie() {
                var _cookie = $.cookie(key) || "{}";
                cookies = JSON.parse(_cookie);
            }

            function setCookie() {
                var _cookie = JSON.stringify(cookies);
                $.cookie(key, _cookie, options)
            }

            return{
                get:function (key) {
                    getCookie();
                    return cookies[key];
                },

                set:function (key, value) {
                    cookies[key] = value;
                    setCookie()
                },
                empty:function () {
                    cookies = {};
                    $.cookie(key, "", options);
                }
            }
        };

        Tibbr.pCookie = new Tibbr.cookie("_p", {path:"/", expires:360});

        //Tibbr redirect

        Tibbr.redirectTo = function (url) {
            return Tibbr.app.navigate(Tibbr.url(url), true);
        };

        //Tibbr   separator:"__%__",
        Tibbr.separator = "__%__";

        //assign the routes to tibbr
        Tibbr.routes = routes;

        //Extend backbone model to tibbr.model
        Tibbr.Model = Backbone.Model.extend({
            dataSet:Tibbr.data,
            /**
             * return tibbr api url
             */
            _url:Tibbr.url,
            /**
             * return tibbr assert path
             */
            _path:Tibbr.path,
            /**
             * build model url base on baseName define in each model
             * return url
             */
            url:function () {
                if (!this.baseName) {
                    throw("Please provide a baseName  to the model:", this)
                }
                if (!this.id) return this.baseName;
                return this._path(this.baseName + (this.baseName.charAt(this.baseName.length - 1) == '/' ? '' : '/') + this.id);
            },
            /**
             *  call model  api action
             * @param action  String
             * @param type   read|update|create|delete
             * @param options  other ajax options
             */
            action:function (action, type, options) {
                options || (options = {});
                var model = this, success = options.success, id = "";

                options.processData = true;
                if (this.id) id = this.id + "/";
                options.url = this._path(this.baseName + (this.baseName.charAt(this.baseName.length - 1) == '/' ? '' : '/') + id + action);
                options.success = function (resp, status, xhr) {
                    if (!model.set(model.parse(resp, xhr), options)) return false;
                    if (success) success(model, resp);
                };
                return (this.sync || Backbone.sync).call(this, type, this, options);

            },
            get:function (attribute, defaultValue) {
                if (defaultValue === undefined)
                    defaultValue = "";
                var val = Backbone.Model.prototype.get.call(this, attribute);
                return val == null ? defaultValue : val;
            },
//            displayDate:function (moment, dateField) {
//                dateField = dateField || "created_at";
//                var tDate = this.get(dateField);
//                if (_.isEmpty(tDate)) return  "";
//                var today = moment(), date = moment(tDate), days = today.diff(date, "days");
//                if (days === 0) {
//                    return date.format(Tibbr.dateFormat.T);
//                } else {
//                    return date.format(Tibbr.dateFormat.LLLL);
//                }
//
//            },
            "_try":Tibbr._try
        });

        //Application Event
        Tibbr.Event = {};
        _.extend(Tibbr.Event, Backbone.Events, {cid:"tibbr_event"});

        //Extend backbone view to tibbr view with template equals to Tibbr.template
        Tibbr.View = Backbone.View.extend({
            template:new Tibbr.Template(),
            dataSet:Tibbr.data,
            event:Tibbr.Event,
            t:Tibbr.translate,
            params:function () {
                return window._params_ || {}
            },
            "_try":Tibbr._try
        });

        //Extend backbone collection to tibbr collection
        Tibbr.Collection = Backbone.Collection.extend({
            dataSet:Tibbr.data,
            event:Tibbr.Event,
            /**
             * generate tibbr server url
             * this.scope_id depend on the current scope user, messages or subject
             * this.scope_id can be number or string "Message|Message_id" : "message|2"
             */
            url:function () {
                var url = this._getTibbrUrl(), id = this._getUrlId();
                if (!url) return;
                return Tibbr.serverUrl(url.controller, url.action, id);
            },

            _getTibbrUrl:function () {
                return (typeof this.tibbrURL == "function") ? this.tibbrURL(this) : this.tibbrURL;
            },

            _getUrlId:function () {
                var id;
                if (this.scopeId === undefined) {
                    id = null;
                }
                else if (_.isNumber(this.scopeId)) {
                    id = this.scopeId;
                } else {
                    id = this.scopeId.split("|")[1]
                }
                return id;
            },

            _setPagination:function (options) {
                this.current_page = options.current_page;
                this.per_page = options.per_page;
                this.total_pages = options.total_pages;
                this.total_entries = options.total_entries;
                this.hasMorePages = options.total_pages > this.current_page;
                this.hasPreviousPage = this.current_page > 1;
                this.nextPage = this.hasMorePages ? (this.current_page * 1) + 1 : null;
                this.previousPage = this.hasPreviousPage ? (this.current_page * 1) - 1 : null;
            },

            parse:function (data) {
                this._setPagination(data);
                this.fetched = true;
                //store in tibbr store
                if (!this.extraParams) this.dataSet.set({id:this.className, data:data, scope:this.scopeId})

                if (this.writeToCacheKey) {
                    Tibbr.cache.write(this.writeToCacheKey, data);
                    this.writeToCacheKey = null;
                }
//                return data.items;
                return data.items == undefined && _.isArray(data) ? data : data.items;
            },

            fetchFromCache:function (cacheKey, options) {
                var rawData = Tibbr.cache.read(cacheKey);
                if (rawData.error) {
                    if (rawData.error.code == 0) {
                        if (options.updateCache) {
                            this.writeToCacheKey = cacheKey;
                            return false;
                        }
                        if (_.include(Tibbr.currentUser.cachedKeys, cacheKey)) {
                            var self = this;
                            Tibbr.currentUser.syncUpCache({success:function (data) {
                                rawData = Tibbr.cache.read(cacheKey);
                                self._addFromRawData(rawData, options)
                            }});
                            return true;
                        }
                    }
                }
                else {
                    this._addFromRawData(rawData, options)
                    return true;
                }
            },
            _addFromRawData:function (rawData, options) {
                this.reset([], {silent:true});
                var data = this.parse(rawData);
                this.add(data);
                if (typeof(options.success) == "function") {
                    options.success(this);
                }
            },
            _set:function (data, options) {
                var models = data.items || [];
                options || (options = {});
                this.each(this._removeReference);
                this._setPagination(data);
                this._reset();
                this.add(models, {silent:true});
                if (!options.silent) this.trigger('reset', this, options);
                return this;
            },


            setParams:function (options, reset) {
                if (reset || !this.dataParams) this.dataParams = {params:{page:1, per_page:10}}
                this.dataParams = _.extend(this.dataParams, options);
            },

            getParams:function (key) {
                return key ? (this.dataParams || {})[key] : (this.dataParams || {})
            },

            paginate:function (param, options) {
                if (param)
                    this.setParams(param, true)
                options = options || {};
                var sendToserver = true;
                if (options.cacheKey && this.dataParams.params.page == 1)
                    sendToserver = !(this.fetchFromCache(options.cacheKey, options || {}));

                if (sendToserver)
                    this._paginateFetch(options);
            },

            _oldFetch:function (options) {
                Backbone.Collection.prototype.fetch.call(this, options)
            },

            fetch:function (options) {
                options = options ? options : {};
                var sendToserver = true;
                if (options.cacheKey && !options.data)
                    sendToserver = !(this.fetchFromCache(options.cacheKey, options));
                if (sendToserver)
                    this._oldFetch(options);
            },

            _paginateFetch:function (options) {
                options['data'] = this.dataParams;
                options["append"] ? this.fetchMore(options) : this._oldFetch(options);
            },

            fetchMore:function (options) {
                options = options || {};
                var collection = this,
                    success = options.success;
                options.success = function (resp, status, xhr) {
                    _(collection.parse(resp, xhr)).each(function (item) {
                        if (!collection.get(item.id)) {
                            collection.add(item, {silent:true});
                        }
                    });
                    if (!options.silent) collection.trigger('reset', collection, options);
                    if (success) success(collection, resp);
                };
                return (this.sync || Backbone.sync).call(this, 'read', this, options);
            },
            /**
             * get data form tibbr store or fetch and store to tibbr database for the future use.
             * @param params, used for fetch with extra  params
             */
            getOrFetch:function (params) {
                // we need className and scope_id to find the data form tibbrStore
                if (!this.className && !this.scopeId) {
                    throw("Please provide a className function to the collection:", this)
                }
                var data;
                // call fresh call for extra params
                if (!params) {
                    data = this.dataSet.get(this.className, this.scopeId)
                } else {
                    this.extraParams = true;
                }
                if (data) {
                    this._set(data);
                } else {
                    this.fetch(params || {});
                }
            },

            "_try":Tibbr._try
        });

        //Extend backbone routes to tibbr router
        // support for rails like patterns controller/id/action
        Tibbr.Router = Backbone.Router.extend({
            template:new Tibbr.Template(),
            dataSet:Tibbr.data,
            event:Tibbr.Event,
            routes:routes,
            /**
             * build params json object from arguments
             * @arg = arguments
             */
            tibbrParams:function (arg) {
                if ((arg || []).length === 0) {
                    this.params = {action:"index"};
                    return;
                }
                var args = arg[0].split("?"), action_id = (args[0] || "/index").split("/"),
                    paramString = (args[1] || "").split("&"), params = {};
                if (action_id.length > 1) {
                    params["action"] = action_id[1];
                    if (action_id[0])params["id"] = action_id[0];

                }
                else if (action_id.length === 1 && !_.isNaN(parseInt(action_id[0]))) {
                    params["action"] = "show";
                    params["id"] = action_id[0];
                }
                else {
                    params["action"] = action_id[0];
                }
                _.each(paramString, function (value) {
                    if (value) {
                        var param = value.split('=');
                        params[param[0]] = param[1];
                    }
                });

                this.params = window._params_ = params;
            },
            "_try":Tibbr._try

        });


        Tibbr.Controller = Tibbr.Router.extend({
            routes:{},
            event:Tibbr.Event,
            initialize:function (arg) {
                this.tibbrParams(arg);
                Tibbr.xhrPool.abortAll(); //aborting all going ajax call before changing the page
                this.actionName = this.params.action.toLowerCase();  //get action name in lowercase
                if (typeof this.beforeFilter == 'function') this.beforeFilter(); //call before filter
                if (typeof this[this.actionName] == 'function') {
                    this._try(this.actionName, [], function (e) {
                        console.log("SOME THING WENT WRONG", e)
                    });
                    window.scrollTo(0, 0);
                } else {
                    if (Tibbr.debug) {
                        console.warn("Action not found");
                    } else {
                        console.log("404 PAGE NOT FOUND")
                    }
                }
            }
        });

        if (Tibbr.debug) {
            window.Tibbr = Tibbr;
        }


        var TIB = window.TIB || {};
        TIB.ClientStream = {
            getConfig:function (appName, version) {
                return Tibbr.appConfig("client_stream", "config", appName, version);
            }
        };
        TIB.Event = Tibbr.Event;

        //setting TIB to window
        window.TIB = TIB;

        String.prototype.toDateArray = function () {
            var d = Tibbr.dateRegExp.exec(this);
            var d1 = d[4].split(":");
            return [d[1], d[2], d[3]].concat(d1)
        };
        return Tibbr;
    });

String.prototype.toInt = function () {
    return (this * 1);
}
