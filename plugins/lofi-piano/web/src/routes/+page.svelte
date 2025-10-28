<!--
  LoFi Piano Plugin - Main Page

  This is the single-page app entry point.
  The entire plugin UI renders on this page.
-->

<script>
  import { onMount } from 'svelte';
  import Layout from '$components/Layout.svelte';

  onMount(() => {
    console.log('🎹 LoFi Piano loaded');
  });
</script>

<Layout />

<style>
  :global(main) {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
