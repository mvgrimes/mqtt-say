// mqtt-say.js
const RING_FILE = 'short-ring.mp3';
const RING_COUNT = 3;

require('dotenv').config();

const mqtt    = require('mqtt');
const player  = require('play-sound')(opts={});

const client = mqtt.connect(process.env.MQTT || 'mqtt://localhost');

/**
 * The state of the garage, defaults to closed
 * Possible states : closed, opening, open, closing
 */

client.on('connect', () => {
  console.log('connected. subscribing...');
  client.subscribe('hass/callerid/say');

  // Inform controllers that garage is connected
  // sendStateUpdate()
});

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message);
  handleMessage( message );
});

function sendStateUpdate () {
  console.log('sending state %s', state)
  // client.publish('garage/state', state)
}

function handleMessage (message) {
  console.log('ring, ring...');

  ring(RING_COUNT);
  // speak?
}

function ring (times=1){
  if( times<=0 ) return;

  player.play(RING_FILE, function(err){
    if (err) console.log('error playing sound: ', err);
    ring( times-1 );
  });
}

/**
 * Want to notify controller that garage is disconnected before shutting down
 */
function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    // client.publish('garage/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}

/**
 * Handle the different ways an application can shutdown
 */
process.on('exit', handleAppExit.bind(null, {
  cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))
