/**
 * Script to generate a notification sound and save it to public/sounds directory
 * Run with: node scripts/generate-notification-sound.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Ensure the sounds directory exists
const soundsDir = path.join(__dirname, '../public/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Path for the output file
const outputPath = path.join(soundsDir, 'notification.mp3');

// Generate a notification sound using SoX (Sound eXchange)
// This requires SoX to be installed on the system
// macOS: brew install sox
// Ubuntu/Debian: apt-get install sox
function generateNotificationSound() {
  console.log('Generating notification sound...');

  // Option 1: Simple bell-like notification sound
  const command = `sox -n -r 44100 -c 2 "${outputPath}" synth 0.3 sine 880 gain -3 fade 0.1 0.3 0.1 reverb`;

  // Option 2: Two-tone notification (uncomment to use)
  // const command = `sox -n -r 44100 -c 2 "${outputPath}" synth 0.15 sine 880 gain -5 : synth 0.15 sine 1175 gain -5 fade 0.05 0.3 0.05 reverb`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating sound: ${error.message}`);
      console.log('Falling back to copying a pre-generated sound file...');
      copyPreGeneratedSound();
      return;
    }
    if (stderr) {
      console.warn(`Warning: ${stderr}`);
    }
    console.log(`Notification sound generated and saved to: ${outputPath}`);
  });
}

// Alternative: Create a base64-encoded MP3 file directly
function copyPreGeneratedSound() {
  // This is a base64-encoded tiny MP3 file of a simple notification sound
  const base64Sound = `//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA9AAAABAAACCQD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAAgkF2cW0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=`;

  // Decode and write the file
  const buffer = Buffer.from(base64Sound, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Pre-generated notification sound saved to: ${outputPath}`);
}

// Execute the main function
try {
  generateNotificationSound();
} catch (err) {
  console.error('Error:', err);
  copyPreGeneratedSound();
}

console.log(`
To use this notification sound in your application:

1. The sound is saved at: ${outputPath}
2. You can play it with:
   const notificationSound = new Audio('/sounds/notification.mp3');
   notificationSound.play();
`);
