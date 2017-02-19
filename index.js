'use strict'; // -*- mode: web -*-

var XRegExp = require('xregexp');

var url_regex = XRegExp('\\b(?<url>https?://\\S+)', 'i');
var punctuation_regex = XRegExp('[^\\P{Punctuation}#/&-]*$', 'u');

function Linkhum(options) {

}

Linkhum.prototype.intermediate_from_text = function (text) {
    var ichunks = [];

    var current_index = 0;
    var extra_punct = "";
    XRegExp.forEach(text, url_regex, function (match, i) {
        var previous_text = extra_punct + text.substring(current_index, match.index - current_index);
        if (previous_text) {
            ichunks.push({ text: previous_text });
        }

        if (match.url) {
            extra_punct = XRegExp.match(match.url, punctuation_regex);
            if (extra_punct) {
                var url_no_punctuation = match.url.substring(0, match.url.length - extra_punct.length);
                var unbalanced_part = "";
                for (var i = 0; i < url_no_punctuation.length; i++) {
                    switch (url_no_punctuation[i]) {
                        case '(':
                            unbalanced_part = ")" + unbalanced_part;
                            break;

                        case ')':
                            if (unbalanced_part[0] === ")") {
                                unbalanced_part = unbalanced_part.substring(1);
                            }
                            break;
                    }
                }
                if (unbalanced_part) {
                    if (unbalanced_part === extra_punct.substring(0, unbalanced_part.length)) {
                        url_no_punctuation += unbalanced_part;
                        extra_punct = extra_punct.substring(unbalanced_part.length);
                    }
                }
                ichunks.push({ text: url_no_punctuation, href: url_no_punctuation });
            } else {
                ichunks.push({ text: match.url, href: match.url });
            }
        } else {
            extra_punct = "";
        }
        current_index = match.index + match[0].length;
    });
    var last_text = extra_punct + text.substring(current_index);
    if (last_text !== "" || ichunks.length === 0) {
        ichunks.push({ text: last_text });
    }

    return ichunks;
};

module.exports = Linkhum;
