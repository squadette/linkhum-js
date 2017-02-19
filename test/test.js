// -*- mode: web; -*-

var should = require('should');

var Linkhum = require('../index');

describe('linkhum-js', function () {
    describe('#intermediate_from_text(), basics', function () {
        var linkhum = new Linkhum();

        it("should return array of hashes for simple text string", function () {
            should(linkhum.intermediate_from_text("foo")).be.deepEqual([ { text: "foo" } ]);
        });

        it("should parse empty string", function () {
            should(linkhum.intermediate_from_text("")).be.deepEqual([ { text: "" } ]);
        });

        it("should parse simple URL as such", function () {
            should(linkhum.intermediate_from_text("https://github.com/")).be.deepEqual([ { text: "https://github.com/",
                                                                                           href: "https://github.com/" } ]);
        });

        it("should parse simple URL within text", function () {
            should(linkhum.intermediate_from_text("foo https://github.com/ bar")).be.deepEqual([ { text: "foo " },
                                                                                                 { text: "https://github.com/",
                                                                                                   href: "https://github.com/" },
                                                                                                 { text: " bar" }]);
        });

        it("should not detect URL with no space", function () {
            should(linkhum.intermediate_from_text("foohttps://github.com/")).be.deepEqual([ { text: "foohttps://github.com/" } ]);
        });

        it ("should ignore http:// w/o URL", function () {
            should(linkhum.intermediate_from_text("should ignore http:// w/o URL")).be.deepEqual([ { text: "should ignore http:// w/o URL" } ]);
        });

        it ("should handle upper-case scheme", function () { // TODO: lowercase scheme in href part
            should(linkhum.intermediate_from_text("HTTP://GOOGLE.COM/")).be.deepEqual([ { text: "HTTP://GOOGLE.COM/",
                                                                                          href: "HTTP://GOOGLE.COM/" }]);
        });
    });

    describe("#intermediate_from_text(), URLs with simple punctuation", function () {
        var linkhum = new Linkhum();

        it("question mark", function () {
            var expected = [ { text: "have you read " }, { text: "https://en.wikipedia.org/wiki/Punctuation",
                                                           href: "https://en.wikipedia.org/wiki/Punctuation" }, { text: "?" } ];

            should(linkhum.intermediate_from_text("have you read https://en.wikipedia.org/wiki/Punctuation?")).be.deepEqual(expected);
        });

        it("dot", function () {
            var expected = [ { text: "Dot can be part of an URL, but we handle it: " }, { text: "https://en.wikipedia.org/wiki/Full_stop",
                                                       href: "https://en.wikipedia.org/wiki/Full_stop" },
                             { text: "." } ];

            should(linkhum.intermediate_from_text("Dot can be part of an URL, but we handle it: https://en.wikipedia.org/wiki/Full_stop.")).be.deepEqual(expected);
        });

        it("comma", function () {
            var expected = [ { text: "I've read " }, { text: "https://en.wikipedia.org/wiki/Comma",
                                                       href: "https://en.wikipedia.org/wiki/Comma" },
                             { text: ", and here is what I found" } ];

            should(linkhum.intermediate_from_text("I've read https://en.wikipedia.org/wiki/Comma, and here is what I found")).be.deepEqual(expected);
        });

        it("final slash", function () {
            var expected = [ { text: "Final slash, like in " }, { text: "https://slashdot.org/",
                                                                  href: "https://slashdot.org/" },
                             { text: ", however, is part of URL" } ];
            should(linkhum.intermediate_from_text("Final slash, like in https://slashdot.org/, however, is part of URL")).be.deepEqual(expected);
        });

        it("hashtag", function () {
            var expected = [ { text: "Trailing hash is also part of URL, like in " }, { text: "https://emberjs.com/#",
                                                                  href: "https://emberjs.com/#" } ];

            should(linkhum.intermediate_from_text("Trailing hash is also part of URL, like in https://emberjs.com/#")).be.deepEqual(expected);
        });

        it("ampersand", function () {
            var expected = [ { text: "Trailing ampersand belongs to URL: " }, { text: "http://example.org/search?foo=bar&",
                                                                                href: "http://example.org/search?foo=bar&" } ];

            should(linkhum.intermediate_from_text("Trailing ampersand belongs to URL: http://example.org/search?foo=bar&")).be.deepEqual(expected);
        });

        it("ellipsis/dot-dot-dot", function () {
            var expected = [ { text: "My favourite punctuation is " }, { text: "https://en.wikipedia.org/wiki/Ellipsis",
                                                                         href: "https://en.wikipedia.org/wiki/Ellipsis" },
                             { text: "..." } ];

            should(linkhum.intermediate_from_text("My favourite punctuation is https://en.wikipedia.org/wiki/Ellipsis...")).be.deepEqual(expected);
        });

    });

    describe("#intermediate_from_text(), URLs surrounded by punctuation", function () {
        var linkhum = new Linkhum();

        it("quotes", function () {
            var expected = [ { text: 'For searching you can use so called "' }, { text: "https://google.com/",
                                                                                  href: "https://google.com/" }, { text: '"' } ];

            should(linkhum.intermediate_from_text('For searching you can use so called "https://google.com/"')).be.deepEqual(expected);
        });

        it("parens around URL", function () {

            var expected = [ { text: 'You can put URLs in parens as usual (' },
                             { text: "https://www.youtube.com/watch?v=P9zYSBK7Blw",
                               href: "https://www.youtube.com/watch?v=P9zYSBK7Blw" }, { text: ")" } ];

            should(linkhum.intermediate_from_text('You can put URLs in parens as usual (https://www.youtube.com/watch?v=P9zYSBK7Blw)')).be.deepEqual(expected);
        });

        it("URL containing parens", function () {
            var expected = [ { text: "Parens as part of URL are handled correctly: " },
                             { text: "https://en.wikipedia.org/wiki/Hours_(2013_film)",
                               href: "https://en.wikipedia.org/wiki/Hours_(2013_film)" } ];

            should(linkhum.intermediate_from_text("Parens as part of URL are handled correctly: https://en.wikipedia.org/wiki/Hours_(2013_film)")).be.deepEqual(expected);
        });

        it("parens around URL containing parens", function () {
            var expected = [ { text: "URL with parens in parens (such as " },
                             { text: "https://en.wikipedia.org/wiki/Hours_(2013_film)",
                               href: "https://en.wikipedia.org/wiki/Hours_(2013_film)" },
                             { text: ") is also ok" } ];

            should(linkhum.intermediate_from_text("URL with parens in parens (such as https://en.wikipedia.org/wiki/Hours_(2013_film)) is also ok")).be.deepEqual(expected);
        });
    });

    describe("micro-syntax", function () {
        var linkhum = new Linkhum({ specials: { xkcd: { regexp: '\\b(?<xkcd>xkcd:(?<xkcd_number>\\d+))\\b',
                                                        formatter: function (match) {
                                                            return { text: match[0],
                                                                     href: "https://xkcd.com/" + match.xkcd_number + "/",
                                                            };
                                                        }
            } } } );

        it("handles simple micro-syntax", function () {
            var expected = [ { text: "Micro-syntax for XCKD: " }, { text: "xkcd:505", href: "https://xkcd.com/505/" } ];
            should(linkhum.intermediate_from_text("Micro-syntax for XCKD: xkcd:505")).be.deepEqual(expected);
        });
    });
});
