<script>
  /**
   * PresetBrowser Component
   *
   * UI for browsing, loading, saving, and managing presets.
   *
   * Features:
   * - Factory presets display
   * - User presets management
   * - Save current settings as preset
   * - Import/export functionality
   * - Delete user presets
   *
   * @component
   */

  import { onMount } from 'svelte';
  import {
    getAllPresets,
    applyPreset,
    savePreset,
    deletePreset,
    createPreset,
    exportPreset,
    importPreset,
    getCurrentPresetId,
    setCurrentPresetId
  } from '$stores/presets.js';

  /** @type {Object} Audio state instance */
  export let audioState = undefined;

  let allPresets = [];
  let currentPresetId = null;
  let showSaveDialog = false;
  let showImportDialog = false;
  let newPresetName = '';
  let newPresetDescription = '';
  let importData = '';
  let filterText = '';

  onMount(() => {
    loadPresets();
    currentPresetId = getCurrentPresetId();
  });

  /**
   * Load all presets
   */
  function loadPresets() {
    allPresets = getAllPresets();
  }

  /**
   * Handle preset selection
   */
  function handlePresetClick(preset) {
    if (!audioState) return;

    applyPreset(preset, audioState);
    currentPresetId = preset.id;
    setCurrentPresetId(preset.id);
  }

  /**
   * Open save preset dialog
   */
  function openSaveDialog() {
    showSaveDialog = true;
    newPresetName = '';
    newPresetDescription = '';
  }

  /**
   * Save current settings as new preset
   */
  function handleSavePreset() {
    if (!audioState || !newPresetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    const preset = createPreset(
      newPresetName.trim(),
      newPresetDescription.trim(),
      audioState
    );

    if (savePreset(preset)) {
      loadPresets();
      currentPresetId = preset.id;
      setCurrentPresetId(preset.id);
      showSaveDialog = false;
      console.log(`✓ Saved preset: ${preset.name}`);
    } else {
      alert('Failed to save preset');
    }
  }

  /**
   * Delete user preset
   */
  function handleDeletePreset(preset) {
    if (preset.isFactory) {
      alert('Cannot delete factory presets');
      return;
    }

    if (confirm(`Delete preset "${preset.name}"?`)) {
      if (deletePreset(preset.id)) {
        if (currentPresetId === preset.id) {
          currentPresetId = null;
          setCurrentPresetId(null);
        }
        loadPresets();
        console.log(`✓ Deleted preset: ${preset.name}`);
      } else {
        alert('Failed to delete preset');
      }
    }
  }

  /**
   * Export preset to JSON file
   */
  function handleExportPreset(preset) {
    const json = exportPreset(preset);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import preset from JSON
   */
  function handleImportPreset() {
    if (!importData.trim()) {
      alert('Please paste preset JSON data');
      return;
    }

    const preset = importPreset(importData.trim());
    if (preset) {
      if (savePreset(preset)) {
        loadPresets();
        showImportDialog = false;
        importData = '';
        console.log(`✓ Imported preset: ${preset.name}`);
      } else {
        alert('Failed to save imported preset');
      }
    } else {
      alert('Invalid preset data');
    }
  }

  /**
   * Filter presets by search text
   */
  function filteredPresets() {
    if (!filterText.trim()) return allPresets;

    const search = filterText.toLowerCase();
    return allPresets.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.author?.toLowerCase().includes(search)
    );
  }

  $: displayPresets = filteredPresets();
</script>

<div class="preset-browser">
  <!-- Header -->
  <div class="browser-header">
    <h3 class="browser-title">📚 Presets</h3>

    <div class="header-actions">
      <button class="action-btn" on:click={openSaveDialog}>
        💾 Save
      </button>
      <button class="action-btn" on:click={() => (showImportDialog = true)}>
        📥 Import
      </button>
    </div>
  </div>

  <!-- Search Filter -->
  <div class="search-box">
    <input
      type="text"
      placeholder="🔍 Search presets..."
      bind:value={filterText}
      class="search-input"
    />
  </div>

  <!-- Preset List -->
  <div class="preset-list">
    {#each displayPresets as preset (preset.id)}
      <div
        class:preset-item
        class:active={currentPresetId === preset.id}
        class:factory={preset.isFactory}
      >
        <button
          class="preset-button"
          on:click={() => handlePresetClick(preset)}
        >
          <div class="preset-info">
            <span class="preset-name">{preset.name}</span>
            {#if preset.isFactory}
              <span class="preset-badge factory">Factory</span>
            {:else}
              <span class="preset-badge user">User</span>
            {/if}
          </div>
          {#if preset.description}
            <p class="preset-description">{preset.description}</p>
          {/if}
          {#if preset.author}
            <p class="preset-author">by {preset.author}</p>
          {/if}
        </button>

        <div class="preset-actions">
          <button
            class="icon-btn"
            on:click={() => handleExportPreset(preset)}
            title="Export preset"
          >
            📤
          </button>
          {#if !preset.isFactory}
            <button
              class="icon-btn delete"
              on:click={() => handleDeletePreset(preset)}
              title="Delete preset"
            >
              🗑️
            </button>
          {/if}
        </div>
      </div>
    {/each}

    {#if displayPresets.length === 0}
      <div class="empty-state">
        <p>No presets found</p>
        {#if filterText}
          <button class="link-btn" on:click={() => (filterText = '')}>
            Clear search
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Save Preset Dialog -->
{#if showSaveDialog}
  <div class="dialog-overlay" on:click={() => (showSaveDialog = false)}>
    <div class="dialog" on:click|stopPropagation>
      <h3>💾 Save Preset</h3>

      <div class="form-group">
        <label for="preset-name">Name *</label>
        <input
          id="preset-name"
          type="text"
          placeholder="My Amazing Preset"
          bind:value={newPresetName}
          class="text-input"
        />
      </div>

      <div class="form-group">
        <label for="preset-description">Description</label>
        <textarea
          id="preset-description"
          placeholder="Warm and nostalgic piano sound..."
          bind:value={newPresetDescription}
          class="text-input"
          rows="3"
        ></textarea>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-secondary" on:click={() => (showSaveDialog = false)}>
          Cancel
        </button>
        <button class="btn btn-primary" on:click={handleSavePreset}>
          Save
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Import Preset Dialog -->
{#if showImportDialog}
  <div class="dialog-overlay" on:click={() => (showImportDialog = false)}>
    <div class="dialog" on:click|stopPropagation>
      <h3>📥 Import Preset</h3>

      <div class="form-group">
        <label for="preset-data">Paste Preset JSON</label>
        <textarea
          id="preset-data"
          placeholder='{"name": "My Preset", ...}'
          bind:value={importData}
          class="text-input code"
          rows="8"
        ></textarea>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-secondary" on:click={() => (showImportDialog = false)}>
          Cancel
        </button>
        <button class="btn btn-primary" on:click={handleImportPreset}>
          Import
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .preset-browser {
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(96, 165, 250, 0.1);
    border-radius: var(--border-radius-md);
    padding: 1rem;
    max-height: 500px;
    display: flex;
    flex-direction: column;
  }

  .browser-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(96, 165, 250, 0.2);
  }

  .browser-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem 0.75rem;
    background: rgba(96, 165, 250, 0.1);
    color: var(--accent);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(96, 165, 250, 0.2);
    border-color: rgba(96, 165, 250, 0.5);
  }

  .search-box {
    margin-bottom: 0.75rem;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(96, 165, 250, 0.2);
    border-radius: var(--border-radius-sm);
    color: var(--text-primary);
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .preset-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preset-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(96, 165, 250, 0.1);
    border-radius: var(--border-radius-sm);
    padding: 0.75rem;
    transition: all 0.2s ease;
  }

  .preset-item:hover {
    border-color: rgba(96, 165, 250, 0.3);
    background: rgba(15, 23, 42, 0.8);
  }

  .preset-item.active {
    border-color: var(--accent);
    background: rgba(96, 165, 250, 0.1);
  }

  .preset-button {
    flex: 1;
    text-align: left;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0;
  }

  .preset-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .preset-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .preset-badge {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.125rem 0.375rem;
    border-radius: var(--border-radius-sm);
  }

  .preset-badge.factory {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .preset-badge.user {
    background: rgba(96, 165, 250, 0.2);
    color: var(--accent);
  }

  .preset-description {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 0.25rem 0 0;
    line-height: 1.4;
  }

  .preset-author {
    font-size: 0.7rem;
    color: #94a3b8;
    margin: 0.125rem 0 0;
    font-style: italic;
  }

  .preset-actions {
    display: flex;
    gap: 0.25rem;
  }

  .icon-btn {
    padding: 0.25rem 0.5rem;
    background: rgba(96, 165, 250, 0.1);
    border: 1px solid transparent;
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .icon-btn:hover {
    background: rgba(96, 165, 250, 0.2);
    border-color: rgba(96, 165, 250, 0.3);
  }

  .icon-btn.delete:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }

  .link-btn {
    background: none;
    border: none;
    color: var(--accent);
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.875rem;
  }

  /* Dialog Styles */
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .dialog {
    background: var(--surface-bg);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: var(--border-radius-lg);
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: var(--shadow-lg);
  }

  .dialog h3 {
    margin: 0 0 1.5rem 0;
    color: var(--accent);
    font-size: 1.25rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .text-input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(96, 165, 250, 0.2);
    border-radius: var(--border-radius-sm);
    color: var(--text-primary);
    font-size: 0.875rem;
    font-family: inherit;
  }

  .text-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .text-input.code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.75rem;
  }

  textarea.text-input {
    resize: vertical;
  }

  .dialog-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: var(--accent);
    color: var(--primary-bg);
    border: 1px solid var(--accent);
  }

  .btn-primary:hover {
    background: #3b82f6;
  }

  .btn-secondary {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid rgba(96, 165, 250, 0.3);
  }

  .btn-secondary:hover {
    background: rgba(96, 165, 250, 0.1);
    border-color: rgba(96, 165, 250, 0.5);
  }
</style>
