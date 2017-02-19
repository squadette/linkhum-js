// -*- mode: web; -*-

var should = require('should');

var linkhum = require('../index');

describe('linkhum-js', function () {
    describe('#intermediate_from_text()', function () {
        it("should return array of hashes for simple text string", function () {
            should(linkhum.intermediate_from_text("foo")).be.deepEqual([ { text: "foo" } ]);
        });
    });
});
