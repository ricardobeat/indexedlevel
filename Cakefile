flour = require 'flour'
cp    = require 'child_process'

task 'build', ->
    compile 'src/ildb.coffee', 'lib/ildb.js'

task 'build:tests', ->

    flour.minifiers.js = null

    compile 'main.coffee'                 , 'test/browser/ildb.js'
    compile 'node_modules/chai/chai.js'   , 'test/browser/chai.js'
    compile 'node_modules/mocha/mocha.css', 'test/browser/mocha.css'
    compile 'node_modules/mocha/mocha.js' , 'test/browser/mocha.js'
    compile 'test/spec.coffee'            , 'test/browser/spec.js'

task 'watch:tests', ->
    invoke 'build:tests'
    watch [
        'test/spec.coffee'
        'main.coffee'
    ], -> invoke 'build:tests'

task 'test:browser', ->
    invoke 'build:tests'
    cp.exec 'open test/browser/index.html'