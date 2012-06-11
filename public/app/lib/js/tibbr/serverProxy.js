define(['order!jquery', 'tibbr'], function ($, Tibbr) {
    return Tibbr.serverProxy = (function ($, app, global) {
        var pollHandler = null,
            pollToServer = function () {
                var pollData = {
                    "params":{ "set_actions":true,
                        "subscription_requests":{"user_id":Tibbr.currentUser.id},
                        'notifications':{"status":"unread", "count":10}
                    }
                };
                app.currentUser.action("combined_apis", "read", {data:pollData, success:function (data) {
                    app.currentUser.trigger("badges:updated", data.get("badges"));
                    app.currentUser.trigger("notification:updated", data.get("notifications"));
                    app.currentUser.trigger("subscriptionReqest:updated", data.get("subscription_requests"));//data.get("notifications")
                }})

            },
            resetPoll = function () {
                if (pollHandler)
                    global.clearInterval(this.pollHandler)
            };
        return {
            initPolling:function () {
                resetPoll();
                this.pollHandler = global.setInterval(function () {
                    pollToServer();
                }, app.appConfig("webui", "config", "wall_polling_interval", {'default':60}) * 1000);

            },
            poll:pollToServer,
            stopPolling:resetPoll

        }
    })($, Tibbr, window);
});