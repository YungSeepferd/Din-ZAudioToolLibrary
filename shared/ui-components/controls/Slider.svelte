<script>
  /**
   * Slider.svelte - Reusable range input control
   *
   * A basic slider component for linear parameter control
   *
   * Props:
   * - value: Current numeric value (bound)
   * - min/max: Value range
   * - step: Increment size
   * - label: Display label
   * - vertical: Vertical orientation (default: false)
   * - showValue: Show/hide numeric value display (default: false for numbers-free design)
   */
  let {
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    label = '',
    vertical = false,
    showValue = false  // Hide numbers by default (numbers-free design)
  } = $props();
</script>

<div class="slider-container" class:vertical>
  {#if label}
    <label>{label}</label>
  {/if}
  <input
    type="range"
    {min}
    {max}
    {step}
    bind:value
    class="slider"
    role="slider"
    aria-label={label}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
  />
  {#if showValue}
    <span class="value-display">{value.toFixed(1)}</span>
  {/if}
</div>

<style>
  .slider-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .slider-container.vertical {
    flex-direction: row;
    align-items: center;
    width: auto;
    height: 150px;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9ca3af;
  }

  .slider {
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(
      to right,
      #3b82f6 0%,
      #3b82f6 calc(((var(--value) - var(--min)) / (var(--max) - var(--min))) * 100%),
      #374151 calc(((var(--value) - var(--min)) / (var(--max) - var(--min))) * 100%),
      #374151 100%
    );
    cursor: pointer;
    outline: none;
    --value: 0;
    --min: 0;
    --max: 100;
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(to bottom, #fff, #e5e7eb);
    cursor: grab;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    border: 1px solid #9ca3af;
  }

  .slider::-webkit-slider-thumb:active {
    cursor: grabbing;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  }

  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(to bottom, #fff, #e5e7eb);
    cursor: grab;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    border: 1px solid #9ca3af;
  }

  .slider::-moz-range-thumb:active {
    cursor: grabbing;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  }

  .slider.vertical {
    width: 6px;
    height: 100%;
  }

  .value-display {
    font-size: 0.75rem;
    color: #d1d5db;
    font-variant-numeric: tabular-nums;
  }
</style>
