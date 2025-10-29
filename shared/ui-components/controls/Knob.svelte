<script>
  /**
   * Knob.svelte - Reusable rotary control
   *
   * A basic knob component that can be used for simple parameter control
   * Use VintageKnob.svelte for audio plugin UIs (better styling & features)
   *
   * Props:
   * - value: Current numeric value (bound)
   * - min/max: Value range
   * - step: Increment size
   * - label: Display label
   * - showValue: Show/hide numeric value display (default: false for numbers-free design)
   */
  let {
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    label = '',
    showValue = false  // Hide numbers by default (numbers-free design)
  } = $props();

  let isDragging = $state(false);
  let startY = $state(0);
  let startValue = $state(0);

  const normalizedValue = (value - min) / (max - min);
  const rotation = -135 + (normalizedValue * 270);

  function handleMouseDown(e) {
    isDragging = true;
    startY = e.clientY;
    startValue = value;
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const deltaValue = (deltaY / 100) * (max - min);
    value = Math.max(min, Math.min(max, startValue + deltaValue));
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -step : step;
    value = Math.max(min, Math.min(max, value + delta));
  }
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div class="knob-container">
  {#if label}
    <label>{label}</label>
  {/if}
  <div
    class="knob"
    style="transform: rotate({rotation}deg)"
    onmousedown={handleMouseDown}
    onwheel={handleWheel}
    role="slider"
    aria-label={label}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
  >
    <div class="knob-indicator" />
  </div>
  <input
    type="range"
    {min}
    {max}
    {step}
    bind:value
    class="hidden-slider"
  />
  {#if showValue}
    <span class="value-display">{value.toFixed(1)}</span>
  {/if}
</div>

<style>
  .knob-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9ca3af;
  }

  .knob {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(180deg, #4a5568, #2d3748);
    cursor: grab;
    position: relative;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1);
    transition: transform 0.1s ease;
    border: 1px solid #1a202c;
  }

  .knob:active {
    cursor: grabbing;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1);
  }

  .knob-indicator {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 16px;
    background: linear-gradient(to bottom, #fff, #d1d5db);
    border-radius: 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .hidden-slider {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .value-display {
    font-size: 0.75rem;
    color: #d1d5db;
    font-variant-numeric: tabular-nums;
  }
</style>
