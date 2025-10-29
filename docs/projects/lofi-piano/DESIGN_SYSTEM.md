# Postcard Piano Inspired Design System
## LoFi Piano UI/UX Transformation

> **Vision**: Transform LoFi Piano into a minimal, numbers-free audio interface that encourages ear-based tuning and perceptual engagement over technical specifications. Inspired by Postcard Piano's elegant simplicity.

---

## Design Philosophy

### Core Principles

1. **Numbers-Free Design**
   - No numeric value displays (dB, Hz, percentages, ratios)
   - All feedback is visual/perceptual, not quantitative
   - Users learn by ear, not by reading numbers

2. **Analog Simplicity**
   - Vintage aesthetic inspired by hardware synthesizers and tape machines
   - Minimal controls: only what's essential
   - Warm, organic color palette (creams, browns, golds)

3. **Perceptual Engagement**
   - Visual feedback shows effect intensity (not numeric value)
   - Knobs rotate smoothly with haptic-like precision
   - Interface encourages exploration and listening over technical understanding

4. **Minimalist Layout**
   - Maximum negative space
   - Controls grouped by functional area (not overwhelming)
   - Clear visual hierarchy
   - Signature features (AGE knob, Room Mics) prominently featured

---

## Design Tokens

### Color Palette

#### Primary Colors (Vintage Aesthetic)
```css
--color-cream:           #F5F1E8;   /* Off-white background */
--color-taupe:           #8B8680;   /* Medium gray-brown */
--color-sage:            #9CA89A;   /* Muted green-gray */
--color-warm-brown:      #6B5B52;   /* Warm dark brown */
--color-gold:            #D4A574;   /* Warm gold accent */
--color-deep-brown:      #3D3230;   /* Near-black brown */

/* Derived Colors */
--color-background:      var(--color-cream);
--color-surface:         #EBE7DD;   /* Slightly darker than background */
--color-text-primary:    var(--color-deep-brown);
--color-text-secondary:  var(--color-taupe);
--color-border:          var(--color-sage);
--color-accent:          var(--color-gold);
--color-accent-dark:     #B8935F;   /* Darker gold for hover states */

/* Status Colors (minimal, muted) */
--color-active:          var(--color-gold);      /* Keys pressed, controls active */
--color-warning:         #C9A76A;                /* Slightly more saturated gold */
--color-error:           #9B6B5A;                /* Muted reddish brown */
--color-success:         #8FA89A;                /* Muted teal */
```

#### Color Usage Guide
- **Backgrounds**: Cream (#F5F1E8) - calming, vintage paper-like
- **Controls**: Taupe/Sage borders, gold accents
- **Text**: Deep brown (#3D3230) on cream - high contrast without starkness
- **Active States**: Gold (#D4A574) to show engagement without aggression
- **Visual Feedback**: Intensity indicated by gold saturation/brightness, not numbers

---

### Typography

#### Font Stack
```css
--font-family-primary:   'Courier Prime', 'Courier New', monospace;
/* Fallback: 'Garamond', 'Times New Roman', serif; */
/* Alternative: 'IBM Plex Serif', 'Freight Text', serif; */

--font-family-mono:      'Space Mono', 'Courier Prime', monospace;
```

#### Font Sizes & Line Heights
```css
--font-size-xs:          10px;  /* Tiny labels */
--font-size-sm:          12px;  /* Labels, small text */
--font-size-base:        14px;  /* Body text, regular labels */
--font-size-lg:          16px;  /* Control labels, section headers */
--font-size-xl:          18px;  /* Main title */
--font-size-2xl:         24px;  /* Header/logo */

--line-height-tight:     1.2;
--line-height-normal:    1.5;
--line-height-relaxed:   1.8;
```

#### Font Weights
```css
--font-weight-light:     300;
--font-weight-normal:    400;
--font-weight-medium:    500;
--font-weight-bold:      700;
```

#### Text Styles
- **Logo/Header**: 24px, bold, color-deep-brown
- **Section Titles**: 14px, medium, color-text-primary
- **Control Labels**: 12px, normal, color-text-secondary
- **Status Text**: 10px, light, color-text-secondary (no numeric values!)
- **No monospace numbers** - this reinforces the numbers-free philosophy

---

### Spacing System

```css
/* Base unit: 4px */
--space-1:               4px;
--space-2:               8px;
--space-3:               12px;
--space-4:               16px;
--space-6:               24px;
--space-8:               32px;
--space-12:              48px;
--space-16:              64px;

/* Component-specific padding */
--padding-xs:            var(--space-2);      /* 8px */
--padding-sm:            var(--space-3);      /* 12px */
--padding-md:            var(--space-4);      /* 16px */
--padding-lg:            var(--space-6);      /* 24px */

/* Component-specific margins */
--margin-xs:             var(--space-2);
--margin-sm:             var(--space-3);
--margin-md:             var(--space-4);
--margin-lg:             var(--space-6);
--margin-xl:             var(--space-8);

/* Gap between control groups */
--gap-controls:          var(--space-6);      /* 24px */
--gap-sections:          var(--space-8);      /* 32px */
```

#### Spacing Philosophy
- **Generous whitespace** emphasizes importance
- **Visual breathing room** reduces cognitive load
- **Clear grouping** through spacing (not borders)

---

### Visual Effects

#### Border & Stroke
```css
--border-radius-sm:      2px;
--border-radius-md:      4px;
--border-radius-lg:      6px;
--border-radius-full:    50%;

--border-width-thin:     1px;
--border-width-normal:   2px;
--border-width-thick:    3px;

--border-style-default:  solid var(--border-width-thin) var(--color-border);
--border-style-active:   solid var(--border-width-normal) var(--color-accent);
```

#### Shadows (subtle, vintage aesthetic)
```css
--shadow-sm:             0 1px 2px rgba(61, 50, 48, 0.08);
--shadow-md:             0 2px 4px rgba(61, 50, 48, 0.12);
--shadow-lg:             0 4px 8px rgba(61, 50, 48, 0.16);
--shadow-inner:          inset 0 1px 2px rgba(61, 50, 48, 0.1);

/* Avoid deep shadows - keep vintage feel */
```

#### Opacity
```css
--opacity-disabled:      0.5;
--opacity-hover:         0.8;
--opacity-active:        1;
--opacity-focus-ring:    0.3;
```

---

## Component Specifications

### 1. Custom Knob Component
**File**: `shared/ui-components/controls/VintageKnob.svelte`

#### Features
- Rotary control with smooth rotation animation
- No numeric display (visual feedback only)
- Mouse drag + keyboard arrows for fine control
- Optional visual intensity indicator
- Accessibility: aria-label, keyboard support

#### Visual Design
- **Appearance**: Circular knob with notched grip (vinyl record aesthetic)
- **Size**: 80px diameter (default, configurable)
- **Colors**: Taupe knob (#8B8680) on cream background (#F5F1E8)
- **Accent**: Gold pointer (#D4A574) showing current position
- **Feedback**: Subtle shadow on drag, visual intensity arc

#### Props
```javascript
{
  value: number,           // 0-1 normalized value
  min: number = 0,         // Minimum value
  max: number = 100,       // Maximum value
  step: number = 1,        // Step size for keyboard control
  label: string,           // Control name (no numeric suffix)
  showIntensity: boolean = true,  // Show visual intensity arc
  disabled: boolean = false,
  onchange: (value: number) => void
}
```

#### Key Code Pattern (Svelte 5)
```svelte
<script>
  let { value = $bindable(0.5), min = 0, max = 100, label } = $props();
  let isDragging = $state(false);

  $effect(() => {
    // Update audio when knob changes
    audioNode?.setParameter(value);
  });
</script>

<div class="knob-wrapper">
  <div class="knob-label">{label}</div>
  <div class="knob" onmousedown={handleDragStart}>
    <div class="knob-grip"></div>
    <div class="knob-indicator"></div>
  </div>
  <!-- No value display! -->
</div>

<style>
  .knob {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .knob-indicator {
    position: absolute;
    width: 3px;
    height: 30px;
    background: var(--color-accent);
    left: 50%;
    top: 8px;
    transform-origin: center 36px;
    /* Rotated by value */
  }
</style>
```

---

### 2. AGE Control Component
**File**: `plugins/lofi-piano/web/src/lib/components/controls/AGEControl.svelte`

**What is AGE?**
AGE (Analog Gear Emulation) is Postcard Piano's signature effect - a progressive vintage degradation that adds character and warmth. It combines:
- **Tape saturation**: Subtle harmonic distortion
- **Frequency rolloff**: Slight high-frequency loss
- **Subtle modulation**: Analog tape wow/flutter

#### Features
- Single knob control: "AGE" (0-100%)
- Visual feedback shows vintage warmth intensity
- No numeric value display
- Real-time parameter updates

#### Visual Design
- **Single Vintage Knob** with large, clear label "AGE"
- **Visual Intensity Arc** (optional): Gold arc showing current age level
- **Background**: Cream with taupe border, minimal styling
- **Size**: Large, prominent feature (120px diameter)

#### Implementation Strategy
```javascript
// Conceptual: AGE combines multiple effects
export function createAGEEffect(ageIntensity = 0.5) {
  // 0 = pristine digital
  // 0.5 = moderate vintage warmth
  // 1.0 = heavy vintage saturation

  const saturation = ageIntensity * 0.3;    // 0-30% harmonic content
  const frequencyRolloff = ageIntensity * 1500;  // 0-1500 Hz cutoff reduction
  const modulation = ageIntensity * 0.05;   // 0-5% tape wobble

  // Apply to master chain
  return {
    setSaturation: (value) => { /* ... */ },
    setFrequencyRolloff: (value) => { /* ... */ },
    setModulation: (value) => { /* ... */ }
  };
}
```

#### Svelte 5 Component Pattern
```svelte
<script>
  let ageAmount = $state(0);

  // Derived parameter conversions (no numbers shown!)
  let ageIntensity = $derived(ageAmount / 100);
  let saturationAmount = $derived(ageIntensity * 0.3);
  let rolloffAmount = $derived(ageIntensity * 1500);

  $effect(() => {
    // Update all age-related effects
    audioState.applyAGE({
      saturation: saturationAmount,
      rolloff: rolloffAmount
    });
  });
</script>

<div class="age-section">
  <h3>AGE</h3>
  <VintageKnob
    bind:value={ageAmount}
    min={0}
    max={100}
    label="Vintage Character"
    showIntensity={true}
  />
</div>

<style>
  .age-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-controls);
    padding: var(--padding-lg);
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0;
  }
</style>
```

---

### 3. Room Mics Control Component
**File**: `plugins/lofi-piano/web/src/lib/components/controls/RoomMicsControl.svelte`

**What are Room Mics?**
Intimate studio ambience controls - adding space and room character without numeric parameters:
- **Mix**: Balance between close-miked dry signal and ambient room
- **Decay Time**: How long room reverb sustains (perceptual, not numeric)
- **Room Size**: Implicit in visual feedback, not a number

#### Features
- **Two main knobs**: "Mix" and "Decay"
- **Visual feedback**: Shows ambience intensity without numbers
- **No dry/wet percentages**: Users hear the effect change
- **Accessibility**: Clear labels, keyboard navigation

#### Visual Design
```
[Room Mics Section]
   [Mix Knob]    [Decay Knob]
   (0% → 100%)   (short → long)
```

#### Svelte 5 Component
```svelte
<script>
  let roomMix = $state(0.3);      // 0-1: how much room ambience
  let roomDecay = $state(2);       // 0.5-5: reverb decay in seconds

  // Visual intensity derived from mix amount
  let ambientIntensity = $derived(roomMix);
  let roomCharacter = $derived.by(() => {
    if (roomMix === 0) return 'Dry (no room)';
    if (roomMix < 0.3) return 'Close (intimate)';
    if (roomMix < 0.7) return 'Balanced';
    return 'Ambient (lush)';
  });

  $effect(() => {
    // Update reverb parameters
    audioState.updateRoom({
      mix: roomMix,
      decayTime: roomDecay
    });
  });
</script>

<div class="room-section">
  <h3>Room Mics</h3>
  <div class="room-controls">
    <div class="control-group">
      <VintageKnob
        bind:value={roomMix}
        min={0}
        max={1}
        step={0.01}
        label="Mix"
        showIntensity={true}
      />
    </div>
    <div class="control-group">
      <VintageKnob
        bind:value={roomDecay}
        min={0.5}
        max={5}
        step={0.1}
        label="Decay"
        showIntensity={true}
      />
    </div>
  </div>
</div>

<style>
  .room-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-controls);
    padding: var(--padding-lg);
    border-top: 1px solid var(--color-border);
  }

  .room-controls {
    display: flex;
    gap: var(--gap-controls);
    justify-content: center;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    text-align: center;
    margin: 0;
  }
</style>
```

---

### 4. Tube Saturation Control Component
**File**: `plugins/lofi-piano/web/src/lib/components/controls/TubeSaturationControl.svelte`

**What is Tube Saturation?**
Warm coloration effect simulating analog tube amplifier distortion:
- Progressive harmonic richness
- Subtle frequency shaping
- Warmth and musicality without digital harshness

#### Features
- Single "Saturation" knob (0-100%)
- Optional visual feedback showing harmonic content
- Real-time parameter updates
- Accessibility-friendly

#### Visual Design
```
[Saturation Section]
       [Knob]
   (clean → warm)
   [Optional: visual harmonic bars]
```

#### Svelte 5 Component
```svelte
<script>
  let saturation = $state(0);      // 0-100%

  // Derived: show warmth intensity visually
  let warmthLevel = $derived(saturation / 100);
  let harmonicContent = $derived(Math.min(saturation * 2, 100));

  $effect(() => {
    audioState.updateTubeSaturation({
      drive: saturation / 100,
      output: 1 - (saturation / 100) * 0.2  // Slight output compensation
    });
  });
</script>

<div class="saturation-section">
  <h3>Tube Saturation</h3>
  <VintageKnob
    bind:value={saturation}
    min={0}
    max={100}
    step={1}
    label="Warmth"
    showIntensity={true}
  />

  <!-- Optional: Visual harmonic indicator (no numbers!) -->
  {#if saturation > 0}
    <div class="harmonic-indicator">
      <div class="harmonic-bar"></div>
    </div>
  {/if}
</div>

<style>
  .saturation-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-controls);
    padding: var(--padding-lg);
    border-top: 1px solid var(--color-border);
  }

  .harmonic-indicator {
    width: 100%;
    height: 4px;
    background: var(--color-surface);
    border-radius: var(--border-radius-md);
    overflow: hidden;
  }

  .harmonic-bar {
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--color-accent));
    width: calc(var(--harmonic-width) * 1%);
    transition: width 0.1s ease-out;
  }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    margin: 0;
  }
</style>
```

---

## Layout Architecture

### Redesigned Plugin Layout

```
┌─────────────────────────────────────────┐
│  🎹 LoFi Piano                 [v1.0.0] │  ← Minimal header
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │         [Piano Keyboard]             ││  ← Full-width keyboard
│  │   [88 keys, styling updated]         ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │         PRIMARY CONTROLS             ││
│  │                                      ││
│  │         ┌──────────────────┐         ││
│  │         │   Master Volume  │         ││  ← Knob (not slider)
│  │         │    [Large Knob]  │         ││
│  │         └──────────────────┘         ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │        VINTAGE CHARACTER (AGE)       ││
│  │                                      ││
│  │         ┌──────────────────┐         ││
│  │         │      AGE         │         ││  ← Signature feature
│  │         │   [Large Knob]   │         ││
│  │         └──────────────────┘         ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │         ROOM MICS                    ││
│  │     ┌──────────┐   ┌──────────┐     ││
│  │     │   Mix    │   │  Decay   │     ││  ← Two knobs
│  │     │ [Knob]   │   │ [Knob]   │     ││
│  │     └──────────┘   └──────────┘     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │      TUBE SATURATION                 ││
│  │                                      ││
│  │         ┌──────────────────┐         ││
│  │         │    Warmth        │         ││  ← Single control
│  │         │    [Knob]        │         ││
│  │         └──────────────────┘         ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Advanced Controls - Collapsible]      │  ← Hidden by default
│                                         │
└─────────────────────────────────────────┘
```

### Component Hierarchy

```
Layout.svelte (Main container)
├── Header (Logo, Version, Status)
├── PianoKeyboard (88-key interface - restyled)
├── ControlSections
│   ├── MasterVolumeSection
│   │   └── VintageKnob
│   ├── AGESection
│   │   └── VintageKnob
│   ├── RoomMicsSection
│   │   ├── VintageKnob (Mix)
│   │   └── VintageKnob (Decay)
│   ├── TubeSaturationSection
│   │   └── VintageKnob
│   └── AdvancedSection (Collapsible)
│       └── Additional controls (ADSR, Compression, etc.)
└── StatusFooter
```

---

## Styling Principles

### General Rules

1. **No Numeric Values in UI**
   - Remove all percentage displays (100%)
   - Remove all dB readouts (-12 dB)
   - Remove all frequency displays (440 Hz)
   - Remove all ratio displays (4:1)
   - **Exception**: Only in Advanced/Debug section for development

2. **Visual Feedback Instead of Numbers**
   - Use **arc length** to show intensity (0° → 270°)
   - Use **color intensity** to show effect strength (gold saturation)
   - Use **width/height** to show parameter changes (harmonic bars)
   - Use **opacity** to show active/inactive states

3. **Vintage Aesthetic**
   - Rounded corners (2-4px, not sharp 0px)
   - Subtle shadows only (not deep/harsh)
   - Warm color palette (creams, taupes, golds)
   - Typography: serif or monospace (nostalgic feel)

4. **Minimal Information Density**
   - One concept per visual area
   - Generous whitespace
   - Clear visual hierarchy
   - Group related controls only

---

## Accessibility Considerations

### Screen Readers & ARIA
```svelte
<VintageKnob
  aria-label="Vintage Character Effect"
  aria-describedby="age-help"
  role="slider"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow={ageAmount}
/>

<div id="age-help">
  Use arrow keys to adjust vintage character.
  Left/Right for coarse, Up/Down for fine control.
</div>
```

### Keyboard Navigation
- **Tab**: Move between controls
- **Arrow Keys**: Adjust current control (Left/Right coarse, Up/Down fine)
- **Enter/Space**: Activate buttons
- **Escape**: Close dialogs

### Visual Accessibility
- **Sufficient contrast**: Deep brown (#3D3230) on cream (#F5F1E8) = 12:1 ratio ✓
- **No color-only information**: Use multiple visual cues (color + arc + label)
- **Focus indicators**: Gold border with slight glow (2px outline)

---

## Svelte 5 Implementation Patterns

### Pattern 1: State Management with $state
```svelte
<script>
  // Simple state for knob value
  let knobValue = $state(0.5);
  let isDragging = $state(false);
</script>
```

### Pattern 2: Computed Values with $derived
```svelte
<script>
  let saturation = $state(0);

  // Auto-updated whenever saturation changes
  let harmoniContent = $derived(saturation * 2);
</script>
```

### Pattern 3: Complex Computations with $derived.by
```svelte
<script>
  let ageAmount = $state(0);

  // Complex logic that updates automatically
  let ageDescription = $derived.by(() => {
    if (ageAmount === 0) return 'Digital (pristine)';
    if (ageAmount < 30) return 'Subtle warmth';
    if (ageAmount < 70) return 'Rich vintage';
    return 'Heavily aged';
  });
</script>
```

### Pattern 4: Side Effects with $effect
```svelte
<script>
  let knobValue = $state(0.5);

  // Re-run whenever knobValue changes
  $effect(() => {
    audioNode.setParameter(knobValue);
  });
</script>
```

### Pattern 5: Event Handlers (Modern Syntax)
```svelte
<!-- Modern Svelte 5: onclick instead of on:click -->
<button onclick={() => play()}>Play</button>

<!-- No event binding needed for state -->
<input bind:value={knobValue} />
```

---

## Implementation Roadmap

### Phase 1: Core Components (Week 1)
1. **VintageKnob.svelte**: Rotary control component
   - Basic rotation based on mouse/touch input
   - Visual feedback (arc indicator)
   - Keyboard support

2. **Update design tokens**: CSS variables in root layout

### Phase 2: Control Sections (Week 2)
1. **AGESection.svelte**: Single knob, signature feature
2. **RoomMicsSection.svelte**: Two knobs for room control
3. **TubeSaturationSection.svelte**: Single knob for warmth

### Phase 3: Layout Redesign (Week 3)
1. **Update Layout.svelte**: Reorganize sections, apply styling
2. **Update ControlPanel.svelte**: Remove number display, use knobs
3. **Add visual grouping**: Spacing, borders, sections

### Phase 4: Styling & Polish (Week 4)
1. **Update PianoKeyboard.svelte**: Vintage aesthetic
2. **Refine colors**: Test on multiple screens
3. **Add transitions**: Smooth state changes
4. **Focus states**: Accessibility polish

### Phase 5: Audio Integration (Week 5)
1. **Map knobs to audio**: AGE effect, Room Mics, Tube Saturation
2. **Real-time updates**: Svelte 5 $effect integration
3. **Audio state synchronization**: Two-way binding with AudioContext

### Phase 6: Testing & Iteration (Week 6)
1. **Usability testing**: Does numbers-free design work?
2. **Audio quality**: Do effects sound good?
3. **Refinement**: Based on listening and feedback

---

## Migration Checklist

### From Current ControlPanel to Numbers-Free Design

- [ ] Remove all numeric value displays
  - [ ] Remove formatValue() function calls
  - [ ] Remove percentage displays
  - [ ] Remove dB displays
  - [ ] Remove Hz displays
  - [ ] Remove ratio displays

- [ ] Replace sliders with VintageKnob component
  - [ ] Master Volume slider → VintageKnob
  - [ ] ADSR parameters → VintageKnob (or hidden in Advanced)
  - [ ] Saturation controls → TubeSaturationControl
  - [ ] Room parameters → RoomMicsControl
  - [ ] Compression parameters → VintageKnob (Advanced section)

- [ ] Update styling
  - [ ] Apply design tokens (colors, typography, spacing)
  - [ ] Implement generous whitespace
  - [ ] Create visual grouping with spacing, not borders

- [ ] Add new components
  - [ ] AGEControl (new feature)
  - [ ] RoomMicsControl (refactored)
  - [ ] TubeSaturationControl (refactored)
  - [ ] VintageKnob (new reusable)

- [ ] Keyboard/accessibility
  - [ ] Add aria-labels to all controls
  - [ ] Support arrow key navigation
  - [ ] Ensure focus indicators visible
  - [ ] Test with screen reader

- [ ] Audio integration
  - [ ] Connect knobs to audio nodes
  - [ ] Update AGE effect implementation
  - [ ] Verify all parameters working

---

## Reference Materials

### Postcard Piano Features Mapped to LoFi Piano

| Postcard Piano | LoFi Piano | Status |
|---|---|---|
| AGE Knob | To implement | New component |
| Room Mics | Reverb (refactored) | Refactoring |
| Tube Saturation | Saturation (refactored) | Refactoring |
| Master Volume | Master Volume (refactored) | Update to Knob |
| Minimal numbers-free UI | Current: number-heavy | Complete redesign |
| Vintage aesthetic | Current: modern | Theme update |

### Key Files to Update

1. `shared/ui-components/controls/VintageKnob.svelte` ← **Create new**
2. `plugins/lofi-piano/web/src/lib/components/controls/AGEControl.svelte` ← **Create new**
3. `plugins/lofi-piano/web/src/lib/components/controls/RoomMicsControl.svelte` ← **Create/Refactor**
4. `plugins/lofi-piano/web/src/lib/components/controls/TubeSaturationControl.svelte` ← **Create/Refactor**
5. `plugins/lofi-piano/web/src/lib/components/controls/ControlPanel.svelte` ← **Redesign**
6. `plugins/lofi-piano/web/src/lib/components/Layout.svelte` ← **Redesign**
7. `plugins/lofi-piano/web/src/lib/components/piano/PianoKeyboard.svelte` ← **Restyle**

---

**Status**: Design system complete. Ready for implementation.

**Next Step**: Begin Phase 1 - Create VintageKnob component.
