var events = require('events');
var stream = require('stream');
var util = require('util');

function StreamTake(options) {
  if (!(this instanceof StreamTake)) {
    return new StreamTake(options);
  }
  stream.Transform.call(this, options);
  if (!options || isNaN(options.bytes)) {
    throw new Error('Missing bytes parameter.');
  }
  this._bytes = Number(options.bytes);
  this._consumed = 0;
}

StreamTake.prototype = new events.EventEmitter();
util.inherits(StreamTake, stream.Transform);

StreamTake.prototype._transform = function (data, encoding, callback) {
  if (this._consumed > this._bytes) {
    return callback();
  }

  var len = data.byteLength;

  // limit not yet reached
  if (this._consumed + len < this._bytes) {
    this._consumed += len;
    return callback(null, data);
  }

  this.emit('limit');
  var remaining = this._bytes - this._consumed;
  var lastChunk = data.slice(0, remaining);
  this._consumed += remaining;
  return callback(null, lastChunk);
};

module.exports = StreamTake;
