global.ROOT_DIR = process.cwd() || __dirname;

var expect = require("chai").expect;
var MemoCache = require(ROOT_DIR + "/rocks/memocache/memocache");

describe("unit.memocache", function() {
    var mcache;

    before(function() { mcache = new MemoCache({maxSize:50}); });

    after(function() { delete(mcache); });

    describe("initial", function() {
        it("must have an empty cache", function() {
            expect(mcache).to.be.ok;
            expect(mcache.size()).to.be.equal(0);
            expect(mcache.keys().length).to.be.equal(0);
            expect(mcache.max()).to.be.equal(mcache.missing());
            expect(mcache.ratio()).to.be.equal(0);
        });
    });

    describe("reset", function() {
        it("must have an empty cache after reset", function() {
            expect(mcache).to.be.ok;
            expect(mcache.size()).to.be.equal(0);
            expect(mcache.keys().length).to.be.equal(0);
            expect(mcache.max()).to.be.equal(mcache.missing());
            expect(mcache.ratio()).to.be.equal(0);
        });
    });

    describe("set", function() {
        beforeEach(function() { mcache.reset(); });

        it("must do anything cause missing the parameter", function() {
            var resp = mcache.set("", "a");
            expect(resp).to.be.equal(false);
            expect(mcache.size()).to.be.equal(0);
            expect(mcache.keys()).to.not.include("test");
        });

        it("must set a cache entry", function() {
            var resp = mcache.set("test", "a");
            expect(resp).to.be.equal(true);
            expect(mcache.size()).to.be.equal(10);
            expect(mcache.keys()).to.include("test");
            expect(mcache.get("test")).to.be.equal("a");
        });

        it("must set a cache entry and overwrite it", function() {
            var resp1 = mcache.set("test", "a");
            var resp2 = mcache.set("test", "bb");
            expect(resp1).to.be.equal(true);
            expect(resp2).to.be.equal(true);
            expect(mcache.size()).to.be.equal(12);
            expect(mcache.keys()).to.include("test");
            expect(mcache.get("test")).to.be.equal("bb");
        });

        it("must set multiple cache entries", function() {
            mcache.set("a", "aaa");
            mcache.set("b", "bbb");
            mcache.set("b", "BBB");
            mcache.set("c", {test:55, other:"ops"});
            expect(mcache.size()).to.be.equal(50);
            expect(mcache.keys().length).to.be.equal(3);
        });

        it("must pass the bounds", function() {
            mcache.set("a", "aaa");
            mcache.set("b", "bbb");
            mcache.set("b", "BBB");
            mcache.set("c", {test:55, other:"opsssssssss"});
            expect(mcache.size()).to.be.equal(50);
            expect(mcache.keys().length).to.be.equal(1);
        });

        it("must pass the bounds with one entry", function() {
            var resp = mcache.set("c", {test:55, other:"opssssssssss"});
            expect(resp).to.be.equal(false);
            expect(mcache.size()).to.be.equal(0);
            expect(mcache.keys().length).to.be.equal(0);
        });
    });
});