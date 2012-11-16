(function() {
  var DB, leveldb, nope, okay, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DB = (function() {

    function DB(path) {
      this.path = path;
      this.loaded = __bind(this.loaded, this);

      this.ready = __bind(this.ready, this);

      this.setup();
    }

    DB.prototype.ready = function(fn) {
      if (this.isReady) {
        return fn();
      }
      return this.onReady = fn;
    };

    DB.prototype.loaded = function() {
      this.isReady = true;
      if (typeof this.onReady === "function") {
        this.onReady();
      }
      return this.onReady = null;
    };

    return DB;

  })();

  if (typeof process !== "undefined" && process !== null ? (_ref = process.versions) != null ? _ref.node : void 0 : void 0) {
    leveldb = require('leveldb');
    DB.prototype.setup = function(cb) {
      var _this = this;
      return leveldb.open(this.path, {
        create_if_missing: true
      }, function(err, db) {
        if (err) {
          throw err;
        }
        _this.store = db;
        _this.loaded();
        return typeof cb === "function" ? cb() : void 0;
      });
    };
    DB.prototype.get = function(key, fn) {
      return this.store.get(key, fn);
    };
    DB.prototype.put = function(key, val, fn) {
      return this.store.put(key, val.toString(), fn);
    };
    DB.prototype.del = function(key, fn) {
      return this.store.del(key, fn);
    };
    DB.prototype.getAll = function(fn) {
      return this.store.iterator(function(err, iterator) {
        var data;
        if (err) {
          return fn(err);
        }
        data = {};
        return iterator.forRange(function(err, key, val) {
          if (err) {
            return fn(err);
          }
          return data[key] = val;
        }, function() {
          return fn(null, data);
        });
      });
    };
    DB.prototype.clear = function(fn) {
      var _this = this;
      return leveldb.destroy(this.path, {}, function() {
        return _this.setup(fn);
      });
    };
  } else {
    DB.prototype.setup = function() {
      return this.store = new IDBStore({
        keyPath: 'id',
        autoIncrement: false,
        onStoreReady: this.loaded
      });
    };
    okay = function(fn) {
      return function(res) {
        return fn(null, res);
      };
    };
    nope = function(fn) {
      return function(err) {
        return fn(err, null);
      };
    };
    DB.prototype.get = function(key, fn) {
      return this.store.get(key, function(data) {
        return fn(null, data != null ? data.val : void 0);
      }, nope(fn));
    };
    DB.prototype.put = function(key, val, fn) {
      var data;
      data = {
        id: key,
        val: val
      };
      return this.store.put(data, okay(fn), nope(fn));
    };
    DB.prototype.del = function(key, fn) {
      return this.store.remove(key, okay(fn), nope(fn));
    };
    DB.prototype.getAll = function(fn) {
      return this.store.getAll(function(res) {
        var data, obj, _i, _len;
        data = {};
        for (_i = 0, _len = res.length; _i < _len; _i++) {
          obj = res[_i];
          data[obj.id] = obj.val;
        }
        return fn(null, data);
      }, nope(fn));
    };
    DB.prototype.clear = function(fn) {
      return this.store.clear(function(res) {
        return fn(null, res);
      });
    };
  }

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = DB;
  } else {
    window.ILDB = DB;
  }

}).call(this);
