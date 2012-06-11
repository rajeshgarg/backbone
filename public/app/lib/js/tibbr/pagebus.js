define(["tibbr"], function (Tibbr) {

    return (function (app, global) {

        return Tibbr.PageBus = {

            debug:false,

            log:function () {
                if (this.debug === false) return;
                var args = Array.prototype.slice.call(arguments), div = document.getElementById('errorDisplay');
                if (div) {
                    div.innerHTML = div.innerHTML + "<br >" + args.join(" ");
                }
                if (global["console"] && console["log"]) console.log("PageBus:", args.join(" "))
            },
            hub:function () {
                return global.tibbrHub;
            },
            publish:function (eventName, data) {
                global.tibbrHub.publish(eventName, data);
                this.log("Publish", eventName)
            },
            subscribe:function (eventName, callBackFunction) {
                var _cb = function (topic, data, subscriberData) {
                    callBackFunction(data);
                };
                global.tibbrHub.subscribe(eventName, _cb, null, null, null);
                this.log("Subscribe", eventName)
            },
            unsubscribe:function (eventName) {
                global.tibbrHub.subscribe(eventName)
            },

            checkDebug:function () {
                if (global.location.href.indexOf("tdebug") > 0 || this.debug) this.debug = true;
            },

            init:function (callBack) {
                //checking if same domain in iframe
                this.checkDebug();
                var manageHub;
                if (global.location.href.indexOf("ifmain") < 0) { //Same domain iframe
                    try {

                        if (!parent.tibbrManagedHub) { //Case where gadget domain and parent window domain are same but pagebus is not initialized in parent window
                            manageHub = this.setup();
                            parent.tibbrManagedHub = manageHub
                        } else { //Case where gadget domain and parent window domain are same and pagebus is already initialized in parent window
                            manageHub = parent.tibbrManagedHub
                        }
                        this.inLine(manageHub, callBack);
                        this.log("init", "Same domain ")
                    } catch (e) { //Parent window and gadget are not in same domain
                        try { //Case where parent window initialized gadget using pagebus API
                            this.ifFrame(callBack);
                            this.log("init", "Different domain ")
                        }
                        catch (e) { //Case where gadget is not initialized with pagebus even though they fall in different domains
                            global.tibbrManagedHub = this.setup()
                            this.inLine(global.tibbrManagedHub, callBack);
                            this.log("init", "Different domains, gadget not created with pagebus, communication would not work")
                        }
                    }
                } else {
                    this.log("init", "Same domain but  using iframe")
                    this.ifFrame(callBack);
                }

            },


            setup:function () {
                var that = this;
                OpenAjax.hub.enableDebug = that.debug;
                var managedHubParams = {
                    onPublish:function (topic, data, pcon, scon) {
                        return true;
                    },
                    onSubscribe:function (topic, scon) {
                        return true;
                    },
                    onSecurityAlert:function (source, alertType) {
                        that.log("setup", source, alertType)
                    }
                };
                this.log("setup: managedHubParams")
                return new OpenAjax.hub.ManagedHub(managedHubParams);


            },

            inLine:function (tibbrManagedHub, callBack) {
                this.log("InLine", "called");

                var that = this,
                inline = new OpenAjax.hub.InlineContainer(tibbrManagedHub, "inline" + Math.floor(Math.random() * 1111), {
                    Container:{onSecurityAlert:function (source, alertType) {
                    }},
                    InlineContainer:{}
                });
                var hubClient = new OpenAjax.hub.InlineHubClient(
                    {HubClient:{ onSecurityAlert:function (source, alertType) {
                    }}, InlineHubClient:{ container:inline}
                    });


                hubClient.connect(function (hc, suc, err) {
                    if (suc) {
                        that.log("InLine hub client connection is succeeded");
                        global.tibbrHub = hubClient;
                        if (typeof(callBack) == "function") {
                            try {
                                callBack()
                            } catch (e) {

                            }
                        } else {
                            that.log("InLineHubConnectedError", err)
                        }
                        that.log("InLine hub client connection is succeeded: before trigger");
                        Tibbr.Event.trigger("tibco.hub.connected");
                        that.log("InLine hub client connection is succeeded: after trigger");
                    } else {
                        that.log("Error inLine Hub Client Connection")
                    }
                });
            },
            ifFrame:function (callBack) {
                var that = this;
                var hubClient = new OpenAjax.hub.IframeHubClient({
                    HubClient:{ onSecurityAlert:function (src, atyp) {
                        that.log(atyp)
                    }}});
                this.log("iFrame Hub client is called");
                hubClient.connect(function (hc, suc, err) {
                    if (suc) {
                        that.log("iframe hub client connection is succeeded");
                        global.tibbrHub = hubClient;
                        if (typeof(callBack) == "function") {
                            try {
                                callBack()
                            } catch (e) {

                            }
                        }
                        that.log("iframe hub client connection is succeeded: before trigger");
                        Tibbr.Event.trigger("tibco.hub.connected");
                        that.log("iframe hub client connection is succeeded: after trigger");
                    } else {
                        that.log("Error iFrame Hub Client Connection")
                    }
                });
                that.log("iframe hub client is called");
            },

            gadgets:function (params, tmh) {
                tmh = tmh || this.setup();
                this.log("Pagebus initialized");
                var that = this, totalGadgets = params.gadgets.length,
                    scrolling = params.scrolling || "auto";
                for (var i = 0; i < totalGadgets; i++) {
                    var gadget = params.gadgets[i],
                        queryString = gadget.queryString || "",
                        style = gadget.style || { border:"black solid 1px", width:"100%", height:"600px" },
                        debug = that.debug ? "&tdebug=1" : "";
                    global["hub_" + gadget.container] = new OpenAjax.hub.IframeContainer(tmh, "iframe_" + gadget.container,
                        {
                            Container:{
                                onSecurityAlert:function (source, alertType) {
                                    that.log("gadgets:onSecurityAlert", source, alertType)
                                }
                            },
                            IframeContainer:{
                                parent:document.getElementById(gadget.container),
                                iframeAttrs:{ id:"iframe_" + gadget.container, scrolling:scrolling, frameborder:"0", marginheight:"0", marginwidth:"0", style:style},
                                uri:params.gadgetURL + gadget.name + ".html?ifmain=1&" + queryString + debug,
                                tunnelURI:params.tunnelURL
                            }
                        }

                    );
                    that.log("iframe container initialized");
                }


            }
        }

    }(Tibbr, window));
});
