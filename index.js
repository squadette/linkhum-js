'use strict'; // -*- mode: web -*-

var XRegExp = require('xregexp');

var url_regex = XRegExp('\\b(?<url>[hH][tT][tT][pP][sS]?://\\S+)');
var punctuation_regex = XRegExp('[^\\P{Punctuation}#/&-]*$', 'u');

function Linkhum(options) {
    var opt = options || {};

    this._microsyntaxes = opt.microsyntax || {};
    this._microsyntax_names = Object.keys(this._microsyntaxes);

    var that = this;
    var regexes = [url_regex].concat(this._microsyntax_names.map(function (name) {
        return XRegExp(that._microsyntaxes[name].regexp);
    }));
    this._combined_regex = XRegExp.union(regexes);
}

Linkhum.prototype.intermediate_from_text = function (text) {
    var ichunks = [];

    var current_index = 0;
    var extra_punct = "";
    var that = this;
    XRegExp.forEach(text, this._combined_regex, function (match, i) {
        var previous_text = extra_punct + text.substr(current_index, match.index - current_index);
        if (previous_text) {
            ichunks.push({ text: previous_text });
        }

        if (match.url) {
            extra_punct = XRegExp.match(match.url, punctuation_regex);
            if (extra_punct) {
                var url_no_punctuation = match.url.substr(0, match.url.length - extra_punct.length);
                var unbalanced_part = "";
                for (var i = 0; i < url_no_punctuation.length; i++) {
                    switch (url_no_punctuation[i]) {
                        case '(':
                            unbalanced_part = ")" + unbalanced_part;
                            break;

                        case ')':
                            if (unbalanced_part[0] === ")") {
                                unbalanced_part = unbalanced_part.substr(1);
                            }
                            break;
                    }
                }
                if (unbalanced_part) {
                    if (unbalanced_part === extra_punct.substr(0, unbalanced_part.length)) {
                        url_no_punctuation += unbalanced_part;
                        extra_punct = extra_punct.substr(unbalanced_part.length);
                    }
                }
                ichunks.push({ text: url_no_punctuation, href: url_no_punctuation });
            } else {
                ichunks.push({ text: match.url, href: match.url });
            }
        } else {
            for (var i = 0; i < that._microsyntax_names.length; i++) {
                var microsyntax_name = that._microsyntax_names[i];
                if (typeof match[microsyntax_name] !== "undefined") {
                    var tmp = that._microsyntaxes[microsyntax_name].formatter(match);
                    tmp.microsyntax = microsyntax_name;
                    ichunks.push(tmp);
                    break;
                }
            }
            extra_punct = "";
        }
        current_index = match.index + match[0].length;
    });
    var last_text = extra_punct + text.substr(current_index);
    if (last_text !== "" || ichunks.length === 0) {
        ichunks.push({ text: last_text });
    }

    return ichunks;
};

module.exports = Linkhum;
