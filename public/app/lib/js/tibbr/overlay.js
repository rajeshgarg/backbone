define(['order!jquery', 'order!require/colorbox', 'tibbr'], function ($, $UI, Tibbr) {
    return Tibbr.overlay = (function ($, app, global) {
        var optionsMap = {
                // tibbrOverlayAtrr : overlayLibAtrr i.e. colorbox
                'href':'href',
                'html':'html',
                'closeOnOverlayClick':'overlayClose',
                'opacity':'opacity',
                'initialWidth':'initialWidth',
                'initialHeight':'initialHeight',
                'maxWidth':'maxWidth',
                'maxHeight':'maxHeight',
                'onOpen':'onOpen',
                'onComplete':'onComplete',
                'onClosed':'onClosed',
                'ajax':'ajax',
                'image':'image',
                'enableEscapeButton':"escKey",
                'inline':'inline',
                'iframe':'iframe',
                'data':'data',
                "minWidth":"minWidth",
                "width":"width"
            },
            formatOption = function (opt) {
                var newOpt = {};
                $.each(opt, function (i, item) {
                    if (optionsMap[i])
                        newOpt[optionsMap[i]] = item;
                })
                return newOpt;
            }

        return {
            html:function (options) {
                $.colorbox(options)
            },

            imagePreview:function () {
                $('a.overlay').colorbox({
                    'photo':true,
                    'overlayClose':false,
                    'opacity':0.7
                });
            },
            inline:function (options) {
                $.colorbox(options);
            },

            view:function (view,options) {
                options = options || {}
                $.colorbox({
                    'html':view || "PLEASE PROVIDE BACKBONE.JS",
                    'overlayClose':false,
                    'opacity':0.7,
                    'escKey':true,
                    'initialWidth':120,
                    'initialHeight':60,
                    'maxWidth':1000,
                    'maxHeight':900,
                    'onComplete':function () {
                        $("#cboxLoadedContent").scroll($.colorbox.resize);
                        $("#cboxLoadedContent a").on("click", $.colorbox.resize);
                        $("#cboxLoadedContent a.cancel-btn").on("click", function () {
                            $.colorbox.close();
                            return false;
                        });
                        $("#cboxLoadedContent input, #cboxLoadedContent textarea").on("click, focus", $.colorbox.resize);
                        if(options.onComplete && typeof(options.onComplete)=='function')
                            options.onComplete();
                    },
                    'onClosed':function () {
                        if ($(this).hasClass('refresh')) {
                            location.reload(true);
                            if(options.onClose && typeof(options.onClose)=='function')
                                options.onClose();
                        }
                    }
                })
            },
            render:function (options) {
                var self = this, view = options.view, fetcher = options.fetch;
                if (fetcher.fetched) {
                    self.view(view.render().el)
                } else {
                    fetcher.fetch({success:function () {
                        fetcher.fetched = true;
                        if (fetcher.hasOwnProperty("build")) fetcher.build();
                        self.view(view.render().el);
                    }, beforeSend:function () {
                        self.view(Tibbr.UI.loader);
                    }})
                }
            },
            resize:function () {
                $.colorbox.resize();
            },
            close:function () {
                $.colorbox.close();
            },
            open:function (options) {
                var opt = options || {'html':"Not configured"}
                $.colorbox(formatOption(opt));
            }
        }
    }($, Tibbr, window))
});