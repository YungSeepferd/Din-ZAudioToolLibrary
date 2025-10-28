<!--
  Root layout for LoFi Piano plugin

  This is the main wrapper component for the entire SPA.
  All pages will be rendered within this layout.
-->

<script>
  import '../styles/global.css';
</script>

<slot />

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: #f1f5f9;
    min-height: 100vh;
  }

  :global(html) {
    scroll-behavior: smooth;
  }
</style>
