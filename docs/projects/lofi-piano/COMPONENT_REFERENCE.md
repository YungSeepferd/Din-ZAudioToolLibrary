# LoFi Piano Component Reference
## Numbers-Free Audio UI Component Guide

> Quick reference for using the new Postcard Piano-inspired control components.

---

## VintageKnob Component

### Basic Usage

```svelte
<script>
  import VintageKnob from '@ui/controls/VintageKnob.svelte';

  let frequency = $state(440);
</script>

<VintageKnob
  bind:value={frequency}
  min={20}
  max={20000}
  step={10}
  label="Frequency"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|---|
| `value` | number | - | **Required**. Current value (must be bindable with `bind:`) |
| `min` | number | 0 | Minimum value |
| `max` | number | 100 | Maximum value |
| `step` | number | 1 | Increment/decrement step size |
| `label` | string | 'Control' | Display label (no numbers shown) |
| `showIntensity` | boolean | true | Show visual intensity arc |
| `disabled` | boolean | false | Disable interaction |
| `ariaLabel` | string | label | Accessibility label for screen readers |
| `ariaDescribedBy` | string \| null | null | ID of element describing the control |

### Interaction

- **Mouse drag**: Rotate knob by dragging
- **Arrow keys**: Fine control
  - Right/Up: Increase by `step`
  - Left/Down: Decrease by `step`
- **Touch**: Drag on mobile/tablet
- **Tab**: Navigate between controls
- **Space/Enter**: Not applicable (rotation-based)

### Visual Behavior

- **Pointer**: Gold indicator showing current position
- **Arc**: Optional background arc + active arc showing intensity
- **State**: Changes color/shadow on hover and drag
- **Size**: 80px diameter (fixed)

### Styling

Uses design tokens from `DESIGN_SYSTEM.md`:
- `--color-surface`: Background
- `--color-border`: Outer border
- `--color-accent`: Pointer and active arc
- `--shadow-sm/md`: Hover/drag states

### Example: Volume Control

```svelte
<script>
  import VintageKnob from '@ui/controls/VintageKnob.svelte';

  let volume = $state(0.5);

  // Update audio when volume changes
  $effect(() => {
    audioContext.destination.maxChannelCount = volume;
  });
</script>

<VintageKnob
  bind:value={volume}
  min={0}
  max={1}
  step={0.05}
  label="Level"
  showIntensity={true}
  ariaLabel="Master Volume Control"
/>
```

---

## AGEControl Component

### Basic Usage

```svelte
<script>
  import AGEControl from '$lib/components/controls/AGEControl.svelte';

  let ageAmount = $state(0);
</script>

<AGEControl bind:ageAmount={ageAmount} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|---|
| `ageAmount` | number | 0 | **Required**. AGE intensity 0-100% (bindable) |

### Audio Effect

Adjusts three parameters automatically:
```javascript
let saturationAmount = (ageAmount / 100) * 0.3;      // 0-30%
let rolloffAmount = (ageAmount / 100) * 1500;        // 0-1500 Hz
let modulationAmount = (ageAmount / 100) * 0.05;     // 0-5%
```

### Perceptual Feedback

- 0%: "Digital (pristine)"
- 1-24%: "Subtle warmth"
- 25-49%: "Warm vintage"
- 50-74%: "Rich analog"
- 75-100%: "Heavily aged"

### Features

- ✅ Large, prominent knob (signature feature)
- ✅ No numeric display
- ✅ Visual arc intensity indicator
- ✅ Fully accessible (ARIA labels, keyboard support)

### Integration

```svelte
<script>
  import AGEControl from './controls/AGEControl.svelte';

  let ageAmount = $state(0);

  // Listen for changes and update audio
  $effect(() => {
    const ageIntensity = ageAmount / 100;
    audioState.updateAGE({
      saturation: ageIntensity * 0.3,
      rolloff: ageIntensity * 1500,
      modulation: ageIntensity * 0.05
    });
  });
</script>

<AGEControl bind:ageAmount={ageAmount} />
```

---

## RoomMicsControl Component

### Basic Usage

```svelte
<script>
  import RoomMicsControl from '$lib/components/controls/RoomMicsControl.svelte';

  let roomMix = $state(0.3);
  let roomDecay = $state(2);
</script>

<RoomMicsControl
  bind:roomMix={roomMix}
  bind:roomDecay={roomDecay}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|---|
| `roomMix` | number | 0.3 | **Required**. Dry/wet balance 0-1 (bindable) |
| `roomDecay` | number | 2 | **Required**. Reverb decay 0.5-5 seconds (bindable) |

### Controls

**Mix Knob** (0-1):
- 0%: "Dry (no room)"
- 1-19%: "Close (intimate)"
- 20-39%: "Balanced"
- 40-69%: "Ambient"
- 70-100%: "Lush (full room)"

**Decay Knob** (0.5-5):
- < 1s: "Short (tight)"
- 1-2s: "Medium (natural)"
- 2-3.5s: "Long (spacious)"
- > 3.5s: "Very long (cathedral)"

### Features

- ✅ Two side-by-side knobs
- ✅ Perceptual descriptions update with knob position
- ✅ No numeric time/mix values displayed
- ✅ Visual intensity indicators

### Integration

```svelte
<script>
  import RoomMicsControl from './controls/RoomMicsControl.svelte';

  let roomMix = $state(0.3);
  let roomDecay = $state(2);

  $effect(() => {
    audioState.updateRoom({
      mix: roomMix,
      decayTime: roomDecay
    });
  });
</script>

<RoomMicsControl
  bind:roomMix={roomMix}
  bind:roomDecay={roomDecay}
/>
```

---

## TubeSaturationControl Component

### Basic Usage

```svelte
<script>
  import TubeSaturationControl from '$lib/components/controls/TubeSaturationControl.svelte';

  let saturation = $state(0);
</script>

<TubeSaturationControl bind:saturation={saturation} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|---|
| `saturation` | number | 0 | **Required**. Saturation amount 0-100% (bindable) |

### Perceptual Feedback

- 0%: "Clean (pristine)"
- 1-19%: "Subtle warmth"
- 20-39%: "Warm glow"
- 40-59%: "Rich saturation"
- 60-79%: "Heavy warmth"
- 80-100%: "Intense coloration"

### Features

- ✅ Single "Warmth" knob
- ✅ No numeric percentage display
- ✅ Optional harmonic indicator bar (shows when > 0%)
- ✅ Gradient visual feedback (cream → gold)

### Audio Effect

```javascript
let driveAmount = saturation / 100;              // 0-1
let outputCompensation = 1 - (saturation / 100) * 0.2;  // 0.8-1 (maintains volume)
```

### Integration

```svelte
<script>
  import TubeSaturationControl from './controls/TubeSaturationControl.svelte';

  let saturation = $state(0);

  $effect(() => {
    audioState.updateTubeSaturation({
      drive: saturation / 100,
      output: 1 - (saturation / 100) * 0.2
    });
  });
</script>

<TubeSaturationControl bind:saturation={saturation} />
```

---

## ControlPanel Component

### Complete Setup

```svelte
<script>
  import ControlPanel from '$lib/components/controls/ControlPanel.svelte';
  import { audioState } from '$lib/audio/state';
</script>

<ControlPanel audioState={audioState} />
```

### Structure

The ControlPanel includes all components in a cohesive interface:

1. **Master Volume** - Single knob
2. **AGEControl** - Vintage character
3. **RoomMicsControl** - Studio ambience
4. **TubeSaturationControl** - Warmth
5. **Advanced Controls** (collapsible):
   - Envelope (Attack, Decay, Sustain, Release)
   - Compression (Threshold, Ratio)

### Props

| Prop | Type | Default | Description |
|------|------|---------|---|
| `audioState` | object | undefined | Audio state manager with `setParameter()` method |

### Event Flow

When user adjusts a control:
1. User drags knob
2. VintageKnob updates local state
3. Svelte 5 `$effect` triggers
4. `audioState.setParameter()` called
5. Audio nodes update in real-time

### Design Features

- ✅ **Minimal by default** - Only essential controls visible
- ✅ **Numbers-free** - No numeric displays anywhere
- ✅ **Vintage aesthetic** - Warm colors, generous spacing
- ✅ **Accessible** - Full keyboard/screen reader support
- ✅ **Advanced controls hidden** - Power users can toggle them

---

## Design Tokens Reference

### Colors

```css
--color-cream:       #f5f1e8   /* Background */
--color-taupe:       #8b8680   /* Secondary text */
--color-sage:        #9ca89a   /* Borders */
--color-gold:        #d4a574   /* Accent (knob pointer) */
--color-deep-brown:  #3d3230   /* Primary text */
--color-surface:     #ebe7dd   /* Elevated surfaces */
```

### Spacing

```css
--space-2:  8px     /* Tight spacing */
--space-4:  16px    /* Standard padding */
--space-6:  24px    /* Section gaps */
--space-8:  32px    /* Large gaps */
```

### Typography

```css
--font-size-sm:      12px   /* Labels */
--font-size-base:    14px   /* Body */
--font-size-lg:      16px   /* Section titles */
--font-size-xl:      24px   /* Main title */

--font-weight-light:  300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-bold:   700
```

---

## Accessibility Checklist

When using these components, ensure:

- [ ] All VintageKnobs have `ariaLabel`
- [ ] Control sections have descriptive headings (`<h3>`)
- [ ] Colors have sufficient contrast (12:1 tested)
- [ ] Focus indicators visible (gold outline)
- [ ] Keyboard navigation works (Tab, Arrow keys)
- [ ] Screen readers can announce current value
- [ ] Touch targets are >= 44px (knobs are 80px) ✓

### Example: Accessible VintageKnob

```svelte
<VintageKnob
  bind:value={frequency}
  min={20}
  max={20000}
  step={10}
  label="Frequency"
  ariaLabel="Audio Frequency Control"
  ariaDescribedBy="freq-help"
/>

<div id="freq-help">
  Use arrow keys to adjust frequency. Higher values = brighter sound.
</div>
```

---

## Common Patterns

### Pattern 1: Linked Parameters

```svelte
<script>
  import VintageKnob from '@ui/controls/VintageKnob.svelte';

  let low = $state(0.5);
  let mid = $state(0.5);
  let high = $state(0.5);

  // Normalize all three to sum to 1
  $effect(() => {
    const sum = low + mid + high;
    const total = (low + mid + high) / 3;
    // Apply normalization...
  });
</script>

<VintageKnob bind:value={low} label="Low" />
<VintageKnob bind:value={mid} label="Mid" />
<VintageKnob bind:value={high} label="High" />
```

### Pattern 2: Conditional Display

```svelte
<script>
  import TubeSaturationControl from './controls/TubeSaturationControl.svelte';

  let saturation = $state(0);
  let showHarmonic = $derived(saturation > 0);
</script>

<TubeSaturationControl bind:saturation={saturation} />

{#if showHarmonic}
  <div class="harmonic-info">
    Harmonic richness active
  </div>
{/if}
```

### Pattern 3: Derived Parameter Names

```svelte
<script>
  import VintageKnob from '@ui/controls/VintageKnob.svelte';

  let decay = $state(2);

  let decayCharacter = $derived.by(() => {
    if (decay < 1) return 'Tight';
    if (decay < 2) return 'Natural';
    if (decay < 4) return 'Spacious';
    return 'Cathedral';
  });
</script>

<VintageKnob bind:value={decay} min={0.5} max={5} label="Decay" />
<p>Character: {decayCharacter}</p>
```

---

## Troubleshooting

### Knob doesn't respond to mouse

- Check browser console for errors
- Verify `bind:value` is used correctly
- Ensure `min`, `max`, `step` are valid numbers
- Try refreshing page

### Numbers still showing up

- Check parent component for `{value}` displays
- Verify all labels use display text, not numbers
- Ensure design tokens are loaded

### Arc not visible

- Set `showIntensity={true}` on VintageKnob
- Check SVG rendering in browser DevTools
- Verify color tokens are defined

### Accessibility issues

- Use `ariaLabel` on all controls
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Verify focus indicators visible
- Check keyboard navigation

---

## Performance Tips

1. **Use `$derived` for computed values** - Avoid `$effect` for simple calculations
2. **Limit `$effect` scope** - Only listen to directly used properties
3. **Debounce audio updates** - Group parameter changes if possible
4. **Use `:global()` for design tokens** - Prevents duplicate CSS

---

## Related Documentation

- **DESIGN_SYSTEM.md** - Complete design specification
- **IMPLEMENTATION_PROGRESS.md** - Development timeline and status
- **SVELTE5_AUDIO_GUIDE.md** - Svelte 5 audio patterns
- **WEB_AUDIO_API_GUIDE.md** - Audio processing reference

---

**Last Updated**: October 29, 2025
**Version**: 1.0 - Initial Release
**Status**: Ready for Production Use
