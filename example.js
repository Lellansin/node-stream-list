var underscore = require('underscore');
var ForkStream = require("./");

var fork = new ForkStream({
  classifier: function classify(e, done) {
    return done(null, underscore.random(0,1));
  },
});

fork.list[0].on("data", console.log.bind(null, "a"));
fork.list[1].on("data", console.log.bind(null, "b"));

for (var i=0;i<20;++i) {
  fork.write(Math.round(Math.random() * 10));
}
