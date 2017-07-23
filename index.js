module.exports = init

var Emitter = require('events').EventEmitter
  , Primus = require('primus')
  , PrimusEmitter = require('primus-emitter')
  , Socket = Primus.createSocket({ transformer: 'websockets', parser: 'JSON', plugin: { emitter: PrimusEmitter } })

function init(callback) {
  callback(null, 'state', State)
}

function State(automait, logger, config) {
  Emitter.call(this)
  this.automait = automait
  this.logger = logger
  this.config = config
  this.client = new Socket(config.connString)
  this.previousState = null
  this.state = null
}

State.prototype = Object.create(Emitter.prototype)

State.prototype.init = function () {
  startListening.call(this)
}

State.prototype.setState = function (newState, cb) {
  this.client.send('changeState', newState)
  cb()
}

State.prototype.getState = function (cb) {
  cb(null, this.state)
}

State.prototype.getPreviousState = function (cb) {
  cb(null, this.previousState)
}

State.prototype.setToPreviousState = function (cb) {
  this.client.send('changeState', this.previousState)
  cb()
}

function startListening() {
  this.client.on('state', function (state) {
    var currentState = this.state
    if (currentState && currentState !== state) {
      this.previousState = currentState
      this.emit(state)
    }
    this.state = state
  }.bind(this))
}
