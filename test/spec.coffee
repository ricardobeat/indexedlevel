if module?.exports
    chai = require('chai')
    ILDB = require '../main'
else
    chai = window.chai
    ILDB = window.ILDB

should = chai.Should()

db = null

describe 'Wrapper', ->

    before (done) ->
        db = new ILDB 'test/test.db'
        db.ready ->
            db.clear? done

    it 'should save and recover a value', (done) ->
        db.put 'one', 'hello', (err) ->
            should.not.exist err
            db.get 'one', (err, val) ->
                val.should.equal 'hello'
                done()

    it 'should remove a value', (done) ->
        db.del 'one', (err) ->
            should.not.exist err
            db.get 'one', (err, val) ->
                should.not.exist err
                should.not.exist val
                done()

    it 'should get all values', (done) ->
        db.put 'one', '1', ->
            db.put 'two', '2', ->
                db.getAll (err, all) ->
                    all.should.eql { one: '1', two: '2' }
                    done()