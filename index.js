// -*- mode: web -*-

var XRegExp = require('xregexp');

var url_regex = XRegExp('(?<url>https?://\\S+)');

exports.intermediate_from_text = function (text) {
    var ichunks = [];

    var current_index = 0;
    XRegExp.forEach(text, url_regex, function (match, i) {
        if (match.index > current_index) {
            ichunks.push({ text: text.substring(current_index, match.index - current_index) });
        }
        if (match.url) {
            ichunks.push({ text: match.url, href: match.url });
        }
        current_index = match.index + match[0].length;
    });
    var last_text = text.substring(current_index);
    if (last_text !== "" || ichunks.length === 0) {
        ichunks.push({ text: last_text });
    }

    return ichunks;
};
