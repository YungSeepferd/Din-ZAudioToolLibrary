# Svelte 5 Quick Reference - Din-ZAudioToolLibrary Standards

**Status**: ✅ All components compliant
**Build**: ✅ Passing (487ms)
**Documentation**: ✅ Comprehensive

---

## The 5-Minute Svelte 5 Pattern

```svelte
<script>
  // 1. PROPS - Use $props() with $bindable() for two-way binding
  let {
    value = $bindable(0),    // Bindable prop
    min = 0,                 // Regular prop
    onChange                 // Callback prop
  } = $props();

  // 2. STATE - Use $state() for reactive local state
  let isDragging = $state(false);
  let count = $state(0);

  // 3. DERIVED - Use $derived() for computed read-only values
  let normalized = $derived(value / 100);
  let description = $derived.by(() => {
    return normalized > 0.5 ? 'High' : 'Low';
  });

  // 4. EFFECTS - Use $effect() for side effects with cleanup
  $effect(() => {
    console.log(`Value: ${value}`);
    onChange?.(value);

    // Return cleanup function (required!)
    return () => {
      console.log('Cleaning up');
    };
  });

  // 5. HANDLERS - Use onevent properties (not on: directive)
  function handleClick() {
    count++;
  }
</script>

<!-- Use onevent properties (NOT on:click) -->
<button onclick={handleClick}>Count: {count}</button>
<p>Normalized: {normalized} ({description})</p>
```

---

## Svelte 4 → Svelte 5 Migration

| Svelte 4 | Svelte 5 | Rule |
|----------|----------|------|
| `let x;` | `let x = $state(0)` | **State must use $state()** |
| `$: y = x * 2;` | `let y = $derived(x * 2)` | **Computed values use $derived()** |
| `$: runEffect()` | `$effect(() => runEffect())` | **Side effects use $effect()** |
| `export let prop;` | `let { prop } = $props()` | **Props use $props()** |
| `on:click={h}` | `onclick={h}` | **Handlers are properties** |
| `createEventDispatcher()` | Callback props | **Use callbacks, not dispatchers** |
| `:global { --var: }` | `.class { --var: }` | **CSS vars are scoped** |

---

## Critical Rules (Don't Break These!)

### ✅ Rule 1: Props Are NOT Reactive by Default
```svelte
<!-- ❌ Wrong -->
let { value } = $props();
value = 42;  // Don't mutate!

<!-- ✅ Right -->
let { value = $bindable(0) } = $props();
// Parent controls: <Comp bind:value={x} />
```

### ✅ Rule 2: $effect Must Have Cleanup
```svelte
<!-- ❌ Wrong - Memory leak -->
$effect(() => {
  document.addEventListener('click', handler);
});

<!-- ✅ Right - Cleanup on unmount -->
$effect(() => {
  document.addEventListener('click', handler);
  return () => {
    document.removeEventListener('click', handler);
  };
});
```

### ✅ Rule 3: Don't Mutate Derived Values
```svelte
<!-- ❌ Wrong -->
let sum = $derived(a + b);
sum = 100;  // Error! Read-only

<!-- ✅ Right -->
let sum = $derived(a + b);  // Just read it
```

### ✅ Rule 4: Runes ONLY in .svelte Files
```javascript
// ❌ Wrong - .js file
export const state = $state({ count: 0 });

// ✅ Right - .svelte.js file
export const state = $state({ count: 0 });

// ✅ Also right - .js file
export const state = { count: 0 };  // Plain JS
```

### ✅ Rule 5: CSS Vars Are Component-Scoped
```svelte
<!-- ❌ Wrong - Svelte 5 doesn't allow this -->
<style>
  :global {
    --color-gold: #d4a574;
  }
</style>

<!-- ✅ Right - Define in component selector -->
<style>
  .component {
    --color-gold: #d4a574;
  }
</style>
```

---

## Component Documentation Template

Copy this for new components:

```svelte
<script>
  /**
   * MyComponent.svelte
   *
   * CONCEPT: What does this do?
   *
   * DESIGN PHILOSOPHY:
   * - Why was it designed this way?
   * - What problem does it solve?
   *
   * SVELTE 5 PATTERNS USED:
   * - $props() for props
   * - $state() for state
   * - $derived() for computed values
   *
   * USAGE:
   * <MyComponent bind:value={x} onChange={h} />
   */

  // ===== PROPS =====
  let { value = $bindable(0), onChange } = $props();

  // ===== STATE =====
  let isOpen = $state(false);

  // ===== DERIVED =====
  let normalized = $derived(value / 100);

  // ===== EFFECTS =====
  $effect(() => {
    onChange?.(value);
  });

  // ===== HANDLERS =====
  function toggle() {
    isOpen = !isOpen;
  }
</script>

<button onclick={toggle}>
  {isOpen ? 'Open' : 'Closed'}
</button>
```

---

## Common Patterns

### Pattern 1: Two-Way Binding
```svelte
<script>
  let { frequency = $bindable(440) } = $props();
</script>

<!-- Parent: <Knob bind:frequency={myFreq} /> -->
<input bind:value={frequency} />
```

### Pattern 2: Event Callbacks
```svelte
<script>
  let { onChange, onSubmit } = $props();
</script>

<button onclick={() => onChange?.()}>Click</button>
<button onclick={() => onSubmit?.()}>Submit</button>
```

### Pattern 3: Derived Descriptions
```svelte
<script>
  let { value } = $props();

  let description = $derived.by(() => {
    if (value < 0.33) return 'Low';
    if (value < 0.66) return 'Medium';
    return 'High';
  });
</script>

<p>{description}</p>
```

### Pattern 4: Conditional Rendering with State
```svelte
<script>
  let isVisible = $state(false);
</script>

{#if isVisible}
  <div>Visible content</div>
{/if}

<button onclick={() => isVisible = !isVisible}>
  Toggle
</button>
```

### Pattern 5: Event Listener Cleanup
```svelte
<script>
  $effect(() => {
    const handler = (e) => console.log(e);
    document.addEventListener('click', handler);

    // Return cleanup function
    return () => {
      document.removeEventListener('click', handler);
    };
  });
</script>
```

---

## Debugging Tips

### 1. Use $inspect() to debug state
```svelte
<script>
  let value = $state(0);
  $inspect(value);  // Logs to console when value changes
</script>
```

### 2. Check which variables affect $derived
```svelte
<script>
  let a = $state(1);
  let b = $state(2);

  // Only uses 'a' - changes to 'b' won't trigger update
  let sum = $derived(a + 1);
</script>
```

### 3. Watch for reactive loops in $effect
```svelte
<!-- ❌ This creates an infinite loop! -->
$effect(() => {
  value++;  // Updates value, triggers effect again!
});

<!-- ✅ Use $derived instead -->
let doubled = $derived(value * 2);  // Read-only
```

---

## Reference Components

### VintageKnob (Most Complete)
**Location**: `shared/ui-components/controls/VintageKnob.svelte`
- 551 lines with full documentation
- Shows all Svelte 5 patterns
- Demonstrates accessibility
- Reference implementation

### AGEControl (Simple)
**Location**: `plugins/lofi-piano/web/src/lib/components/controls/AGEControl.svelte`
- Simple prop wrapper
- Shows $derived.by() usage
- Good for basic patterns

---

## Documentation

### Full Guides
- `docs/IMPLEMENTATION-SUMMARY.md` - Complete overview
- `docs/SVELTE5-STANDARDS-CRITICAL-REVIEW.md` - Critical review
- `CLAUDE.md` - Svelte 5 Standards section

### Quick Reference
- `SVELTE5-QUICK-REFERENCE.md` - This file

---

## Checklist for New Components

- [ ] Using `$props()` for all props
- [ ] Using `$bindable()` for two-way props
- [ ] Using `$state()` for local state
- [ ] Using `$derived()` for computed values
- [ ] Using `$effect()` with cleanup for side effects
- [ ] Using `onevent` properties (not `on:` directive)
- [ ] Have proper TypeScript types (if using TS)
- [ ] Have ARIA labels and accessibility
- [ ] Have comprehensive comments
- [ ] Tested for memory leaks
- [ ] CSS custom properties scoped (not :global)

---

## Common Mistakes

| ❌ Mistake | ✅ Fix |
|-----------|--------|
| `let x;` then use directly | `let x = $state(0);` |
| `$effect(() => { x++; })` | `let doubled = $derived(x * 2);` |
| `export let prop;` | `let { prop } = $props();` |
| `on:click={h}` | `onclick={h}` |
| `$effect` without cleanup | Return cleanup function |
| Mutating derived values | Use $state, not $derived |
| Using runes in .js files | Use in .svelte or .svelte.js only |
| `:global { --var: }` | Define in `.class { --var: }` |

---

## Resources

- Official Svelte 5 Docs: https://svelte.dev
- Svelte 5 Migration Guide: https://svelte.dev/docs/v5-migration-guide
- Web Audio API: https://www.w3.org/TR/webaudio/
- Accessibility (ARIA): https://www.w3.org/WAI/ARIA/

---

**Last Updated**: October 29, 2025
**Status**: ✅ Ready for Production
**Svelte Version**: ^5.0.0
**SvelteKit Version**: ^2.0.0
