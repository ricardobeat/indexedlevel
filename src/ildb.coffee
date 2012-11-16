class DB
    constructor: (@path) ->
        @setup()

    ready: (fn) =>
        return fn() if @isReady
        @onReady = fn

    loaded: =>
        @isReady = true
        @onReady?()
        @onReady = null

if process?.versions?.node

    leveldb = require 'leveldb'

    DB::setup = (cb) ->
        leveldb.open @path, { create_if_missing: true }, (err, db) =>
            throw err if err
            @store = db
            @loaded()
            cb?()

    DB::get = (key, fn) ->
        @store.get key, fn

    DB::put = (key, val, fn) ->
        @store.put key, val.toString(), fn

    DB::del = (key, fn) ->
        @store.del key, fn

    DB::getAll = (fn) ->
        @store.iterator (err, iterator) ->
            return fn err if err
            data = {}
            iterator.forRange (err, key, val) ->
                return fn err if err
                data[key] = val
            , -> fn null, data

    DB::clear = (fn) ->
        leveldb.destroy @path, {}, =>
            @setup fn

else

    DB::setup = ->
        @store = new IDBStore
            keyPath: 'id'
            autoIncrement: false
            onStoreReady: @loaded

    okay = (fn) -> (res) -> fn null, res
    nope = (fn) -> (err) -> fn err, null

    DB::get = (key, fn) ->
        @store.get key, (data) ->
            fn null, data?.val
        , nope(fn)

    DB::put = (key, val, fn) ->
        data = { id: key, val: val }
        @store.put data, okay(fn), nope(fn)

    DB::del = (key, fn) ->
        @store.remove key, okay(fn), nope(fn)

    DB::getAll = (fn) ->
        @store.getAll (res) ->
            data = {}
            for obj in res
                data[obj.id] = obj.val
            fn null, data
        , nope(fn)

    DB::clear = (fn) ->
        @store.clear (res) -> fn null, res

if module?.exports?
    module.exports = DB
else
    window.ILDB = DB
    