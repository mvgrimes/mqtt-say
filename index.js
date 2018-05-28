// mqtt-say.js
const RING_FILE = 'short-ring.mp3';
const RING_COUNT = 3;

require('dotenv').config();

const mqtt    = require('mqtt');
const player  = require('play-sound')(opts={});
const spawn   = require('child_process').spawn;

const client = mqtt.connect(process.env.MQTT || 'mqtt://localhost');

/**
 * Listen for text announcements and ring notices
 */

client.on('connect', () => {
  console.log('connected. subscribing to ring...');
  client.subscribe('hass/mqtt-say/ring');
  client.subscribe('hass/mqtt-say/message');

  // sendStateUpdate()
});

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message);
  if( topic == 'hass/mqtt-say/ring' ){
    handleRing( message );
  } else {
    handleMessage( message );
  }
});

function sendStateUpdate () {
  console.log('sending state %s', state)
  // client.publish('garage/state', state)
}

function handleRing (message) {
  console.log('ring, ring...');

  ring(RING_COUNT);
}

function handleMessage (message) {
  console.log(`speak ${message}`);
  // speak( message );
  play( message );
}

function play (url) {
  player.play(url, function(err){
    if (err) console.log('error playing sound: ', err);
  });
}

function speak (message){
  const tts = spawn( 'espeak', ['-a', '200', '-ven-us+f4', '-s', '170' ] );
  // const tts = spawn( 'festival', ['--tts' ] );
  tts.stdout.on('data', (data) => console.log(data.toString()));
  tts.stderr.on('data', (data) => console.error(data.toString()));
  tts.on('clone', (code) => console.log(`exiting with code ${code}`));
  tts.stdin.write(message + "\n");
  tts.stdin.end();
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
