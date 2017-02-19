// -*- mode: web; -*-

var should = require('should');

var linkhum = require('../index');

describe('linkhum-js', function () {
    describe('#intermediate_from_text()', function () {
        it("should return array of hashes for simple text string", function () {
            should(linkhum.intermediate_from_text("foo")).be.deepEqual([ { text: "foo" } ]);
        });

        it("should parse empty string", function () {
            should(linkhum.intermediate_from_text("")).be.deepEqual([ { text: "" } ]);
        });

        it ("should parse simple URL as such", function () {
            should(linkhum.intermediate_from_text("https://github.com/")).be.deepEqual([ { text: "https://github.com/",
                                                                                           href: "https://github.com/" } ]);
        });

        it ("should parse simple URL within text", function () {
            should(linkhum.intermediate_from_text("foo https://github.com/ bar")).be.deepEqual([ { text: "foo " },
                                                                                                 { text: "https://github.com/",
                                                                                                   href: "https://github.com/" },
                                                                                                 { text: " bar" }]);
        });

        it ("should not detect URL with no space", function () {
            should(linkhum.intermediate_from_text("foohttps://github.com/")).be.deepEqual([ { text: "foohttps://github.com/" } ]);
        });
    });
});
