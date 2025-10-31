# LoFi Piano: Web to VST/AU Plugin Translation Guide
**For Senior Audio Developers**
**Date**: 2025-10-31

---

## 📋 Executive Summary

This guide provides a comprehensive strategy for translating the LoFi Piano web-based plugin (Svelte + Web Audio API) into native VST/AU plugin formats. Three primary approaches are evaluated with detailed implementation paths.

### Current Technology Stack
```
Frontend: Svelte 5 (UI framework)
Audio Engine: Web Audio API (browser-native)
Deployment: Web browser (localhost or hosted)
```

### Target Formats
- **VST3** (Virtual Studio Technology 3.0 by Steinberg)
- **AU** (Audio Unit by Apple)
- **AAX** (Avid Audio Extension - optional)

---

## 🎯 Translation Approaches Comparison

| Approach | UI Technology | Audio Engine | Effort | Native Performance | Pros | Cons |
|----------|--------------|--------------|--------|-------------------|------|------|
| **1. Pure JUCE** | C++ JUCE GUI | C++ DSP | High (100+ hours) | ✓✓✓ Excellent | Industry standard, full control, optimal performance | Requires complete UI rewrite, C++ expertise needed |
| **2. iPlug2 Hybrid** | Embedded Web View (keeps Svelte) | C++ DSP | Medium (60-80 hours) | ✓✓ Very Good | Keeps Svelte UI, modern workflow | Larger binary size, web view overhead |
| **3. Tauri Desktop** | Web (Svelte) | Web Audio API | Low (20-30 hours) | ✓ Good | Fastest path, keeps all code | Not true VST/AU, desktop app only |

**Recommended Approach**: **iPlug2 Hybrid** for best balance of development speed and native integration.

---

## 🔧 Approach 1: Pure JUCE Translation

### Overview
Complete rewrite using JUCE framework (C++). Industry-standard approach used by professional plugin developers worldwide.

### Architecture Mapping

#### Web Audio API → JUCE DSP Mapping

| Web Audio Node | JUCE Equivalent | Notes |
|----------------|-----------------|-------|
| `AudioContext` | `juce::AudioProcessor` | Main audio processing class |
| `GainNode` | `juce::dsp::Gain<float>` | Volume control |
| `BiquadFilterNode` | `juce::dsp::IIR::Filter` | Low-pass, high-pass, etc. |
| `DelayNode` | `juce::dsp::DelayLine` | Delay effects |
| `OscillatorNode` | `juce::dsp::Oscillator` | Waveform generation |
| `ConvolverNode` | `juce::dsp::Convolution` | Reverb (IR-based) |
| `DynamicsCompressorNode` | `juce::dsp::Compressor` | Dynamics processing |
| `ScriptProcessorNode` | `AudioProcessor::processBlock()` | Custom DSP (deprecated in web, native in JUCE) |

#### Svelte Components → JUCE GUI Mapping

| Svelte Component | JUCE Equivalent | Implementation |
|------------------|-----------------|----------------|
| `VintageKnob.svelte` | `juce::Slider` + custom `LookAndFeel` | Rotary slider with vintage aesthetic |
| `PianoKeyboard.svelte` | `juce::Component` + `juce::MidiKeyboardComponent` | Custom piano key rendering |
| `SpectrumAnalyzer.svelte` | `juce::AudioVisualiserComponent` | FFT-based spectrum display |
| `VUMeter.svelte` | `juce::Component` + custom painting | Level meter with peak hold |
| `ChordGenerator.svelte` | `juce::Component` + button grid | Chord selection UI |

### Implementation Steps

#### Phase 1: Project Setup (4-6 hours)
1. Install JUCE framework (latest version from juce.com)
2. Create new Audio Plugin project using Projucer
3. Configure build targets: VST3, AU, Standalone
4. Set up plugin metadata (name, manufacturer, category)

```cpp
// Example Projucer settings
Project Name: LoFiPiano
Plugin Manufacturer: YourCompany
Plugin Code: Lfpi
Plugin Formats: VST3, AU, Standalone
```

#### Phase 2: Audio Engine Translation (30-40 hours)

**Step 1: Port Piano Voice Synthesis**

Web Audio (JavaScript):
```javascript
// plugins/lofi-piano/web/src/lib/audio/synthesis/piano-voice.js
function createPianoVoice(midiNote, velocity) {
  const freq = midiToFrequency(midiNote);
  const osc = ctx.createOscillator();
  osc.frequency.value = freq;
  // ...
}
```

JUCE C++:
```cpp
// Source/PianoVoice.h
class PianoVoice : public juce::SynthesiserVoice {
public:
    void startNote(int midiNoteNumber, float velocity,
                   juce::SynthesiserSound*, int) override {
        auto freq = juce::MidiMessage::getMidiNoteInHertz(midiNoteNumber);
        oscillator.setFrequency(freq);
        envelope.noteOn();
    }

    void renderNextBlock(juce::AudioBuffer<float>& output,
                         int startSample, int numSamples) override {
        // Generate audio samples
        for (int i = 0; i < numSamples; ++i) {
            auto sample = oscillator.processSample(0.0f) * envelope.getNextSample();
            for (int ch = 0; ch < output.getNumChannels(); ++ch)
                output.addSample(ch, startSample + i, sample);
        }
    }

private:
    juce::dsp::Oscillator<float> oscillator;
    juce::ADSR envelope;
};
```

**Step 2: Port Effect Chain**

Web Audio (JavaScript):
```javascript
// plugins/lofi-piano/web/src/lib/audio/effects/reverb.js
export function createReverb(options = {}) {
  const delays = [];
  const delayTimes = [0.037, 0.041, 0.043, 0.047];
  // Multi-tap delay reverb implementation
}
```

JUCE C++:
```cpp
// Source/ReverbEffect.h
class ReverbEffect {
public:
    void prepare(const juce::dsp::ProcessSpec& spec) {
        reverb.prepare(spec);
        reverb.setParameters({
            0.5f,  // roomSize
            0.5f,  // damping
            0.3f,  // wetLevel
            0.7f,  // dryLevel
            1.0f,  // width
            0.0f   // freezeMode
        });
    }

    void process(juce::dsp::AudioBlock<float>& block) {
        reverb.process(juce::dsp::ProcessContextReplacing<float>(block));
    }

private:
    juce::dsp::Reverb reverb;
};
```

**Step 3: Implement Parameter Management**

```cpp
// Source/PluginProcessor.h
class LoFiPianoProcessor : public juce::AudioProcessor {
public:
    juce::AudioProcessorValueTreeState parameters;

    LoFiPianoProcessor()
        : parameters(*this, nullptr, "PARAMETERS",
            {
                std::make_unique<juce::AudioParameterFloat>(
                    "masterVolume", "Master Volume",
                    juce::NormalisableRange<float>(0.0f, 1.0f), 0.5f
                ),
                std::make_unique<juce::AudioParameterFloat>(
                    "ageAmount", "AGE Amount",
                    juce::NormalisableRange<float>(0.0f, 100.0f), 0.0f
                ),
                // ... more parameters
            })
    {}

    void processBlock(juce::AudioBuffer<float>& buffer,
                      juce::MidiBuffer& midiMessages) override {
        // Process MIDI and audio
        synth.renderNextBlock(buffer, midiMessages, 0, buffer.getNumSamples());

        // Apply effects
        applyAGE(buffer);
        applyReverb(buffer);
        applySaturation(buffer);

        // Master volume
        auto volume = parameters.getRawParameterValue("masterVolume")->load();
        buffer.applyGain(volume);
    }
};
```

#### Phase 3: GUI Translation (40-50 hours)

**Step 1: Create Custom LookAndFeel for Vintage Aesthetic**

```cpp
// Source/VintageLookAndFeel.h
class VintageLookAndFeel : public juce::LookAndFeel_V4 {
public:
    void drawRotarySlider(juce::Graphics& g, int x, int y, int width, int height,
                         float sliderPos, float rotaryStartAngle, float rotaryEndAngle,
                         juce::Slider& slider) override {
        // Custom vintage knob rendering
        auto bounds = juce::Rectangle<int>(x, y, width, height).toFloat();
        auto centre = bounds.getCentre();
        auto radius = juce::jmin(bounds.getWidth(), bounds.getHeight()) / 2.0f;

        // Draw knob body (warm beige/cream color)
        g.setColour(juce::Colour(0xfff5f0eb));
        g.fillEllipse(bounds.reduced(10));

        // Draw indicator
        auto angle = rotaryStartAngle + sliderPos * (rotaryEndAngle - rotaryStartAngle);
        juce::Path indicator;
        indicator.addRectangle(-3.0f, -radius + 5, 6.0f, radius * 0.4f);
        g.setColour(juce::Colour(0xffd4a574)); // Accent color
        g.fillPath(indicator, juce::AffineTransform::rotation(angle).translated(centre));
    }
};
```

**Step 2: Build Piano Keyboard Component**

```cpp
// Source/PianoKeyboardComponent.h
class PianoKeyboardComponent : public juce::Component,
                                public juce::MidiKeyboardState::Listener {
public:
    PianoKeyboardComponent(juce::MidiKeyboardState& state)
        : keyboardState(state), keyboard(state, juce::MidiKeyboardComponent::horizontalKeyboard) {
        addAndMakeVisible(keyboard);
        keyboardState.addListener(this);

        // Customize appearance
        keyboard.setKeyWidth(60.0f);
        keyboard.setScrollButtonsVisible(false);
    }

    void paint(juce::Graphics& g) override {
        // Vintage wood background
        g.fillAll(juce::Colour(0xff6d4c41));
    }

    void resized() override {
        keyboard.setBounds(getLocalBounds());
    }

private:
    juce::MidiKeyboardState& keyboardState;
    juce::MidiKeyboardComponent keyboard;
};
```

**Step 3: Main Editor Component**

```cpp
// Source/PluginEditor.h
class LoFiPianoEditor : public juce::AudioProcessorEditor {
public:
    LoFiPianoEditor(LoFiPianoProcessor& p)
        : AudioProcessorEditor(&p), processor(p),
          masterVolumeSlider(juce::Slider::RotaryVerticalDrag, juce::Slider::NoTextBox),
          ageSlider(juce::Slider::RotaryVerticalDrag, juce::Slider::NoTextBox) {

        // Set custom look and feel
        setLookAndFeel(&vintageLookAndFeel);

        // Setup knobs
        addAndMakeVisible(masterVolumeSlider);
        masterVolumeAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
            processor.parameters, "masterVolume", masterVolumeSlider
        );

        // Setup keyboard
        addAndMakeVisible(pianoKeyboard);

        setSize(1200, 800);
    }

    void paint(juce::Graphics& g) override {
        // Vintage beige background
        g.fillAll(juce::Colour(0xffeee8db));

        // Title
        g.setColour(juce::Colours::black);
        g.setFont(juce::Font(32.0f, juce::Font::bold));
        g.drawText("🎹 LoFi Piano", 20, 20, 300, 40, juce::Justification::left);
    }

    void resized() override {
        auto area = getLocalBounds();

        // Header
        area.removeFromTop(80);

        // Controls
        auto controlArea = area.removeFromTop(300);
        masterVolumeSlider.setBounds(controlArea.removeFromLeft(120).reduced(20));
        ageSlider.setBounds(controlArea.removeFromLeft(120).reduced(20));

        // Keyboard
        pianoKeyboard.setBounds(area.reduced(20));
    }

private:
    LoFiPianoProcessor& processor;
    VintageLookAndFeel vintageLookAndFeel;

    juce::Slider masterVolumeSlider, ageSlider;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment>
        masterVolumeAttachment, ageAttachment;

    PianoKeyboardComponent pianoKeyboard;
};
```

#### Phase 4: Testing & Optimization (10-15 hours)
1. Test in DAWs (Ableton Live, Logic Pro, FL Studio, Reaper)
2. Verify automation works correctly
3. Test preset saving/loading
4. Profile CPU usage and optimize DSP
5. Test on multiple sample rates (44.1, 48, 96 kHz)

### Build & Distribution

```bash
# macOS (Xcode)
open LoFiPiano.xcodeproj
# Build for Release
# Products will be in: ~/Library/Audio/Plug-Ins/

# Windows (Visual Studio)
start LoFiPiano.sln
# Build for Release x64
# Products will be in: C:\Program Files\Common Files\VST3\

# Linux
make CONFIG=Release
```

### Pros & Cons

**Pros**:
- ✓ Native performance (no web overhead)
- ✓ Industry-standard approach
- ✓ Full control over every aspect
- ✓ Optimal CPU usage
- ✓ Small binary size (~5-10 MB)
- ✓ Professional plugin ecosystem support

**Cons**:
- ✗ Complete UI rewrite required
- ✗ C++ expertise needed
- ✗ Longer development time (100+ hours)
- ✗ No code reuse from Svelte UI
- ✗ Steeper learning curve for web developers

---

## 🔧 Approach 2: iPlug2 Hybrid (Recommended)

### Overview
Embed the Svelte UI in a web view while implementing audio processing in C++. Best hybrid approach for web developers.

### Architecture

```
┌─────────────────────────────────────┐
│  iPlug2 Plugin Container            │
│                                     │
│  ┌───────────────┐  ┌─────────────┐│
│  │ Web View      │  │ C++ DSP     ││
│  │ (Chromium)    │  │ Engine      ││
│  │               │  │             ││
│  │  Svelte UI    │◄─┼─► Audio    ││
│  │  (unchanged)  │  │   Processing││
│  │               │  │             ││
│  └───────────────┘  └─────────────┘│
│         ▲                  ▲        │
│         │                  │        │
│         └──────────────────┘        │
│           IPC/WebSockets            │
└─────────────────────────────────────┘
```

### Implementation Steps

#### Phase 1: Setup iPlug2 Project (4-6 hours)

```bash
# Clone iPlug2
git clone --recursive https://github.com/iPlug2/iPlug2.git
cd iPlug2/Examples

# Duplicate template
cp -r IPlugEffect LoFiPiano
cd LoFiPiano

# Edit config.h
nano config.h
```

```cpp
// config.h
#define PLUG_NAME "LoFi Piano"
#define PLUG_MFR "YourCompany"
#define PLUG_VERSION_HEX 0x00010000
#define PLUG_VERSION_STR "1.0.0"
#define PLUG_UNIQUE_ID 'Lfpi'
#define PLUG_MFR_ID 'Acme'
#define PLUG_URL_STR "https://yourcompany.com/lofi-piano"
#define PLUG_EMAIL_STR "support@yourcompany.com"
#define PLUG_CLASS_NAME LoFiPiano

#define BUNDLE_NAME "LoFiPiano"
#define BUNDLE_MFR "YourCompany"
#define BUNDLE_DOMAIN "com"

#define PLUG_CHANNEL_IO "0-2"  // Instrument plugin (no audio input, stereo output)
#define PLUG_LATENCY 0
#define PLUG_TYPE 1  // Effect = 0, Instrument = 1, MIDI Effect = 2
```

#### Phase 2: Integrate Web View (8-10 hours)

```cpp
// LoFiPiano.h
#include "IPlug_include_in_plug_hdr.h"
#include "IWebView.h"

class LoFiPiano final : public Plugin {
public:
    LoFiPiano(const InstanceInfo& info);

    void ProcessBlock(sample** inputs, sample** outputs, int nFrames) override;
    void OnReset() override;
    void OnParamChange(int paramIdx) override;

private:
    // Audio engine components (port from web audio)
    std::unique_ptr<PianoSynth> synth;
    std::unique_ptr<ReverbEffect> reverb;
    std::unique_ptr<SaturationEffect> saturation;

    // Web view for Svelte UI
    IWebView* webView = nullptr;

    // IPC messaging
    void SendMessageToUI(const char* msgType, const char* data);
    void OnMessageFromUI(const char* msgType, const char* data);
};

// LoFiPiano.cpp
LoFiPiano::LoFiPiano(const InstanceInfo& info) : Plugin(info, MakeConfig(kNumParams, kNumPrograms)) {
    // Create parameters
    GetParam(kMasterVolume)->InitDouble("Master Volume", 50.0, 0.0, 100.0, 0.1, "%");
    GetParam(kAGEAmount)->InitDouble("AGE Amount", 0.0, 0.0, 100.0, 0.1, "%");
    // ... more parameters

    // Initialize audio engine
    synth = std::make_unique<PianoSynth>();
    reverb = std::make_unique<ReverbEffect>();
    saturation = std::make_unique<SaturationEffect>();

#if IPLUG_EDITOR
    // Create web view and load Svelte app
    mMakeGraphicsFunc = [&]() {
        return MakeGraphics(*this, PLUG_WIDTH, PLUG_HEIGHT, PLUG_FPS, GetScaleForScreen(PLUG_WIDTH, PLUG_HEIGHT));
    };

    mLayoutFunc = [&](IGraphics* pGraphics) {
        // Load bundled Svelte app
        webView = pGraphics->AttachWebView("file:///ui/index.html");

        // Setup bidirectional messaging
        webView->SetMessageCallback([this](const char* msg) {
            // Parse JSON message from Svelte UI
            OnMessageFromUI(msg);
        });
    };
#endif
}

void LoFiPiano::OnParamChange(int paramIdx) {
    // Send parameter changes to UI
    char msg[256];
    sprintf(msg, "{\"param\": %d, \"value\": %.2f}", paramIdx, GetParam(paramIdx)->Value());
    SendMessageToUI("paramChange", msg);
}

void LoFiPiano::SendMessageToUI(const char* msgType, const char* data) {
    if (webView) {
        char fullMsg[512];
        sprintf(fullMsg, "{\"type\": \"%s\", \"data\": %s}", msgType, data);
        webView->EvaluateJavaScript(fullMsg);
    }
}
```

#### Phase 3: Adapt Svelte UI for IPC (10-12 hours)

**Create Bridge Layer** (`plugins/lofi-piano/web/src/lib/plugin-bridge.js`):

```javascript
/**
 * Plugin Bridge for iPlug2 Communication
 * Handles IPC between Svelte UI and native plugin
 */

class PluginBridge {
  constructor() {
    this.isNativePlugin = typeof window.iPlug !== 'undefined';
    this.parameterCallbacks = new Map();

    if (this.isNativePlugin) {
      // Setup message receiver from native plugin
      window.addEventListener('pluginMessage', (e) => {
        this.handleNativeMessage(e.detail);
      });
    }
  }

  /**
   * Set parameter value (sends to native plugin)
   */
  setParameter(paramId, value) {
    if (this.isNativePlugin) {
      window.iPlug.setParameter(paramId, value);
    } else {
      // Web Audio API fallback
      this.audioState.setParameter(paramId, value);
    }
  }

  /**
   * Subscribe to parameter changes from native plugin
   */
  onParameterChange(paramId, callback) {
    this.parameterCallbacks.set(paramId, callback);
  }

  /**
   * Handle messages from native plugin
   */
  handleNativeMessage(msg) {
    if (msg.type === 'paramChange') {
      const callback = this.parameterCallbacks.get(msg.param);
      if (callback) callback(msg.value);
    }
  }
}

export const pluginBridge = new PluginBridge();
```

**Update Svelte Components** (minimal changes):

```svelte
<!-- VintageKnob.svelte -->
<script>
  import { pluginBridge } from '$lib/plugin-bridge.js';

  let { value = $bindable(0), paramId, min = 0, max = 100 } = $props();

  // Send to plugin when value changes
  $effect(() => {
    pluginBridge.setParameter(paramId, value);
  });

  // Update UI when plugin changes parameter (automation)
  $effect(() => {
    pluginBridge.onParameterChange(paramId, (newValue) => {
      value = newValue;
    });
  });
</script>

<!-- Rest of component unchanged -->
```

#### Phase 4: Bundle Svelte App for Plugin (4-6 hours)

```javascript
// vite.config.js (modified for plugin embedding)
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: '../native/resources/ui',  // Output to iPlug2 resources
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
```

```bash
# Build Svelte app for embedding
cd plugins/lofi-piano/web
pnpm build

# iPlug2 will bundle resources folder into plugin binary
```

#### Phase 5: Build & Test (6-8 hours)

```bash
# Build plugin with embedded web UI
cd iPlug2/Examples/LoFiPiano
./duplicate.py

# macOS
xcodebuild -project LoFiPiano-macOS.xcodeproj -configuration Release

# Windows
msbuild LoFiPiano.sln /p:Configuration=Release

# Test in DAW
# macOS: ~/Library/Audio/Plug-Ins/VST3/LoFiPiano.vst3
# Windows: C:\Program Files\Common Files\VST3\LoFiPiano.vst3
```

### Pros & Cons

**Pros**:
- ✓ Keep Svelte UI (minimal changes)
- ✓ Native audio performance
- ✓ Web developers can contribute to UI
- ✓ Fast iteration (hot reload during development)
- ✓ Full VST3/AU compatibility
- ✓ Modern UI framework advantages

**Cons**:
- ✗ Larger binary size (~30-50 MB due to Chromium)
- ✗ Web view overhead (small CPU cost)
- ✗ IPC complexity for parameter automation
- ✗ Requires understanding both web and C++

---

## 🔧 Approach 3: Tauri Desktop Wrapper

### Overview
Wrap the web app as a standalone desktop application (not a true VST/AU plugin).

### Quick Implementation (20-30 hours)

```bash
# Install Tauri CLI
cargo install tauri-cli

# Initialize Tauri in existing Svelte project
cd plugins/lofi-piano/web
pnpm add -D @tauri-apps/cli @tauri-apps/api

# Create Tauri config
pnpm tauri init

# Build desktop app
pnpm tauri build
```

### Pros & Cons

**Pros**:
- ✓ Fastest implementation (20-30 hours)
- ✓ Keep 100% of existing code
- ✓ Cross-platform (macOS, Windows, Linux)
- ✓ Small binary size (~10-15 MB)
- ✓ Easy distribution

**Cons**:
- ✗ NOT a true VST/AU plugin (doesn't load in DAWs)
- ✗ Standalone app only
- ✗ Can't use in Ableton, Logic, FL Studio, etc.
- ✗ No plugin automation

**Use Case**: Suitable for a standalone version distributed alongside the VST/AU, but not a replacement.

---

## 📊 Effort Comparison Summary

| Task | Pure JUCE | iPlug2 Hybrid | Tauri Desktop |
|------|-----------|---------------|---------------|
| Audio Engine Port | 30-40 hours | 30-40 hours | 0 hours (keep Web Audio) |
| UI Development | 40-50 hours | 10-15 hours (bridge only) | 0 hours |
| Integration & Testing | 10-15 hours | 8-12 hours | 5-8 hours |
| Learning Curve | High (C++ + JUCE) | Medium (C++ + IPC) | Low (just Tauri config) |
| **TOTAL EFFORT** | **100+ hours** | **60-80 hours** | **20-30 hours** |

---

## 🎯 Recommended Path Forward

### For Production VST/AU Plugin: **iPlug2 Hybrid**

**Rationale**:
1. **Balanced Effort**: 60-80 hours vs 100+ for pure JUCE
2. **Code Reuse**: Keep Svelte UI (80% code reuse)
3. **Native Performance**: C++ audio engine for optimal DSP
4. **Modern Workflow**: Web developers can contribute
5. **Full Compatibility**: VST3, AU, AAX support

### Implementation Timeline (8-10 weeks part-time)

**Week 1-2**: iPlug2 setup, project configuration
**Week 3-4**: Port audio engine to C++
**Week 5-6**: Implement IPC bridge, adapt Svelte UI
**Week 7-8**: Testing, optimization, bug fixes
**Week 9-10**: Distribution, documentation, release

### Fallback Option: Tauri Desktop + Future VST/AU

If resources are limited, consider:
1. **Phase 1**: Release Tauri desktop version (standalone app)
2. **Phase 2**: Develop VST/AU with iPlug2 hybrid approach later

This provides immediate value while working toward the full plugin.

---

## 🔑 Key Implementation Practices

### 1. Audio Graph Documentation

**Document your audio graph clearly for translation**:

```
Input (MIDI)
  → Piano Synth (oscillators + envelopes)
  → AGE Filter (vintage character)
  → Room Mics Reverb (multi-tap delay)
  → Tube Saturation (waveshaping)
  → Master Volume
  → Output (Stereo)
```

### 2. Parameter Mapping

**Create a parameter mapping table**:

| Parameter Name | Web Audio Range | VST/AU Range | Scaling |
|----------------|-----------------|--------------|---------|
| Master Volume | 0.0 - 1.0 | 0 - 100% | Linear |
| AGE Amount | 0 - 100 | 0 - 100% | Linear |
| Room Mix | 0.0 - 1.0 | 0 - 100% | Linear |
| Room Decay | 0.1 - 10.0 seconds | 0 - 100% | Exponential (map to 0.1-10s) |
| Saturation | 0.0 - 1.0 | 0 - 100% | Linear |

### 3. DSP Algorithm Preservation

**Keep DSP algorithms pure functions** for easy translation:

```javascript
// Good: Pure function (easy to translate)
function applySaturation(sample, amount) {
  return Math.tanh(sample * (1 + amount * 9));
}

// Bad: Web Audio API specific (hard to translate)
function applySaturation(scriptNode, amount) {
  scriptNode.onaudioprocess = (e) => {
    // Web Audio specific code
  };
}
```

### 4. Version Control Strategy

```bash
# Branch structure
main
├── web-version (Svelte + Web Audio)
├── juce-port (JUCE C++ rewrite)
└── iplug2-hybrid (iPlug2 hybrid approach)
```

---

## 📚 Resources & References

### JUCE Framework
- Official Site: https://juce.com
- Documentation: https://docs.juce.com
- Tutorials: https://juce.com/learn/tutorials
- Forum: https://forum.juce.com
- Book: "Getting Started with JUCE" by Martin Robinson

### iPlug2 Framework
- GitHub: https://github.com/iPlug2/iPlug2
- Documentation: https://iplug2.github.io
- Examples: https://github.com/iPlug2/iPlug2/tree/master/Examples
- Forum: https://forum.juce.com (same community)

### Tauri Desktop
- Official Site: https://tauri.app
- Documentation: https://tauri.app/v1/guides/
- GitHub: https://github.com/tauri-apps/tauri

### Audio DSP References
- "Designing Audio Effect Plugins in C++" by Will Pirkle
- "The Audio Programming Book" by Richard Boulanger
- DSP Stack Exchange: https://dsp.stackexchange.com
- Web Audio API Spec: https://www.w3.org/TR/webaudio/

---

## 📝 Next Steps

### Immediate Actions
1. **Evaluate Resources**: Assess available development time and C++ expertise
2. **Prototype Audio Engine**: Port one effect (e.g., reverb) to C++ as proof of concept
3. **Test iPlug2 Setup**: Build a minimal iPlug2 plugin with web view
4. **Create Timeline**: Estimate realistic completion date based on approach chosen

### Questions to Answer
- What is the target release date?
- Do you have C++ developers available?
- Is VST/AU required immediately, or can it wait?
- What is the priority: time-to-market vs. native performance?

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Author**: Senior Audio Developer
**Status**: Complete Strategy Guide
