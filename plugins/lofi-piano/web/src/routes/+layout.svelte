<!--
  Root Layout - LoFi Piano
  
  Vintage Aesthetic Design System:
  - Imports global design tokens (tokens.css)
  - Sets up base typography and colors
  - Provides accessible defaults
  
  All child components inherit these design tokens.
-->

<script>
  // Import global design tokens (includes base styles)
  import '../styles/tokens.css';
</script>

<slot />

<style>
  /* Minimal global overrides - most styles come from tokens.css */
  
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar (vintage styled) */
  :global(::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(::-webkit-scrollbar-track) {
    background: var(--bg-secondary);
  }

  :global(::-webkit-scrollbar-thumb) {
    background: var(--color-taupe);
    border-radius: var(--border-radius-md);
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: var(--accent);
  }

  /* Form element defaults */
  :global(input),
  :global(button),
  :global(textarea),
  :global(select) {
    font: inherit;
    color: inherit;
  }

  :global(button) {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
  }
</style>
