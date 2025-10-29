<script>
  /**
   * ChordGenerator.svelte
   *
   * PURPOSE:
   * Main container component that combines all chord generator functionality
   * into a cohesive, integrated interface for building and playing chord progressions.
   *
   * DESIGN PHILOSOPHY:
   * - Complete workflow in one component: select key → view chords → build progression → play
   * - All sub-components work together seamlessly
   * - Educational interface teaching music theory through interaction
   * - Integrated with existing PianoKeyboard and audioState
   * - Minimal, numbers-free design following lofi-piano aesthetic
   *
   * FUNCTIONALITY:
   * 1. ChordSelector: Choose root note and scale type
   * 2. ChordDisplay: See all available diatonic chords
   * 3. ProgressionBuilder: Create sequences and play them
   * 4. Status panel: Show current key, scale, and progression info
   *
   * SVELTE 5 PATTERNS:
   * - $props() for audioState reference and initial settings
   * - $state() for root/scale selection and progression
   * - $derived() for computed values
   * - All state synchronized between child components
   *
   * INTEGRATION:
   * ChordSelector → ChordDisplay → ProgressionBuilder → audioState.playChord()
   *
   * USAGE:
   * <ChordGenerator
   *   audioState={pianoState}
   *   initialRootMidi={60}
   *   initialScaleType="major"
   * />
   */

  import ChordSelector from './ChordSelector.svelte';
  import ChordDisplay from './ChordDisplay.svelte';
  import ProgressionBuilder from './ProgressionBuilder.svelte';
  import { midiToNoteName, getScaleInfo } from '@audio/music-theory';

  // ===== COMPONENT PROPS (Svelte 5 $props rune) =====
  let {
    audioState = undefined,
    initialRootMidi = 60,
    initialScaleType = 'major'
  } = $props();

  // ===== LOCAL REACTIVE STATE (Svelte 5 $state rune) =====
  let rootMidi = $state(initialRootMidi);
  let scaleType = $state(initialScaleType);
  let selectedChordRoman = $state(undefined);
  let currentProgression = $state(['I', 'IV', 'V', 'I']);

  // ===== DERIVED STATE (Svelte 5 $derived rune) =====

  // currentKeyName: Display name for current key (e.g., "C5 Major")
  let currentKeyName = $derived.by(() => {
    const noteName = midiToNoteName(rootMidi, true);
    const scaleInfo = getScaleInfo(scaleType);
    return `${noteName} ${scaleInfo?.name || 'Scale'}`;
  });

  // currentScaleInfo: Metadata for current scale
  let currentScaleInfo = $derived(getScaleInfo(scaleType));

  // ===== EFFECTS (Svelte 5 $effect rune) =====
  // (Communication between components handled via $derived and state binding)
</script>

<!-- ===== COMPONENT TEMPLATE ===== -->
<div class="chord-generator" role="main" aria-label="MIDI Chord Generator">
  <!-- Header Section -->
  <div class="generator-header">
    <div class="header-content">
      <h1 class="generator-title">🎵 MIDI Chord Generator</h1>
      <p class="generator-subtitle">
        Build harmonically-coherent chord progressions in any key
      </p>
    </div>

    <!-- Quick Status -->
    <div class="quick-status">
      <div class="status-item">
        <span class="status-label">Current Key:</span>
        <span class="status-value">{currentKeyName}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Progression:</span>
        <span class="status-value">{currentProgression.join(' - ')}</span>
      </div>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="generator-content">
    <!-- Left Column: Key & Chord Selection -->
    <section class="content-section selector-section">
      <ChordSelector
        bind:rootMidi
        bind:scaleType
        onKeyChange={(midi) => {
          rootMidi = midi;
        }}
        onScaleChange={(type) => {
          scaleType = type;
        }}
      />

      <ChordDisplay
        {rootMidi}
        {scaleType}
        bind:selectedChordRoman
        {audioState}
        onChordSelect={(roman) => {
          selectedChordRoman = roman;
        }}
        onChordPlay={(notes, duration) => {
          if (audioState && audioState.playChord) {
            audioState.playChord(notes, duration || 1.0);
          }
        }}
      />
    </section>

    <!-- Right Column: Progression Building & Playback -->
    <section class="content-section progression-section">
      <ProgressionBuilder
        {rootMidi}
        {scaleType}
        {audioState}
        onProgressionChange={(prog) => {
          currentProgression = prog;
        }}
      />
    </section>
  </div>

  <!-- Footer: Learning Resources & Tips -->
  <footer class="generator-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">🎓 Learning Tips</h3>
        <ul class="footer-list">
          <li>
            <strong>Harmonic Functions:</strong>
            Tonic (home), Subdominant (moving away), Dominant (tension), Pre-dominant (transition)
          </li>
          <li>
            <strong>Common Progressions:</strong>
            I-IV-V-I (classic), vi-IV-I-V (pop), ii-V-I (jazz), I-V-vi-IV (modern pop)
          </li>
          <li>
            <strong>Voice Leading:</strong>
            Smooth chord transitions with minimal note movement sound better and are easier to play
          </li>
          <li>
            <strong>Scale Degrees:</strong>
            All 7 diatonic chords come from the same scale - they always sound good together!
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h3 class="footer-title">🎹 Integration Tips</h3>
        <ul class="footer-list">
          <li>Play individual chords from ChordDisplay to preview them</li>
          <li>Use templates in ProgressionBuilder to learn classic patterns</li>
          <li>Adjust tempo to match different song styles (60 = slow ballad, 140 = upbeat)</li>
          <li>Watch voice leading analysis to understand smooth transitions</li>
          <li>Experiment with different scales and modes to explore new sounds</li>
        </ul>
      </div>

      <div class="footer-section">
        <h3 class="footer-title">📚 Music Theory</h3>
        <ul class="footer-list">
          <li>
            <strong>Diatonic Chords:</strong>
            Built from scale degrees, always harmonically compatible
          </li>
          <li>
            <strong>Voice Leading:</strong>
            Automatically optimizes chord inversions for smooth movement
          </li>
          <li>
            <strong>MIDI Note Numbers:</strong>
            0-127, Middle C = 60, A4 (concert pitch) = 69 (440 Hz)
          </li>
          <li>
            <strong>Scale Intervals:</strong>
            Semitone distances repeated every octave (equal temperament)
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-divider" />

    <div class="footer-credit">
      <p>
        Built with music theory principles from centuries of harmonic practice. Learn more in the
        <a href="/docs/MUSIC-THEORY-GUIDE.md">Music Theory Guide</a>.
      </p>
    </div>
  </footer>
</div>

<!-- ===== STYLES ===== -->
<style>
  .chord-generator {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
    background: linear-gradient(180deg, #f5f1e8 0%, #e8e3d8 50%, #ddd2c3 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* Header Section */
  .generator-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 3px solid rgba(139, 69, 19, 0.2);
  }

  @media (max-width: 768px) {
    .generator-header {
      flex-direction: column;
      gap: 1rem;
    }
  }

  .header-content {
    flex: 1;
  }

  .generator-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5c3317;
    margin: 0 0 0.5rem 0;
    letter-spacing: 0.5px;
  }

  .generator-subtitle {
    font-size: 1rem;
    color: #8b6f47;
    margin: 0;
    font-weight: 500;
  }

  .quick-status {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #8b6f47;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
  }

  .status-label {
    font-weight: 600;
    color: #5c3317;
    min-width: 100px;
  }

  .status-value {
    font-weight: 700;
    color: #8b6f47;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.5px;
  }

  /* Main Content Grid */
  .generator-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  @media (max-width: 1200px) {
    .generator-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  .content-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .selector-section {
    order: 1;
  }

  .progression-section {
    order: 2;
  }

  /* Footer Section */
  .generator-footer {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    background: rgba(139, 69, 19, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(139, 69, 19, 0.1);
    margin-top: 1rem;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .footer-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .footer-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #5c3317;
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .footer-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.85rem;
    color: #6b5d4f;
    line-height: 1.5;
  }

  .footer-list li {
    margin: 0;
  }

  .footer-list strong {
    color: #5c3317;
    font-weight: 600;
  }

  .footer-divider {
    height: 1px;
    background: rgba(139, 69, 19, 0.15);
    margin: 0;
  }

  .footer-credit {
    text-align: center;
    padding: 0;
    margin: 0;
  }

  .footer-credit p {
    margin: 0;
    font-size: 0.85rem;
    color: #8b6f47;
    font-weight: 500;
  }

  .footer-credit a {
    color: #8b6f47;
    text-decoration: underline;
    font-weight: 600;
    transition: color 0.2s ease;
  }

  .footer-credit a:hover {
    color: #5c3317;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .chord-generator {
      padding: 1rem;
      gap: 1.5rem;
    }

    .generator-title {
      font-size: 1.5rem;
    }

    .generator-subtitle {
      font-size: 0.9rem;
    }

    .generator-footer {
      padding: 1.5rem;
    }

    .footer-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  /* Print Styles */
  @media print {
    .chord-generator {
      background: white;
      gap: 1rem;
      padding: 0;
    }

    .generator-header {
      border-bottom: 1px solid #ccc;
      page-break-after: avoid;
    }

    .generator-footer {
      background: white;
      border: 1px solid #ccc;
    }
  }
</style>
