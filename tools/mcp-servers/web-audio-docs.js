// Documentation database
const DOCUMENTATION = {
  audioContext: {
    name: 'AudioContext',
    description: 'Represents an audio processing graph built from audio nodes linked together',
    methods: [
      {
        name: 'createOscillator()',
        description: 'Creates an OscillatorNode which represents a periodic waveform'
      },
      {
        name: 'createGain()',
        description: 'Creates a GainNode which can be used to control the overall gain of the audio graph'
      },
      {
        name: 'createBiquadFilter()',
        description: 'Creates a BiquadFilterNode, a simple low-order filter'
      },
      {
        name: 'createDelay(maxTime)',
        description: 'Creates a DelayNode which delays the incoming audio signal'
      },
      {
        name: 'createConvolver()',
        description: 'Creates a ConvolverNode, which is used to apply a linear convolution effect'
      },
      {
        name: 'createAnalyser()',
        description: 'Creates an AnalyserNode which can be used to expose audio time and frequency data'
      }
    ],
    properties: [
      {
        name: 'currentTime',
        type: 'number',
        description: 'The current sample-frame of the AudioContext relative to its origin'
      },
      {
        name: 'sampleRate',
        type: 'number',
        description: 'Sample-rate of the AudioContext'
      },
      {
        name: 'state',
        type: 'string',
        description: 'State of the audio context: "suspended", "running", or "closed"'
      }
    ]
  },

  oscillatorNode: {
    name: 'OscillatorNode',
    description: 'Represents a periodic waveform, such as a sine wave',
    properties: [
      {
        name: 'type',
        type: 'string',
        description: 'Type of waveform: "sine", "square", "sawtooth", "triangle"'
      },
      {
        name: 'frequency',
        type: 'AudioParam',
        description: 'Frequency of oscillation in hertz (Hz)'
      },
      {
        name: 'detune',
        type: 'AudioParam',
        description: 'Detune in cents (±100 cents = ±1 semitone)'
      }
    ],
    methods: [
      {
        name: 'start(when)',
        description: 'Schedules a sound to begin playback at a specified time'
      },
      {
        name: 'stop(when)',
        description: 'Schedules the oscillator to stop playback at a specified time'
      }
    ]
  },

  gainNode: {
    name: 'GainNode',
    description: 'Represents volume control - a node that multiplies input audio by a gain value',
    properties: [
      {
        name: 'gain',
        type: 'AudioParam',
        description: 'The gain amount (0 = silent, 1 = unchanged, >1 = amplified)'
      }
    ],
    methods: []
  },

  biquadFilterNode: {
    name: 'BiquadFilterNode',
    description: 'A simple low-order filter that can model different types of filters',
    properties: [
      {
        name: 'type',
        type: 'string',
        description: 'Type of filter: "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"'
      },
      {
        name: 'frequency',
        type: 'AudioParam',
        description: 'The frequency at which the filter is applied (Hz)'
      },
      {
        name: 'Q',
        type: 'AudioParam',
        description: 'Controls the width of a band-pass filter around the frequency value'
      },
      {
        name: 'gain',
        type: 'AudioParam',
        description: 'The gain of the filter (used for peaking and shelf filters)'
      }
    ]
  },

  delayNode: {
    name: 'DelayNode',
    description: 'A delay effect - delays the input audio by a specified amount of time',
    properties: [
      {
        name: 'delayTime',
        type: 'AudioParam',
        description: 'The amount of time to delay the signal (in seconds)'
      }
    ]
  },

  analyserNode: {
    name: 'AnalyserNode',
    description: 'Exposes audio time and frequency data for visualization or analysis',
    properties: [
      {
        name: 'fftSize',
        type: 'number',
        description: 'The size of the FFT (Fast Fourier Transform) used for frequency analysis'
      },
      {
        name: 'smoothingTimeConstant',
        type: 'number',
        description: 'Smoothing for the frequency data (0-1)'
      }
    ],
    methods: [
      {
        name: 'getByteFrequencyData(array)',
        description: 'Copies frequency data into a Uint8Array'
      },
      {
        name: 'getByteTimeDomainData(array)',
        description: 'Copies time-domain waveform data into a Uint8Array'
      },
      {
        name: 'getFloatFrequencyData(array)',
        description: 'Copies frequency data into a Float32Array'
      },
      {
        name: 'getFloatTimeDomainData(array)',
        description: 'Copies time-domain data into a Float32Array'
      }
    ]
  }
};

const EXAMPLES = {
  simpleOscillator: {
    title: 'Simple Sine Wave Oscillator',
    code: `
/**
 * Create and play a simple sine wave
 *
 * Pattern:
 * 1. Create AudioContext
 * 2. Create OscillatorNode (sound source)
 * 3. Create GainNode (volume control)
 * 4. Connect nodes: Oscillator → Gain → Destination (speakers)
 * 5. Set parameters
 * 6. Start audio
 */

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create nodes
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

// Set up oscillator
oscillator.type = 'sine';        // sine, square, sawtooth, triangle
oscillator.frequency.value = 440; // A4 note
oscillator.detune.value = 0;      // No detune

// Set up gain (volume)
gainNode.gain.value = 0.3; // 30% volume (0-1)

// Connect nodes: Osc → Gain → Speaker
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

// Start and stop
oscillator.start();           // Start immediately
// oscillator.stop(audioContext.currentTime + 2); // Stop after 2 seconds
`
  },

  envelopeExample: {
    title: 'ADSR Envelope on Oscillator',
    code: `
/**
 * Apply envelope (Attack, Decay, Sustain, Release) to control volume over time
 *
 * Attack: How quickly volume rises when note starts
 * Decay: How quickly it drops to sustain level after attack
 * Sustain: Level to hold at while note is playing
 * Release: How quickly it fades out when note stops
 */

function playNoteWithEnvelope(frequency, duration = 1) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const now = ctx.currentTime;

  // Create nodes
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.frequency.value = frequency;
  gainNode.gain.value = 0; // Start silent

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // ADSR parameters
  const attack = 0.1;   // 100ms attack
  const decay = 0.2;    // 200ms decay
  const sustain = 0.7;  // Sustain at 70%
  const release = 0.5;  // 500ms release

  // Apply envelope
  gainNode.gain.setValueAtTime(0, now);                    // Start at 0
  gainNode.gain.linearRampToValueAtTime(1, now + attack); // Ramp up
  gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay); // Decay
  gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

  oscillator.start(now);
  oscillator.stop(now + duration);
}
`
  },

  filterExample: {
    title: 'Low-Pass Filter',
    code: `
/**
 * Use a filter to remove high frequencies
 *
 * Common filter types:
 * - lowpass: Remove high frequencies (bright → dull)
 * - highpass: Remove low frequencies (dark → bright)
 * - bandpass: Keep only frequencies around cutoff
 * - peaking: Boost or cut frequencies around cutoff
 */

const ctx = new (window.AudioContext || window.webkitAudioContext)();

// Create nodes
const oscillator = ctx.createOscillator();
const filter = ctx.createBiquadFilter();
const gainNode = ctx.createGain();

// Configure oscillator
oscillator.type = 'sawtooth';      // Bright, rich waveform
oscillator.frequency.value = 440;

// Configure filter
filter.type = 'lowpass';            // Remove high frequencies
filter.frequency.value = 2000;      // Cutoff frequency in Hz
filter.Q.value = 10;                // Resonance (sharper peak)

// Configure gain
gainNode.gain.value = 0.3;

// Connect: Oscillator → Filter → Gain → Speaker
oscillator.connect(filter);
filter.connect(gainNode);
gainNode.connect(ctx.destination);

// Automate filter cutoff
function automateFilter() {
  const now = ctx.currentTime;
  // Sweep filter from 500 Hz to 8000 Hz over 3 seconds
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.linearRampToValueAtTime(8000, now + 3);
}

oscillator.start();
automateFilter();
`
  },

  delayReverbExample: {
    title: 'Delay Effect with Feedback',
    code: `
/**
 * Create a delay effect with feedback
 *
 * Signal flow:
 * 1. Input signal goes to output directly
 * 2. Input also goes to delay
 * 3. Delayed signal comes back and mixes with input
 * 4. Delayed signal also feeds back into delay (feedback loop)
 *
 * Parameters:
 * - delayTime: How long to delay (creates short-long echoes)
 * - feedback: How much delayed signal feeds back (0-0.8 safe)
 */

function createDelayEffect(delayTime = 0.5, feedback = 0.4) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  // Create nodes
  const input = ctx.createGain();
  const delayNode = ctx.createDelay(5);      // Max 5 seconds
  const feedbackGain = ctx.createGain();
  const output = ctx.createGain();

  // Configure
  delayNode.delayTime.value = delayTime;
  feedbackGain.gain.value = feedback;
  output.gain.value = 0.8;

  // Connect: Input → (Output + Delay) & Feedback loop
  input.connect(output);                // Direct path
  input.connect(delayNode);             // Send to delay
  delayNode.connect(output);            // Mix delayed with output
  delayNode.connect(feedbackGain);      // Feedback branch
  feedbackGain.connect(delayNode);      // Feedback loop

  output.connect(ctx.destination);

  return {
    input,
    setDelay: (time) => delayNode.delayTime.value = time,
    setFeedback: (fb) => feedbackGain.gain.value = fb,
    setOutput: (level) => output.gain.value = level
  };
}
`
  },

  analysisExample: {
    title: 'Frequency Analysis & Visualization',
    code: `
/**
 * Analyze audio frequency data for visualization
 *
 * Use AnalyserNode to get:
 * - Frequency spectrum (visual equalizer)
 * - Time-domain waveform (oscilloscope view)
 * - Real-time amplitude data
 */

function setupAnalysis() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  // Create analyser
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;  // Size of FFT analysis (power of 2)

  // Create data arrays
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  const waveformData = new Uint8Array(analyser.fftSize);

  // Connect audio source to analyser
  // (could be oscillator, microphone input, audio file, etc.)
  const oscillator = ctx.createOscillator();
  oscillator.connect(analyser);
  analyser.connect(ctx.destination);

  // Animation loop to visualize
  function analyze() {
    requestAnimationFrame(analyze);

    // Get frequency data (FFT)
    analyser.getByteFrequencyData(frequencyData);
    // Now frequencyData contains frequency spectrum (0-255 values)

    // Get time-domain waveform
    analyser.getByteTimeDomainData(waveformData);
    // Now waveformData contains oscilloscope-like data

    // Draw to canvas (example)
    drawSpectrum(frequencyData);
    drawWaveform(waveformData);
  }

  oscillator.start();
  analyze();
}

function drawSpectrum(data) {
  // Draw frequency bars (like equalizer)
  const canvas = document.getElementById('spectrum');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / data.length;
  data.forEach((value, index) => {
    const height = (value / 255) * canvas.height;
    ctx.fillStyle = 'hsl(' + (index / data.length * 360) + ', 100%, 50%)';
    ctx.fillRect(index * barWidth, canvas.height - height, barWidth, height);
  });
}

function drawWaveform(data) {
  // Draw oscilloscope-like waveform
  const canvas = document.getElementById('waveform');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'lime';
  ctx.lineWidth = 2;
  ctx.beginPath();

  const sliceWidth = canvas.width / data.length;
  let x = 0;

  data.forEach((value, index) => {
    const y = (value / 255) * canvas.height;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  });

  ctx.stroke();
}
`
  }
};

const PATTERNS = {
  audioGraph: {
    title: 'Basic Audio Graph Pattern',
    description: 'All audio routing follows this pattern: Source → Processing → Output',
    ascii: `
    ┌──────────────┐
    │ OSC / Input  │
    └──────────────┘
           │
    ┌──────▼──────┐
    │ GainNode    │ (Volume)
    └──────┬──────┘
           │
    ┌──────▼──────────────┐
    │ BiquadFilterNode    │ (EQ/Filter)
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ ConvolverNode       │ (Reverb/Effects)
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ GainNode            │ (Master Volume)
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ destination         │ (Speakers)
    └─────────────────────┘
    `
  },

  scheduling: {
    title: 'Precise Audio Scheduling',
    description: 'Use currentTime for sample-accurate scheduling',
    code: `
// Get current time in the audio context
const now = audioContext.currentTime;

// Schedule audio events
oscillator.start(now);              // Start immediately
oscillator.stop(now + 1);           // Stop after 1 second

// Schedule parameter changes
gainNode.gain.setValueAtTime(0, now);
gainNode.gain.linearRampToValueAtTime(1, now + 0.5);  // Fade in over 500ms
gainNode.gain.linearRampToValueAtTime(0, now + 2);    // Fade out over 1 second

// Exponential ramp for frequency (more musical)
oscillator.frequency.exponentialRampToValueAtTime(880, now + 1);
`
  }
};

// Simple search function
function search(query) {
  const results = [];

  // Search in documentation
  for (const [key, doc] of Object.entries(DOCUMENTATION)) {
    if (
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      doc.description.toLowerCase().includes(query.toLowerCase())
    ) {
      results.push({
        type: 'documentation',
        ...doc
      });
    }
  }

  // Search in examples
  for (const [key, example] of Object.entries(EXAMPLES)) {
    if (example.title.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        type: 'example',
        ...example
      });
    }
  }

  // Search in patterns
  for (const [key, pattern] of Object.entries(PATTERNS)) {
    if (pattern.title.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        type: 'pattern',
        ...pattern
      });
    }
  }

  return results;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    search,
    DOCUMENTATION,
    EXAMPLES,
    PATTERNS
  };
}