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

    <div class="footer-divider"></div>

    <div class="footer-credit">
      <p>
        Built with music theory principles from centuries of harmonic practice. Learn more in the
        <a href="/docs/MUSIC-THEORY-GUIDE.md">Music Theory Guide</a>.
      </p>
    </div>
  </footer>
</div>

<!-- ===== STYLES - Using Design Tokens ===== -->
<style>
  /* ========================================
     MAIN CONTAINER - Vintage Aesthetic
     ======================================== */
  
  .chord-generator {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sections);
    width: 100%;
    font-family: var(--font-family-primary);
  }

  /* ========================================
     HEADER SECTION
     ======================================== */
  
  .generator-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-8);
    padding-bottom: var(--space-6);
    border-bottom: 2px solid var(--border-color);
  }

  .header-content {
    flex: 1;
  }

  .generator-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
    letter-spacing: var(--letter-spacing-wide);
  }

  .generator-subtitle {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin: 0;
    font-weight: var(--font-weight-normal);
  }

  /* Quick Status Card */
  .quick-status {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    background: var(--bg-elevated);
    border-radius: var(--border-radius-lg);
    border-left: 4px solid var(--accent);
    box-shadow: var(--shadow-md);
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--font-size-sm);
  }

  .status-label {
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    min-width: 100px;
  }

  .status-value {
    font-weight: var(--font-weight-bold);
    color: var(--accent);
    font-family: var(--font-family-mono);
    letter-spacing: var(--letter-spacing-wide);
  }

  /* ========================================
     MAIN CONTENT GRID
     ======================================== */
  
  .generator-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-sections);
  }

  .content-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-controls);
  }

  .selector-section {
    order: 1;
  }

  .progression-section {
    order: 2;
  }

  /* ========================================
     FOOTER - EDUCATIONAL RESOURCES
     ======================================== */
  
  .generator-footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-8);
    background: var(--bg-secondary);
    border-radius: var(--border-radius-xl);
    border: var(--border-default);
    margin-top: var(--space-4);
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--gap-sections);
  }

  .footer-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .footer-title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wider);
  }

  .footer-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
    padding-left: var(--space-5);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .footer-list li {
    margin: 0;
  }

  .footer-list strong {
    color: var(--text-primary);
    font-weight: var(--font-weight-semibold);
  }

  .footer-divider {
    height: 1px;
    background: var(--border-color);
    margin: var(--space-2) 0;
  }

  .footer-credit {
    text-align: center;
    padding: 0;
    margin: 0;
  }

  .footer-credit p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .footer-credit a {
    color: var(--accent);
    text-decoration: underline;
    font-weight: var(--font-weight-semibold);
    transition: var(--transition-colors);
  }

  .footer-credit a:hover {
    color: var(--accent-hover);
  }

  .footer-credit a:focus-visible {
    outline: var(--border-width-normal) solid var(--accent);
    outline-offset: 2px;
    border-radius: var(--border-radius-sm);
  }

  /* ========================================
     RESPONSIVE DESIGN
     ======================================== */
  
  @media (max-width: 1200px) {
    .generator-content {
      grid-template-columns: 1fr;
      gap: var(--gap-controls);
    }
  }

  @media (max-width: 768px) {
    .generator-header {
      flex-direction: column;
      gap: var(--space-4);
    }

    .generator-title {
      font-size: var(--font-size-xl);
    }

    .generator-subtitle {
      font-size: var(--font-size-sm);
    }

    .quick-status {
      width: 100%;
    }

    .generator-footer {
      padding: var(--space-6);
    }

    .footer-content {
      grid-template-columns: 1fr;
      gap: var(--gap-controls);
    }
  }

  /* ========================================
     PRINT STYLES
     ======================================== */
  
  @media print {
    .chord-generator {
      background: white;
      gap: var(--space-4);
    }

    .generator-header {
      border-bottom: 1px solid var(--border-color);
      page-break-after: avoid;
    }

    .generator-footer {
      background: white;
      border: 1px solid var(--border-color);
    }
  }
</style>
