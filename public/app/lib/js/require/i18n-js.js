define(function () {
// Instantiate the object
    var I18n = window.I18n || {};

// Set default locale to english
    I18n.defaultLocale = "en";

// Set default handling of translation fallbacks to false
    I18n.fallbacks = true;

// Set default separator
    I18n.defaultSeparator = ".";

// Set current locale to null
//    I18n.locale = window.locale;

// Set the placeholder format. Accepts `{{placeholder}}` and `%{placeholder}`.
    I18n.PLACEHOLDER = /(?:\{\{|%\{)(.*?)(?:\}\}?)/gm;

    I18n.isValidNode = function (obj, node, undefined) {
        return obj[node] !== null && obj[node] !== undefined;
    };

    I18n.lookup = function (scope, options) {
        var options = options || {}
            , lookupInitialScope = scope
            , translations = I18n.prepareOptions(I18n.translations)
            , messages = translations[options.locale || I18n.currentLocale()]
            , options = I18n.prepareOptions(options)
            , currentScope
            ;
//        console.log(translations, messages, options.locale, I18n.currentLocale() )
        if (!messages) {
            return;
        }

        if (typeof(scope) == "object") {
            scope = scope.join(I18n.defaultSeparator);
        }

        if (options.scope) {
            scope = options.scope.toString() + I18n.defaultSeparator + scope;
        }

        scope = scope.split(I18n.defaultSeparator);

        while (scope.length > 0) {
            currentScope = scope.shift();
            messages = messages[currentScope];

            if (!messages) {
                if (I18n.fallbacks && !options.fallback) {
                    messages = I18n.lookup(lookupInitialScope, I18n.prepareOptions({ locale:I18n.defaultLocale, fallback:true }, options));
                }
                break;
            }
        }

        if (!messages && I18n.isValidNode(options, "defaultValue")) {
            messages = options.defaultValue;
        }

        return messages;
    };

// Merge serveral hash options, checking if value is set before
// overwriting any value. The precedence is from left to right.
//
//   I18n.prepareOptions({name: "John Doe"}, {name: "Mary Doe", role: "user"});
//   #=> {name: "John Doe", role: "user"}
//
    I18n.prepareOptions = function () {
        var options = {}
            , opts
            , count = arguments.length
            ;

        for (var i = 0; i < count; i++) {
            opts = arguments[i];

            if (!opts) {
                continue;
            }

            for (var key in opts) {
                if (!I18n.isValidNode(options, key)) {
                    options[key] = opts[key];
                }
            }
        }

        return options;
    };

    I18n.interpolate = function (message, options) {
        options = I18n.prepareOptions(options);
        var matches = message.match(I18n.PLACEHOLDER)
            , placeholder
            , value
            , name
            ;

        if (!matches) {
            return message;
        }

        for (var i = 0; placeholder = matches[i]; i++) {
            name = placeholder.replace(I18n.PLACEHOLDER, "$1");

            value = options[name];

            if (!I18n.isValidNode(options, name)) {
                value = "[missing " + placeholder + " value]";
            }

            regex = new RegExp(placeholder.replace(/\{/gm, "\\{").replace(/\}/gm, "\\}"));
            message = message.replace(regex, value);
        }

        return message;
    };

    I18n.translate = function (scope, options) {
        options = I18n.prepareOptions(options);
        var translation = I18n.lookup(scope, options);
//        console.log(scope, options)
        try {
            if (typeof(translation) == "object") {
                if (typeof(options.count) == "number") {
                    return I18n.pluralize(options.count, scope, options);
                } else {
                    return translation;
                }
            } else {
                return I18n.interpolate(translation, options);
            }
        } catch (err) {
            return I18n.missingTranslation(scope);
        }
    };

    I18n.localize = function (scope, value) {
        switch (scope) {
            case "currency":
                return I18n.toCurrency(value);
            case "number":
                scope = I18n.lookup("number.format");
                return I18n.toNumber(value, scope);
            case "percentage":
                return I18n.toPercentage(value);
            default:
                if (scope.match(/^(date|time)/)) {
                    return I18n.toTime(scope, value);
                } else {
                    return value.toString();
                }
        }
    };

    I18n.parseDate = function (date) {
        var matches, convertedDate;

        // we have a date, so just return it.
        if (typeof(date) == "object") {
            return date;
        }
        ;

        // it matches the following formats:
        //   yyyy-mm-dd
        //   yyyy-mm-dd[ T]hh:mm::ss
        //   yyyy-mm-dd[ T]hh:mm::ss
        //   yyyy-mm-dd[ T]hh:mm::ssZ
        //   yyyy-mm-dd[ T]hh:mm::ss+0000
        //
        matches = date.toString().match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?(Z|\+0000)?/);

        if (matches) {
            for (var i = 1; i <= 6; i++) {
                matches[i] = parseInt(matches[i], 10) || 0;
            }

            // month starts on 0
            matches[2] -= 1;

            if (matches[7]) {
                convertedDate = new Date(Date.UTC(matches[1], matches[2], matches[3], matches[4], matches[5], matches[6]));
            } else {
                convertedDate = new Date(matches[1], matches[2], matches[3], matches[4], matches[5], matches[6]);
            }
        } else if (typeof(date) == "number") {
            // UNIX timestamp
            convertedDate = new Date();
            convertedDate.setTime(date);
        } else if (date.match(/\d+ \d+:\d+:\d+ [+-]\d+ \d+/)) {
            // a valid javascript format with timezone info
            convertedDate = new Date();
            convertedDate.setTime(Date.parse(date))
        } else {
            // an arbitrary javascript string
            convertedDate = new Date();
            convertedDate.setTime(Date.parse(date));
        }

        return convertedDate;
    };

    I18n.toTime = function (scope, d) {
        var date = I18n.parseDate(d)
            , format = I18n.lookup(scope)
            ;

        if (date.toString().match(/invalid/i)) {
            return date.toString();
        }

        if (!format) {
            return date.toString();
        }

        return I18n.strftime(date, format);
    };

    I18n.strftime = function (date, format) {
        var options = I18n.lookup("date");

        if (!options) {
            return date.toString();
        }

        options.meridian = options.meridian || ["AM", "PM"];

        var weekDay = date.getDay()
            , day = date.getDate()
            , year = date.getFullYear()
            , month = date.getMonth() + 1
            , hour = date.getHours()
            , hour12 = hour
            , meridian = hour > 11 ? 1 : 0
            , secs = date.getSeconds()
            , mins = date.getMinutes()
            , offset = date.getTimezoneOffset()
            , absOffsetHours = Math.floor(Math.abs(offset / 60))
            , absOffsetMinutes = Math.abs(offset) - (absOffsetHours * 60)
            , timezoneoffset = (offset > 0 ? "-" : "+") + (absOffsetHours.toString().length < 2 ? "0" + absOffsetHours : absOffsetHours) + (absOffsetMinutes.toString().length < 2 ? "0" + absOffsetMinutes : absOffsetMinutes)
            ;

        if (hour12 > 12) {
            hour12 = hour12 - 12;
        } else if (hour12 === 0) {
            hour12 = 12;
        }

        var padding = function (n) {
            var s = "0" + n.toString();
            return s.substr(s.length - 2);
        };

        var f = format;
        f = f.replace("%a", options.abbr_day_names[weekDay]);
        f = f.replace("%A", options.day_names[weekDay]);
        f = f.replace("%b", options.abbr_month_names[month]);
        f = f.replace("%B", options.month_names[month]);
        f = f.replace("%d", padding(day));
        f = f.replace("%e", day);
        f = f.replace("%-d", day);
        f = f.replace("%H", padding(hour));
        f = f.replace("%-H", hour);
        f = f.replace("%I", padding(hour12));
        f = f.replace("%-I", hour12);
        f = f.replace("%m", padding(month));
        f = f.replace("%-m", month);
        f = f.replace("%M", padding(mins));
        f = f.replace("%-M", mins);
        f = f.replace("%p", options.meridian[meridian]);
        f = f.replace("%S", padding(secs));
        f = f.replace("%-S", secs);
        f = f.replace("%w", weekDay);
        f = f.replace("%y", padding(year));
        f = f.replace("%-y", padding(year).replace(/^0+/, ""));
        f = f.replace("%Y", year);
        f = f.replace("%z", timezoneoffset);

        return f;
    };

    I18n.toNumber = function (number, options) {
        options = I18n.prepareOptions(
            options,
            I18n.lookup("number.format"),
            {precision:3, separator:".", delimiter:",", strip_insignificant_zeros:false}
        );

        var negative = number < 0
            , string = Math.abs(number).toFixed(options.precision).toString()
            , parts = string.split(".")
            , precision
            , buffer = []
            , formattedNumber
            ;

        number = parts[0];
        precision = parts[1];

        while (number.length > 0) {
            buffer.unshift(number.substr(Math.max(0, number.length - 3), 3));
            number = number.substr(0, number.length - 3);
        }

        formattedNumber = buffer.join(options.delimiter);

        if (options.precision > 0) {
            formattedNumber += options.separator + parts[1];
        }

        if (negative) {
            formattedNumber = "-" + formattedNumber;
        }

        if (options.strip_insignificant_zeros) {
            var regex = {
                separator:new RegExp(options.separator.replace(/\./, "\\.") + "$"), zeros:/0+$/
            };

            formattedNumber = formattedNumber
                .replace(regex.zeros, "")
                .replace(regex.separator, "")
            ;
        }

        return formattedNumber;
    };

    I18n.toCurrency = function (number, options) {
        options = I18n.prepareOptions(
            options,
            I18n.lookup("number.currency.format"),
            I18n.lookup("number.format"),
            {unit:"$", precision:2, format:"%u%n", delimiter:",", separator:"."}
        );

        number = I18n.toNumber(number, options);
        number = options.format
            .replace("%u", options.unit)
            .replace("%n", number)
        ;

        return number;
    };

    I18n.toHumanSize = function (number, options) {
        var kb = 1024
            , size = number
            , iterations = 0
            , unit
            , precision
            ;

        while (size >= kb && iterations < 4) {
            size = size / kb;
            iterations += 1;
        }

        if (iterations === 0) {
            unit = I18n.t("number.human.storage_units.units.byte", {count:size});
            precision = 0;
        } else {
            unit = I18n.t("number.human.storage_units.units." + [null, "kb", "mb", "gb", "tb"][iterations]);
            precision = (size - Math.floor(size) === 0) ? 0 : 1;
        }

        options = I18n.prepareOptions(
            options,
            {precision:precision, format:"%n%u", delimiter:""}
        );

        number = I18n.toNumber(size, options);
        number = options.format
            .replace("%u", unit)
            .replace("%n", number)
        ;

        return number;
    };

    I18n.toPercentage = function (number, options) {
        options = I18n.prepareOptions(
            options,
            I18n.lookup("number.percentage.format"),
            I18n.lookup("number.format"),
            {precision:3, separator:".", delimiter:""}
        );

        number = I18n.toNumber(number, options);
        return number + "%";
    };

    I18n.pluralize = function (count, scope, options) {
        var translation;

        try {
            translation = I18n.lookup(scope, options);
        } catch (error) {
        }

        if (!translation) {
            return I18n.missingTranslation(scope);
        }

        var message;
        options = I18n.prepareOptions(options);
        options.count = count.toString();

        switch (Math.abs(count)) {
            case 0:
                message = I18n.isValidNode(translation, "zero") ? translation.zero :
                    I18n.isValidNode(translation, "none") ? translation.none :
                        I18n.isValidNode(translation, "other") ? translation.other :
                            I18n.missingTranslation(scope, "zero");
                break;
            case 1:
                message = I18n.isValidNode(translation, "one") ? translation.one : I18n.missingTranslation(scope, "one");
                break;
            default:
                message = I18n.isValidNode(translation, "other") ? translation.other : I18n.missingTranslation(scope, "other");
        }

        return I18n.interpolate(message, options);
    };

    I18n.missingTranslation = function () {
        var message = '[missing "' + I18n.currentLocale()
            , count = arguments.length
            ;

        for (var i = 0; i < count; i++) {
            message += "." + arguments[i];
        }

        message += '" translation]';

        return message;
    };

    I18n.currentLocale = function () {
        return (I18n.locale || I18n.defaultLocale);
    };

// shortcuts
    I18n.t = I18n.translate;
    I18n.l = I18n.localize;
    I18n.p = I18n.pluralize;
//    window.myT = I18n;
    return I18n;
});

