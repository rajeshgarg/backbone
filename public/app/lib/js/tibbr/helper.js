define(["jquery", "underscore", "require/underscore-string"], function ($, _, _String) {

    return  (function () {
        var autoLink = function (text, options) {
                options = options || {};
                var newText,
                    urlRegex = /(\b(https?):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig,
                    tibbrRegex = new RegExp("(" + window.location.host + "[^\s]+)", "g");
                newText = text.replace(urlRegex, function (url) {
                    var target = url.match(tibbrRegex) ? '' : (options.target || 'target="_blank"');
                    return '<a href="' + url + '" ' + target + ' >' + url + '</a>';
                });
                delete options.target;
                return $('<div>').append(newText).find("a").attr(options).end().html();
            },
            context = function () {
                return window.prefix || "/";
            },
            imageTag = function (value, options) {
                if (!_.isString(value)) return "<span>Image value should be string</span>";
                var _context;
                if (value.match(/http|ftp|https/)) {
                    _context = "";
                } else if (value.charAt(0) == '/') {
                    _context = "";
                } else {
                    _context = context();
                }
                var src = _context + value, img = $('<img />').attr("src", src);
                if (_.isObject(options)) img.attr(options);
                return $('<div>').append(img).html();
            },
            asset = function (asset) {
                return context().replace(/\/$/, "") + asset || "";
            };

        return {
            autoLink:autoLink,
            imageTag:imageTag,
            context:context,
            asset:asset
        }

    })();

});