let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let gainNode1 = audioContext.createGain();
let gainNode2 = audioContext.createGain();
let audioBuffer1, audioBuffer2;
let source1, source2;

// Predefined audio file paths
const audioFile1 = 'audio/audio1.wav'; // Path to your .wav file
const audioFile2 = 'audio/audio2.wav'; // Path to your .wav file

// Load the predefined audio files
loadAudio(audioFile1, (buffer) => (audioBuffer1 = buffer));
loadAudio(audioFile2, (buffer) => (audioBuffer2 = buffer));

document.getElementById('mix-slider').addEventListener('input', adjustMix);
document.getElementById('play').addEventListener('click', playMix);
document.getElementById('stop').addEventListener('click', stopAudio);

function loadAudio(filePath, callback) {
  fetch(filePath)
    .then((response) => response.arrayBuffer())
    .then((data) => audioContext.decodeAudioData(data, (buffer) => callback(buffer)))
    .catch((err) => console.error('Error loading audio file:', err));
}

function adjustMix() {
  const ratio = document.getElementById('mix-slider').value / 100;
  gainNode1.gain.setValueAtTime(ratio, audioContext.currentTime);
  gainNode2.gain.setValueAtTime(1 - ratio, audioContext.currentTime);
}

function playMix() {
  if (!audioBuffer1 || !audioBuffer2) {
    alert('Audio files are still loading. Please wait.');
    return;
  }

  // Stop any currently playing sources
  stopAudio();

  // Create buffer sources for both audio files
  source1 = audioContext.createBufferSource();
  source2 = audioContext.createBufferSource();

  source1.buffer = audioBuffer1;
  source2.buffer = audioBuffer2;

  // Connect sources to their respective gain nodes
  source1.connect(gainNode1).connect(audioContext.destination);
  source2.connect(gainNode2).connect(audioContext.destination);

  // Start playback
  source1.start(0);
  source2.start(0);
}

function stopAudio() {
  if (source1) source1.stop();
  if (source2) source2.stop();
}
