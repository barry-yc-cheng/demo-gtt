let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let gainNode1 = audioContext.createGain();
let gainNode2 = audioContext.createGain();
let audioBuffer1, audioBuffer2;
let source1, source2, startTime, duration;
let isPlaying = false;

const playButton = document.getElementById('play-button');
const stopButton = document.getElementById('stop-button');
const progressBar = document.getElementById('progress-bar');
const timestamp = document.getElementById('timestamp');
const mixSlider = document.getElementById('mix-slider');

// Predefined audio file paths
const audioFile1 = 'audio/audio1.wav';
const audioFile2 = 'audio/audio2.wav';

// Load the audio files
loadAudio(audioFile1, (buffer) => (audioBuffer1 = buffer));
loadAudio(audioFile2, (buffer) => (audioBuffer2 = buffer));

playButton.addEventListener('click', playMix);
stopButton.addEventListener('click', stopAudio);
mixSlider.addEventListener('input', adjustMix);
progressBar.addEventListener('input', scrub);

function loadAudio(filePath, callback) {
  fetch(filePath)
    .then((response) => response.arrayBuffer())
    .then((data) => audioContext.decodeAudioData(data, (buffer) => callback(buffer)))
    .catch((err) => console.error('Error loading audio file:', err));
}

function adjustMix() {
  const ratio = mixSlider.value / 100;
  gainNode1.gain.setValueAtTime(ratio, audioContext.currentTime);
  gainNode2.gain.setValueAtTime(1 - ratio, audioContext.currentTime);
}

function playMix() {
  if (isPlaying || !audioBuffer1 || !audioBuffer2) return;

  stopAudio(); // Stop any existing playback

  source1 = audioContext.createBufferSource();
  source2 = audioContext.createBufferSource();

  source1.buffer = audioBuffer1;
  source2.buffer = audioBuffer2;

  source1.connect(gainNode1).connect(audioContext.destination);
  source2.connect(gainNode2).connect(audioContext.destination);

  duration = Math.max(audioBuffer1.duration, audioBuffer2.duration);
  startTime = audioContext.currentTime;

  source1.start(0);
  source2.start(0);
  isPlaying = true;

  updateProgressBar();
}

function stopAudio() {
  if (!isPlaying) return;

  if (source1) source1.stop();
  if (source2) source2.stop();

  isPlaying = false;
  progressBar.value = 0;
  timestamp.textContent = `0:00 / ${formatTime(duration || 0)}`;
}

function updateProgressBar() {
  if (!isPlaying) return;

  const currentTime = audioContext.currentTime - startTime;
  progressBar.value = (currentTime / duration) * 100;
  timestamp.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;

  if (currentTime < duration) {
    requestAnimationFrame(updateProgressBar);
  } else {
    stopAudio();
  }
}

function scrub() {
  if (!isPlaying) return;

  const scrubTime = (progressBar.value / 100) * duration;
  source1.stop();
  source2.stop();

  playMix();
  source1.start(0, scrubTime);
  source2.start(0, scrubTime);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
