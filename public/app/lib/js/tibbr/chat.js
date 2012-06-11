define(
    [
        'jquery'
        , 'underscore'
        , 'backbone'
        , 'tibbr'
        , 'require/strophe'
    ],
    function ($, _, Backbone, Tibbr, Strophe, SoundManager) {

        Tibbr.Chat = function (options) {

            this.options = options;
            this.url = Tibbr.appConfig("chat", "url");
            this.historyUrl = Tibbr.path("/chat/history");
            this.jid = Tibbr.currentUser.jid();
            this.on("connected", this.connected, this);
            this.on("disconnected", this.disconnected, this);
            this.on("play:sound", this.playSound, this);
            _.bindAll(this, 'winBlur', "blinkTitle", "winFocus");
            //this.initSound();

        };
        _.extend(Tibbr.Chat.prototype, Backbone.Events, {
            cookie:new Tibbr.cookie("_c", {path:"/"}),
            strophe:Strophe.strophe,
            $build:Strophe.build,
            $msg:Strophe.msg,
            $iq:Strophe.iq,
            $pres:Strophe.pres,
            waitTime:60,
            holdTime:1,
            sound:null,
            titleTimer:null,
            winActive:true,
            ieActive:document.activeElement,
            winTitle:document.title,
            reconnected:false,
            isConnected:function () {
                return this.connection != null && this.connection.connected
            },

            hasCredential:function () {
                var sid = this.cookie.get("sid"), rid = this.cookie.get("rid");
                return  sid !== undefined && sid !== null && rid !== undefined && rid !== null
            },

            time:function () {
                return new Date().format('h:i a');
            },

            blinkTitle:function () {
                if (this.titleTimer) clearInterval(this.titleTimer);
                var that = this;
                this.titleTimer = setInterval(function () {
                    document.title = document.title === Tibbr.translate("chat.new_message") ? that.winTitle : Tibbr.translate("chat.new_message");
                }, 1000);
            },

            winBlur:function () {
                if (this.ieActive !== document.activeElement) {
                    this.ieActive = document.activeElement;
                    return true;
                }
                this.winActive = false;
                return true;
            },

            winFocus:function () {
                this.winActive = true;
                clearInterval(this.titleTimer);
                document.title = this.winTitle;
                return true;
            },

            start:function () {
                if (this.hasCredential()) {
                    this.attach();
                } else {
                    this.connect();
                }
            },

            connect:function () {
                var pass = "<auth-token>" + Tibbr.$.cookie("_TOKEN") + "</auth-token><client-key>tibbr_server32994309843dskdskjshkhkfs987w98whjdskjhkjdsh</client-key>"
                var that = this , conn = new this.strophe.Connection(this.url);
                conn.connect(this.jid, pass, function (status) {
                    console.log(status, that.strophe.Status);
                    if (status === that.strophe.Status.CONNECTED) {
                        that.trigger('connected');
                    } else if (status === that.strophe.Status.DISCONNECTED) {
                        that.trigger('disconnected');
                    }
                }, this.waitTime, this.holdTime);
                this.connection = conn;

            },

            connected:function () {
                this.cookie.set('sid', this.connection.sid);
                this.cookie.set("connected", 1);
                var iq = this.$iq({to:this.strophe.getDomainFromJid(this.jid), type:"get", id:'disco-1'}).c('query', {xmlns:this.strophe.NS.DISCO_INFO});
                this.connection.sendIQ(iq, null, null);
                this.connection.addHandler(this.options.onMessage, null, "message", "chat");
                this.connection.addHandler(this.options.onPresence, null, "presence");
                this.trigger("chat:connected");
            },

            sendPresence:function () {
                if(this.connection) this.connection.send(this.$pres());
            },

            disconnected:function () {
                this.cookie.empty();
                this.connection = null;
                this.trigger("chat:disconnected");
            },

            disconnect:function () {
                this.connection.disconnect();
                this.disconnected();
            },

            attach:function () {
                if (this.isConnected()) return;
                if (!this.hasCredential()) {
                    this.trigger('disconnected');
                    return;
                }
                var that = this, conn = new this.strophe.Connection(this.url);
                conn.attach(this.jid, this.cookie.get("sid"), this.cookie.get("rid"), function (status) {
                    if (status === that.strophe.Status.DISCONNECTED || status === that.strophe.Status.DISCONNECTING) {
                        that.trigger('disconnected');
                    }
                }, this.waitTime, this.holdTime);
                if (conn.authenticated) {
                    this.connection = conn;
                    this.trigger('connected');
                } else {
                    this.trigger('disconnected');
                }
                this.connection = conn;

            },

            playSound:function () {
                if (!this.winActive) this.blinkTitle();
                if (Tibbr.pCookie.get("sound") === 1 || !this.winActive) {
                    try {
                       // this.sound.play();

                    } catch (e) {/**/
                    }
                }
            },

            initSound:function () {
                var that = this;
                window.soundManager.url = Tibbr.path('images/swf/');
                window.soundManager.useFlashBlock = false;
                window.soundManager.flashVersion = 9;
                window.soundManager.wmode = 'transparent';
                window.soundManager.onload = function () {
                    that.sound = window.soundManager.createSound({
                        id:'chat',
                        volume:30,
                        url:Tibbr.path('images/mp3/chat.mp3'),
                        autoLoad:true
                    });
                }
                    console.log(window.soundManager)
            }

        });

        return Tibbr.Chat

    });