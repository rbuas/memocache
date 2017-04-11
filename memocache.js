/**
 * MemoCache
 * Memory cache control.
 * @author rbuas rodrigobuas@gmail.com
 * @version 20170324
 */
module.exports = MemoCache;

global.ROOT_DIR = process.cwd() || __dirname;

var sizeof = require("object-sizeof");
var PriorityQueue = require(ROOT_DIR + "/rocks/jss/priorityqueue");

function MemoCache (options) {
    this.options = Object.assign({}, this.DEFAULTOPTIONS, options);
    this.cachequeue = new PriorityQueue();
    this.reset();
}

MemoCache.prototype.DEFAULTOPTIONS = {
    maxSize : 10000,
    alertRatio : 0.9,
    alertCallback : null //callback(stats)
};

MemoCache.prototype.reset = function () {
    this.cachedata = {};
    this.cachequeue.reset(); 
}

MemoCache.prototype.set = function (key, val) {
    if(!key) return false;

    if(!this.prepare(sizeof(val) + sizeof(key))) return false;

    this.cachedata[key] = val;
    this.cachequeue.enqueue(key);
    this.verifyBounds();

    return true;
}

MemoCache.prototype.get = function (key) {
    if(!this.cachedata.hasOwnProperty(key)) return;

    this.cachequeue.enqueue(key);
    return this.cachedata[key];
}

MemoCache.prototype.del = function (key) {
    if(!key || !this.cachedata.hasOwnProperty(key)) return;
    delete this.cachedata[key];
    this.cachequeue.remove(key);
}

MemoCache.prototype.size = function () {
    return sizeof(this.cachedata);
}

MemoCache.prototype.max = function () {
    return this.options.maxSize;
}

MemoCache.prototype.missing = function () {
    return this.max() - this.size();
}

MemoCache.prototype.ratio = function () {
    return this.size() / this.max();
}

MemoCache.prototype.keys = function (key, val) {
    return Object.keys(this.cachedata);
}

MemoCache.prototype.stats = function () {
    var cachekeys = this.keys();
    return {
        hits : cachekeys.length,
        size : this.size(),
        missing : this.missing(),
        ratio : this.ratio()
    };
}

MemoCache.prototype.prepare = function (addsize) {
    if(addsize > this.max()) return false;

    var nextsize = this.size() + addsize;
    while (this.cachequeue.size() && nextsize > this.max()) {
        var killer = this.cachequeue.dequeue();
        this.del(killer);

        nextsize = this.size() + addsize;
    }
    return nextsize <= this.max();
}

MemoCache.prototype.verifyBounds = function () {
    var ratio = this.ratio();
    if(ratio <= this.options.alertRatio) return;

    var stats = this.stats();
    if(this.options.alertCallback) this.options.alertCallback(stats);
}