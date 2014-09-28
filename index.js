var stream = require("stream");

var ForkStream = module.exports = function ForkStream(options) {
  options = options || {};

  options.objectMode = true;

  stream.Writable.call(this, options);

  if (options.classifier) {
    this._classifier = options.classifier;
  }

  var self = this;
  self.list = [];

  var resume = function resume() {
    if (self.resume) {
      var r = self.resume;
      self.resume = null;
      r.call(null);
    }
  };

  var add = function(stream) {
    var stream = new stream.Readable(options);
    stream._read = resume;
    self.list.push(stream);
  };

  var num = options.num || 2;

  for (var i = 0; i < num; i++) {
    add(stream);
  }

  this.on("finish", function() {
    for (var i = self.list.length - 1; i >= 0; i--) {
      self.list[i].push(null);
    };
  });
};
ForkStream.prototype = Object.create(stream.Writable.prototype, {constructor: {value: ForkStream}});

ForkStream.prototype._classifier = function(e, done) {
  return done(null, !!e);
};

ForkStream.prototype._write = function _write(input, encoding, done) {
  var self = this;

  this._classifier.call(null, input, function(err, num) {
    if (err) {
      return done(err);
    }

    var out = self.list[num];

    if (out.push(input)) {
      return done();
    } else {
      self.resume = done;
    }
  });
};