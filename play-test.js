// ring-test.js
const RING_FILE = 'short-ring.mp3';

const player  = require('play-sound')(opts={});

player.play(RING_FILE, function(err){
  console.log('done ring, ring again...');
});

console.log('here');
