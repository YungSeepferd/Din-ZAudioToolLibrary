/**
 * Preset Management System
 *
 * Manages saving, loading, and organizing audio presets for the LoFi Piano.
 * Presets include all synthesis and effect parameters.
 *
 * Features:
 * - Factory presets (built-in, read-only)
 * - User presets (saved to localStorage)
 * - Import/export functionality
 * - Preset validation
 *
 * @module stores/presets
 */

const STORAGE_KEY = 'lofi-piano-user-presets';
const CURRENT_PRESET_KEY = 'lofi-piano-current-preset';

/**
 * Factory presets (built-in, cannot be modified)
 */
export const FACTORY_PRESETS = [
  {
    id: 'default',
    name: 'Default LoFi',
    author: 'LoFi Piano',
    description: 'Warm, nostalgic piano sound with gentle saturation and reverb',
    isFactory: true,
    parameters: {
      synthesis: {
        detune: [0, 15, -20],
        attackTime: 0.05,
        decayTime: 0.2,
        sustainLevel: 0.6,
        releaseTime: 1.0
      },
      effects: {
        saturation: {
          amount: 0.3,
          tone: 0.5,
          dryWet: 1
        },
        compression: {
          threshold: -24,
          ratio: 4,
          attack: 0.003,
          release: 0.25,
          dryWet: 1
        },
        reverb: {
          decayTime: 2.0,
          roomSize: 0.5,
          preDelay: 0.02,
          dryWet: 0.3
        }
      },
      pianoState: {
        masterVolume: 0.5
      }
    }
  },
  {
    id: 'vintage-tape',
    name: 'Vintage Tape',
    author: 'LoFi Piano',
    description: 'Heavy tape saturation with compressed dynamics',
    isFactory: true,
    parameters: {
      synthesis: {
        detune: [0, 20, -25],
        attackTime: 0.08,
        decayTime: 0.3,
        sustainLevel: 0.5,
        releaseTime: 1.5
      },
      effects: {
        saturation: {
          amount: 0.6,
          tone: 0.4,
          dryWet: 1
        },
        compression: {
          threshold: -20,
          ratio: 6,
          attack: 0.005,
          release: 0.3,
          dryWet: 1
        },
        reverb: {
          decayTime: 1.5,
          roomSize: 0.4,
          preDelay: 0.01,
          dryWet: 0.25
        }
      },
      pianoState: {
        masterVolume: 0.45
      }
    }
  },
  {
    id: 'ambient-space',
    name: 'Ambient Space',
    author: 'LoFi Piano',
    description: 'Large reverb with long decay for atmospheric soundscapes',
    isFactory: true,
    parameters: {
      synthesis: {
        detune: [0, 10, -15],
        attackTime: 0.1,
        decayTime: 0.4,
        sustainLevel: 0.7,
        releaseTime: 2.0
      },
      effects: {
        saturation: {
          amount: 0.2,
          tone: 0.6,
          dryWet: 0.8
        },
        compression: {
          threshold: -30,
          ratio: 2,
          attack: 0.01,
          release: 0.5,
          dryWet: 0.8
        },
        reverb: {
          decayTime: 5.0,
          roomSize: 0.8,
          preDelay: 0.05,
          dryWet: 0.5
        }
      },
      pianoState: {
        masterVolume: 0.4
      }
    }
  },
  {
    id: 'tight-compressed',
    name: 'Tight & Compressed',
    author: 'LoFi Piano',
    description: 'Heavily compressed with minimal reverb for upfront sound',
    isFactory: true,
    parameters: {
      synthesis: {
        detune: [0, 12, -18],
        attackTime: 0.02,
        decayTime: 0.15,
        sustainLevel: 0.5,
        releaseTime: 0.8
      },
      effects: {
        saturation: {
          amount: 0.4,
          tone: 0.7,
          dryWet: 1
        },
        compression: {
          threshold: -18,
          ratio: 8,
          attack: 0.001,
          release: 0.15,
          dryWet: 1
        },
        reverb: {
          decayTime: 0.8,
          roomSize: 0.3,
          preDelay: 0.01,
          dryWet: 0.15
        }
      },
      pianoState: {
        masterVolume: 0.55
      }
    }
  },
  {
    id: 'bright-clean',
    name: 'Bright & Clean',
    author: 'LoFi Piano',
    description: 'Minimal processing with bright tone and clean sound',
    isFactory: true,
    parameters: {
      synthesis: {
        detune: [0, 8, -12],
        attackTime: 0.03,
        decayTime: 0.18,
        sustainLevel: 0.65,
        releaseTime: 1.2
      },
      effects: {
        saturation: {
          amount: 0.15,
          tone: 0.8,
          dryWet: 0.7
        },
        compression: {
          threshold: -28,
          ratio: 3,
          attack: 0.005,
          release: 0.2,
          dryWet: 0.8
        },
        reverb: {
          decayTime: 1.5,
          roomSize: 0.45,
          preDelay: 0.02,
          dryWet: 0.2
        }
      },
      pianoState: {
        masterVolume: 0.5
      }
    }
  }
];

/**
 * Load user presets from localStorage
 *
 * @returns {Array} Array of user preset objects
 */
export function loadUserPresets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const presets = JSON.parse(stored);
    return Array.isArray(presets) ? presets : [];
  } catch (error) {
    console.error('Failed to load user presets:', error);
    return [];
  }
}

/**
 * Save user presets to localStorage
 *
 * @param {Array} presets - Array of preset objects
 * @returns {boolean} Success status
 */
export function saveUserPresets(presets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    return true;
  } catch (error) {
    console.error('Failed to save user presets:', error);
    return false;
  }
}

/**
 * Get all presets (factory + user)
 *
 * @returns {Array} Combined array of all presets
 */
export function getAllPresets() {
  const userPresets = loadUserPresets();
  return [...FACTORY_PRESETS, ...userPresets];
}

/**
 * Get preset by ID
 *
 * @param {string} id - Preset ID
 * @returns {Object|null} Preset object or null if not found
 */
export function getPresetById(id) {
  const allPresets = getAllPresets();
  return allPresets.find((preset) => preset.id === id) || null;
}

/**
 * Create new user preset from current audio state
 *
 * @param {string} name - Preset name
 * @param {string} description - Preset description
 * @param {Object} audioState - Current audio state
 * @returns {Object} New preset object
 */
export function createPreset(name, description, audioState) {
  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name,
    description,
    author: 'User',
    isFactory: false,
    createdAt: new Date().toISOString(),
    parameters: {
      synthesis: { ...audioState.synthesis },
      effects: JSON.parse(JSON.stringify(audioState.effects)),
      pianoState: {
        masterVolume: audioState.pianoState.masterVolume
      }
    }
  };
}

/**
 * Save new user preset
 *
 * @param {Object} preset - Preset object to save
 * @returns {boolean} Success status
 */
export function savePreset(preset) {
  if (!preset || !preset.id || !preset.name) {
    console.error('Invalid preset object');
    return false;
  }

  const userPresets = loadUserPresets();
  const existingIndex = userPresets.findIndex((p) => p.id === preset.id);

  if (existingIndex >= 0) {
    // Update existing preset
    userPresets[existingIndex] = {
      ...preset,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new preset
    userPresets.push(preset);
  }

  return saveUserPresets(userPresets);
}

/**
 * Delete user preset
 *
 * @param {string} id - Preset ID to delete
 * @returns {boolean} Success status
 */
export function deletePreset(id) {
  // Cannot delete factory presets
  const preset = getPresetById(id);
  if (!preset || preset.isFactory) {
    console.warn('Cannot delete factory preset');
    return false;
  }

  const userPresets = loadUserPresets();
  const filtered = userPresets.filter((p) => p.id !== id);

  return saveUserPresets(filtered);
}

/**
 * Apply preset to audio state
 *
 * @param {Object} preset - Preset to apply
 * @param {Object} audioState - Audio state instance
 */
export function applyPreset(preset, audioState) {
  if (!preset || !preset.parameters) {
    console.error('Invalid preset');
    return;
  }

  try {
    // Apply synthesis parameters
    if (preset.parameters.synthesis) {
      Object.keys(preset.parameters.synthesis).forEach((key) => {
        audioState.synthesis[key] = preset.parameters.synthesis[key];
      });
    }

    // Apply effect parameters
    if (preset.parameters.effects) {
      Object.keys(preset.parameters.effects).forEach((effectName) => {
        if (audioState.effects[effectName]) {
          Object.keys(preset.parameters.effects[effectName]).forEach((param) => {
            audioState.effects[effectName][param] =
              preset.parameters.effects[effectName][param];
          });
        }
      });
    }

    // Apply piano state
    if (preset.parameters.pianoState) {
      audioState.pianoState.masterVolume =
        preset.parameters.pianoState.masterVolume;
    }

    console.log(`✓ Applied preset: ${preset.name}`);
  } catch (error) {
    console.error('Failed to apply preset:', error);
  }
}

/**
 * Export preset to JSON file
 *
 * @param {Object} preset - Preset to export
 * @returns {string} JSON string
 */
export function exportPreset(preset) {
  return JSON.stringify(preset, null, 2);
}

/**
 * Import preset from JSON string
 *
 * @param {string} jsonString - JSON string to parse
 * @returns {Object|null} Parsed preset or null on error
 */
export function importPreset(jsonString) {
  try {
    const preset = JSON.parse(jsonString);

    // Validate preset structure
    if (!preset.name || !preset.parameters) {
      throw new Error('Invalid preset structure');
    }

    // Generate new ID to avoid conflicts
    preset.id = `user-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    preset.isFactory = false;
    preset.importedAt = new Date().toISOString();

    return preset;
  } catch (error) {
    console.error('Failed to import preset:', error);
    return null;
  }
}

/**
 * Get current preset ID
 *
 * @returns {string|null} Current preset ID or null
 */
export function getCurrentPresetId() {
  try {
    return localStorage.getItem(CURRENT_PRESET_KEY);
  } catch {
    return null;
  }
}

/**
 * Set current preset ID
 *
 * @param {string} id - Preset ID
 */
export function setCurrentPresetId(id) {
  try {
    if (id) {
      localStorage.setItem(CURRENT_PRESET_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_PRESET_KEY);
    }
  } catch (error) {
    console.error('Failed to set current preset:', error);
  }
}

/**
 * Validate preset structure
 *
 * @param {Object} preset - Preset to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePreset(preset) {
  const errors = [];

  if (!preset) {
    errors.push('Preset is null or undefined');
    return { valid: false, errors };
  }

  if (!preset.name || typeof preset.name !== 'string') {
    errors.push('Preset must have a name');
  }

  if (!preset.id || typeof preset.id !== 'string') {
    errors.push('Preset must have an ID');
  }

  if (!preset.parameters || typeof preset.parameters !== 'object') {
    errors.push('Preset must have parameters object');
  } else {
    // Validate parameters structure
    if (!preset.parameters.synthesis) {
      errors.push('Missing synthesis parameters');
    }

    if (!preset.parameters.effects) {
      errors.push('Missing effects parameters');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
