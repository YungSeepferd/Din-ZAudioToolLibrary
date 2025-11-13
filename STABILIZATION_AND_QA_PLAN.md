# Din-ZAudioToolLibrary - Stabilization & QA/UX Testing Plan

**Date**: 2025-11-13
**Version**: 1.0
**Status**: Draft - Ready for Review

---

## Executive Summary

This document provides a comprehensive plan to stabilize the Din-ZAudioToolLibrary monorepo and establish professional QA/UX testing infrastructure. The repository is **production-ready at 92% QA pass rate** with excellent architecture and documentation. This plan addresses remaining stability issues and establishes systematic testing practices for future development.

### Current Health Status: **8/10**

**Strengths**:
- ✅ Well-architected monorepo with clear separation of concerns
- ✅ Comprehensive documentation (59 files, 32KB CLAUDE.md)
- ✅ Professional testing infrastructure (48/52 tests passing)
- ✅ Modern tech stack (Svelte 5, Web Audio API, PNPM, Turborepo)
- ✅ Active CI/CD with GitHub Actions (build, lint)
- ✅ Production-ready LoFi Piano plugin with 8-voice polyphony

**Areas Requiring Attention**:
- ⚠️ Missing export index files (5 files) causing import failures
- ⚠️ Dependency version inconsistencies across workspace
- ⚠️ 9 known QA issues (1 critical, 3 high, 5 medium/low)
- ⚠️ No visual regression testing
- ⚠️ No systematic UX testing infrastructure
- ⚠️ No cross-browser E2E test automation

---

## Table of Contents

1. [Current Status Analysis](#1-current-status-analysis)
2. [Critical Stabilization Issues](#2-critical-stabilization-issues)
3. [Stabilization Roadmap](#3-stabilization-roadmap)
4. [QA Infrastructure Enhancement](#4-qa-infrastructure-enhancement)
5. [UX Testing Framework](#5-ux-testing-framework)
6. [Implementation Timeline](#6-implementation-timeline)
7. [Success Metrics](#7-success-metrics)
8. [Ongoing Maintenance](#8-ongoing-maintenance)

---

## 1. Current Status Analysis

### 1.1 Repository Structure

```
Din-ZAudioToolLibrary/
├── plugins/                    # 2 plugins (_template, lofi-piano)
├── shared/
│   ├── audio-core/            # DSP library (9 modules)
│   └── ui-components/         # Svelte 5 components (7 components)
├── docs/                      # 59 documentation files
├── tools/                     # MCP servers, scripts
└── .github/workflows/         # 5 CI/CD workflows
```

**Status**: Well-organized, follows monorepo best practices

### 1.2 Code Quality Assessment

| Aspect | Status | Grade |
|--------|--------|-------|
| **Code Organization** | Clear separation, reusable patterns | A |
| **Documentation** | Comprehensive project guides | A |
| **Svelte 5 Compliance** | Modern Runes throughout | A |
| **Audio Patterns** | Professional DSP, parameter scheduling | A |
| **Testing Coverage** | 92% pass rate (48/52 tests) | B+ |
| **Dependency Management** | Version inconsistencies present | C |
| **Build System** | Turborepo + Vite configured | A |
| **CI/CD** | Basic workflows (build, lint) | B |

**Overall Code Quality**: **A-** (Excellent with minor issues)

### 1.3 Testing Infrastructure

#### Unit Tests (Vitest)
- **Location**: `shared/audio-core/music-theory/*.test.js`
- **Count**: 8 test files
- **Status**: All passing
- **Coverage**: Music theory module (scales, chords, MIDI, progressions)

#### E2E Tests (Playwright)
- **Location**: `plugins/lofi-piano/web/tests/e2e/*.spec.js`
- **Count**: 4 test suites, 52 tests total
- **Pass Rate**: 48/52 (92%)
- **Coverage**: Initialization, audio, accessibility, controls
- **Browser Support**: Chromium, Firefox, WebKit configured
- **Mobile**: Pixel 5 and iPhone 12 profiles configured

#### Failed Tests (4)
1. Polyphonic visual feedback test (critical)
2. Main element accessibility test (WCAG violation)
3. Form label association (Chord Generator)
4. Global styles warning (code quality)

### 1.4 Known Issues Summary

From `QA_WEEK_SUMMARY.md` and `QA_BUG_REPORT.md`:

#### Critical (1)
- **#1**: Polyphonic visual feedback - Multiple keys don't maintain active state

#### High Priority (3)
- **#2**: WCAG accessibility violation - Non-interactive `<main>` has click handler
- **#3**: Deprecated ScriptProcessorNode - Should migrate to AudioWorkletNode
- **#4**: BiquadFilterNode instability - Rapid parameter changes cause warnings

#### Medium Priority (3)
- **#5**: Missing keyboard handlers
- **#6**: Unused CSS selectors (related to #1)
- **#8**: Form label association issues

#### Low Priority (2)
- **#7**: Missing favicon
- **#9**: Global styles in components

### 1.5 Dependency Version Audit

#### Root Package (`package.json`)
```json
{
  "vitest": "^3.2.4",
  "@sveltejs/vite-plugin-svelte": "^3.0.0"
}
```

#### LoFi Piano Package (`plugins/lofi-piano/web/package.json`)
```json
{
  "vitest": "^1.0.0",
  "@sveltejs/vite-plugin-svelte": "^4.0.0-next.6"
}
```

**Issues Identified**:
- Vitest version mismatch: 3.2.4 vs 1.0.0 (major version difference)
- vite-plugin-svelte mismatch: 3.0.0 vs 4.0.0-next.6 (prerelease in plugin)
- Root ESLint uses deprecated config format (`.eslintrc.json`)

### 1.6 Missing Export Files

**From `shared/audio-core/package.json`**:
```json
"exports": {
  "./synthesis": "./synthesis/index.js",    // ❌ Missing
  "./effects": "./effects/index.js",        // ❌ Missing
  "./utils": "./utils/index.js"             // ❌ Missing
}
```

**From `shared/ui-components/package.json`**:
```json
"exports": {
  "./controls": "./controls/index.js",      // ❌ Missing
  "./visualizers": "./visualizers/index.js", // ❌ Missing
  "./layouts": "./layouts/index.js"         // ❌ Missing (directory doesn't exist)
}
```

**Impact**: Import failures when using declared package exports

---

## 2. Critical Stabilization Issues

### Priority 1: Export Structure (CRITICAL)

**Impact**: Import failures, broken builds
**Estimated Effort**: 2-3 hours
**Risk**: High (blocks development)

#### Tasks
1. Create `shared/audio-core/synthesis/index.js`
2. Create `shared/audio-core/effects/index.js`
3. Create `shared/audio-core/utils/index.js`
4. Create `shared/ui-components/controls/index.js`
5. Create `shared/ui-components/visualizers/index.js`
6. Either create `shared/ui-components/layouts/` directory or remove from exports
7. Test all imports work correctly

#### Example Export File
```javascript
/**
 * Synthesis Module Exports
 * @module @audio-playground/audio-core/synthesis
 */

export { createOscillator, WAVEFORMS } from './oscillators.js';
export { createADSREnvelope, createAREnvelope } from './envelopes.js';
export { createFilter, FILTER_TYPES } from './filters.js';
```

### Priority 2: Dependency Alignment (HIGH)

**Impact**: Build inconsistencies, test failures
**Estimated Effort**: 1-2 hours
**Risk**: Medium (causes confusion)

#### Tasks
1. Align Vitest to single version (recommend 3.2.4 across workspace)
2. Align @sveltejs/vite-plugin-svelte to stable version (recommend 3.0.0)
3. Update all package.json files
4. Run `pnpm install` to update lockfile
5. Verify all tests still pass

### Priority 3: Known QA Issues (HIGH)

**Impact**: User experience, accessibility, future compatibility
**Estimated Effort**: 10-15 hours
**Risk**: Medium (affects production readiness)

#### Issue Resolution Plan

| Issue | Severity | Effort | Owner | Status |
|-------|----------|--------|-------|--------|
| #1 Polyphonic visual feedback | Critical | 2-4h | Frontend | To Do |
| #2 WCAG accessibility | High | 1h | Frontend | To Do |
| #3 ScriptProcessorNode deprecation | High | 4-6h | Audio | To Do |
| #4 Filter instability | High | 2-3h | Audio | To Do |
| #5 Keyboard handlers | Medium | 1h | Frontend | To Do |
| #6 Unused CSS | Medium | 1h | Frontend | To Do |
| #7 Missing favicon | Low | 15min | Design | To Do |
| #8 Form labels | Medium | 1h | Frontend | To Do |
| #9 Global styles | Low | 30min | Frontend | To Do |

**Total Estimated Effort**: 12-20 hours

---

## 3. Stabilization Roadmap

### Phase 1: Critical Fixes (Week 1)

**Goal**: Resolve blocking issues and establish stable baseline

#### Sprint 1.1: Export Structure (2-3 hours)
- [ ] Create all missing index.js files
- [ ] Test imports work in development
- [ ] Test imports work in production build
- [ ] Update documentation if needed

#### Sprint 1.2: Dependency Alignment (1-2 hours)
- [ ] Align Vitest versions across workspace
- [ ] Align Svelte plugin versions
- [ ] Run full test suite to verify
- [ ] Update CI/CD if needed

#### Sprint 1.3: Critical Bug Fixes (2-4 hours)
- [ ] Fix #1: Polyphonic visual feedback
  - Update audioState to track Set of active notes
  - Update PianoKeyboard to use Set for active class
  - Add E2E test for multiple simultaneous keys
  - Verify unused CSS selectors are now used (#6)

**Deliverables**:
- All imports working correctly
- Consistent dependency versions
- Polyphonic playback working visually
- Test pass rate: 52/52 (100%)

### Phase 2: High Priority Issues (Week 2)

**Goal**: Address accessibility and audio quality concerns

#### Sprint 2.1: Accessibility Fixes (2-3 hours)
- [ ] Fix #2: Convert main click handler to accessible pattern
- [ ] Fix #5: Add keyboard event handlers
- [ ] Fix #8: Fix form label associations
- [ ] Run accessibility tests (WCAG 2.1 AA)
- [ ] Document accessibility improvements

#### Sprint 2.2: Audio Quality (4-6 hours)
- [ ] Fix #4: Add parameter smoothing to BiquadFilterNode
  - Use `linearRampToValueAtTime()` for all parameter changes
  - Set smoothing time to 20-50ms
  - Test with rapid parameter changes
- [ ] Plan #3: AudioWorklet migration
  - Create AudioWorklet version of saturation processor
  - Implement fallback for older browsers
  - Document migration path

**Deliverables**:
- WCAG 2.1 AA compliant
- No filter instability warnings
- AudioWorklet migration plan documented

### Phase 3: Polish & Best Practices (Week 3)

**Goal**: Final polish and code quality improvements

#### Sprint 3.1: Code Quality (2-3 hours)
- [ ] Fix #9: Move global styles to app.css
- [ ] Migrate root ESLint to flat config format
- [ ] Add #7: Favicon to static assets
- [ ] Clean up unused code
- [ ] Run full linting with zero warnings

#### Sprint 3.2: Documentation Updates (2-3 hours)
- [ ] Update QA documentation with fixes
- [ ] Update CLAUDE.md with changes
- [ ] Create CHANGELOG.md for v1.0.0
- [ ] Update README.md with current status

**Deliverables**:
- Zero linting warnings
- All documentation current
- Production-ready v1.0.0 release

---

## 4. QA Infrastructure Enhancement

### 4.1 Current State

**Existing Infrastructure**:
- ✅ Vitest for unit tests (music theory)
- ✅ Playwright for E2E tests (4 suites, 52 tests)
- ✅ GitHub Actions for CI/CD (build, lint)
- ✅ QA documentation (guides, reports)

**Missing Infrastructure**:
- ❌ Visual regression testing
- ❌ Performance testing/benchmarking
- ❌ Cross-browser E2E automation in CI
- ❌ Test coverage reporting in CI
- ❌ Automated accessibility testing in CI

### 4.2 Enhanced Testing Strategy

#### Layer 1: Unit Tests (Vitest)

**Current**: 8 test files for music theory
**Target**: Expand to all modules

**New Test Files Needed**:
```
shared/audio-core/
├── synthesis/
│   ├── oscillators.test.js     # To Do
│   ├── envelopes.test.js       # To Do
│   └── filters.test.js         # To Do
├── effects/
│   └── delay.test.js           # To Do
└── utils/
    └── audio-context.test.js   # To Do

shared/ui-components/
├── controls/
│   ├── Knob.test.js           # To Do
│   ├── Slider.test.js         # To Do
│   ├── Button.test.js         # To Do
│   └── VintageKnob.test.js    # To Do
└── visualizers/
    └── (add tests for each)    # To Do
```

**Coverage Target**: 90%+ for all shared modules

#### Layer 2: Component Tests (Vitest + Testing Library)

**New**: Svelte component testing in isolation

**Setup Required**:
```bash
pnpm add -D @testing-library/svelte @testing-library/jest-dom
```

**Test Structure**:
```javascript
// Example: Knob.test.js
import { render, fireEvent } from '@testing-library/svelte';
import Knob from './Knob.svelte';

describe('Knob Component', () => {
  it('should render with default props', () => {
    const { getByRole } = render(Knob, {
      props: { value: 50, min: 0, max: 100 }
    });
    expect(getByRole('slider')).toBeInTheDocument();
  });

  it('should handle value changes', async () => {
    const { component, getByRole } = render(Knob, {
      props: { value: 50 }
    });

    const slider = getByRole('slider');
    await fireEvent.input(slider, { target: { value: 75 } });

    expect(component.value).toBe(75);
  });

  it('should be accessible', () => {
    const { getByRole } = render(Knob, {
      props: { value: 50, label: 'Volume' }
    });

    const slider = getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
  });
});
```

**Coverage Target**: All reusable components tested

#### Layer 3: Integration Tests (Playwright)

**Current**: 4 E2E test suites
**Enhancement**: Add missing scenarios

**New Test Suites**:
1. **Cross-Browser Tests**
   - Run existing tests on Chromium, Firefox, WebKit
   - Add browser-specific workarounds if needed
   - Document browser compatibility

2. **Performance Tests**
   - Measure page load time (<2s target)
   - Measure audio initialization time (<500ms)
   - Measure parameter update latency (<50ms)
   - Track memory usage during playback

3. **Audio Quality Tests**
   - Verify correct frequencies for each key
   - Test polyphonic playback (2, 4, 8 voices)
   - Verify effect parameters change audio
   - Test edge cases (rapid note triggering)

4. **Mobile Tests**
   - Touch interaction testing
   - Mobile viewport rendering
   - Virtual keyboard behavior
   - iOS AudioContext unlock

**Test Suite Structure**:
```
tests/
├── e2e/
│   ├── plugin-initialization.spec.js    # ✅ Exists
│   ├── audio-functionality.spec.js      # ✅ Exists
│   ├── accessibility.spec.js            # ✅ Exists
│   ├── vintage-knob-interaction.spec.js # ✅ Exists
│   ├── cross-browser.spec.js            # To Add
│   ├── performance.spec.js              # To Add
│   ├── audio-quality.spec.js            # To Add
│   └── mobile.spec.js                   # To Add
└── visual-regression/                    # To Add
    └── snapshots/
```

#### Layer 4: Visual Regression Testing

**Tool**: Percy.io or Playwright Visual Comparisons

**Setup with Playwright**:
```javascript
// tests/visual-regression/ui-snapshots.spec.js
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('LoFi Piano UI should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Full page snapshot
    await expect(page).toHaveScreenshot('lofi-piano-full.png', {
      fullPage: true,
      threshold: 0.2 // 20% difference tolerance
    });
  });

  test('VintageKnob should match snapshot', async ({ page }) => {
    await page.goto('/');
    const knob = page.locator('.vintage-knob').first();

    await expect(knob).toHaveScreenshot('vintage-knob.png', {
      threshold: 0.1
    });
  });

  test('Active piano key should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-note="60"]'); // Middle C

    const keyboard = page.locator('.piano-keyboard');
    await expect(keyboard).toHaveScreenshot('piano-active-key.png');
  });
});
```

**Baseline Creation**:
```bash
# Create initial baseline snapshots
pnpm test:e2e --update-snapshots

# Run visual regression tests
pnpm test:visual
```

**CI Integration**:
- Store baseline snapshots in git
- Fail PR if visual changes detected without approval
- Generate visual diff reports for review

### 4.3 CI/CD Enhancement

#### Current Workflows

1. **build.yml** - Builds all packages
2. **lint.yml** - Lints and formats code
3. **deploy-github-pages.yml** - Deploys to GitHub Pages
4. **claude.yml** - Claude Code integration
5. **claude-code-review.yml** - Automated code review

#### Enhanced CI/CD Pipeline

**New Workflow**: `test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 10.20.0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test -- --run

      - name: Generate coverage report
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  e2e-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 10.20.0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: pnpm --filter lofi-piano test:e2e --project=${{ matrix.browser }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}
          path: plugins/lofi-piano/web/playwright-report
          retention-days: 30

  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run visual regression tests
        run: pnpm test:visual

      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: tests/visual-regression/__diff_output__

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run accessibility tests
        run: pnpm test:a11y

      - name: Generate accessibility report
        run: pnpm exec pa11y-ci
```

#### Coverage Reporting

**Setup Codecov**:
```bash
# Add to repository secrets
CODECOV_TOKEN=<your-token>
```

**Badge for README**:
```markdown
[![codecov](https://codecov.io/gh/YungSeepferd/Din-ZAudioToolLibrary/branch/main/graph/badge.svg)](https://codecov.io/gh/YungSeepferd/Din-ZAudioToolLibrary)
```

#### Status Checks

**Required checks before merge**:
- ✅ All unit tests pass
- ✅ All E2E tests pass (Chromium, Firefox, WebKit)
- ✅ Code coverage > 80%
- ✅ Linting passes with zero warnings
- ✅ Visual regression tests pass (or approved)
- ✅ Accessibility tests pass (WCAG 2.1 AA)

---

## 5. UX Testing Framework

### 5.1 UX Testing Goals

1. **Usability**: Can users accomplish tasks efficiently?
2. **Learnability**: Can new users understand the interface?
3. **Satisfaction**: Do users enjoy the experience?
4. **Accessibility**: Can users with disabilities use the app?
5. **Performance**: Does the app feel responsive?

### 5.2 UX Testing Methods

#### Method 1: Moderated User Testing

**Frequency**: Quarterly or before major releases

**Process**:
1. **Recruit Participants** (5-8 users)
   - Beginner musicians (2-3)
   - Intermediate musicians (2-3)
   - Professional musicians (1-2)
   - Mix of ages, technical skills, accessibility needs

2. **Prepare Test Script**
   ```
   Task 1: First Impression (2 minutes)
   - Load the LoFi Piano
   - What do you see?
   - What do you think this app does?

   Task 2: Play a Note (3 minutes)
   - Try to play a single piano note
   - What was easy? What was confusing?

   Task 3: Adjust Effects (5 minutes)
   - Try to add some vintage character to the sound
   - Adjust the room ambience
   - Explain your process

   Task 4: Build a Chord Progression (8 minutes)
   - Try to create a simple chord progression
   - Use the Chord Generator tab
   - Think aloud as you work

   Task 5: Open Feedback (2 minutes)
   - What would you change?
   - What did you like most?
   - Would you use this app? Why or why not?
   ```

3. **Conduct Sessions**
   - Record video + audio
   - Observer takes notes
   - Track time to complete each task
   - Note confusion points

4. **Analyze Results**
   - Success rates per task
   - Time on task
   - Error rates
   - User satisfaction scores (1-5)
   - Qualitative feedback themes

5. **Create Report**
   ```markdown
   ## UX Testing Report - LoFi Piano v1.0

   ### Participants
   - 8 total (3 beginners, 3 intermediate, 2 professional)

   ### Key Findings
   1. 87% successfully played a note on first try
   2. Average time to adjust effects: 45 seconds
   3. 3/8 users confused by Chord Generator UI
   4. All users praised vintage aesthetic
   5. 2/8 users mentioned wanting MIDI input

   ### Issues Identified
   - P1: Chord Generator button labels unclear (3 users)
   - P2: No visual feedback when effect changes (2 users)
   - P3: Wanted undo/redo for progressions (4 users)

   ### Recommendations
   1. Improve Chord Generator onboarding
   2. Add effect parameter value display
   3. Implement undo/redo system
   ```

#### Method 2: Unmoderated Testing (UserTesting.com)

**Frequency**: Monthly or after feature releases

**Setup**:
1. Create test on UserTesting.com
2. Recruit 5-10 participants
3. Define tasks (similar to moderated script)
4. Review recorded sessions
5. Extract insights

**Advantages**:
- Faster turnaround (1-2 days)
- Larger sample size possible
- Lower cost than moderated
- Natural environment (users' own devices)

#### Method 3: Analytics & Heatmaps

**Tools**: Hotjar, Microsoft Clarity, or Plausible Analytics

**Setup**:
```javascript
// Add to Layout.svelte (with user consent)
<script>
  import { onMount } from 'svelte';

  onMount(() => {
    // Initialize analytics (privacy-focused)
    if (window.plausible) {
      plausible('pageview');
    }
  });

  function trackEvent(eventName, props) {
    if (window.plausible) {
      plausible(eventName, { props });
    }
  }

  // Track important interactions
  function handleNotePlay(note) {
    trackEvent('note_played', { note });
  }

  function handleEffectChange(effect, value) {
    trackEvent('effect_changed', { effect, value });
  }
</script>
```

**Metrics to Track**:
- Page load time
- Time to first interaction
- Most/least used features
- Click heatmaps
- Scroll depth
- Drop-off points
- Error rates

**Privacy Considerations**:
- Use privacy-focused analytics (Plausible, Fathom)
- No personal data collection
- Cookie banner if required
- Document in privacy policy

#### Method 4: A/B Testing

**Use Cases**:
- Testing two UI layouts
- Comparing button placements
- Evaluating color schemes
- Testing copy/labels

**Setup with Feature Flags**:
```javascript
// featureFlags.js
export const FEATURE_FLAGS = {
  NEW_CHORD_GENERATOR_UI: Math.random() < 0.5, // 50/50 split
  SIMPLIFIED_EFFECTS_PANEL: false,
  DARK_MODE: false
};

// Usage in component
<script>
  import { FEATURE_FLAGS } from './featureFlags';
</script>

{#if FEATURE_FLAGS.NEW_CHORD_GENERATOR_UI}
  <ChordGeneratorV2 />
{:else}
  <ChordGeneratorV1 />
{/if}
```

**Measurement**:
- Track success rates for each variant
- Measure time on task
- Compare user satisfaction scores
- Analyze qualitative feedback

### 5.3 Accessibility Testing

#### Automated Testing

**Tool**: axe DevTools + Playwright

```javascript
// tests/e2e/accessibility.spec.js (enhance existing)
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

#### Manual Testing Checklist

**Keyboard Navigation**:
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys work in sliders/knobs

**Screen Reader Testing**:
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] All images have alt text
- [ ] ARIA labels are descriptive
- [ ] Landmark regions defined
- [ ] Dynamic content updates announced

**Visual Accessibility**:
- [ ] Color contrast ratio ≥ 4.5:1 (text)
- [ ] Color contrast ratio ≥ 3:1 (UI components)
- [ ] No information conveyed by color alone
- [ ] Text scales to 200% without breaking layout
- [ ] Focus indicators meet 3:1 contrast ratio

**Motor Accessibility**:
- [ ] Click targets ≥ 44x44 pixels (mobile)
- [ ] No precision clicking required
- [ ] Sliders have keyboard alternatives
- [ ] Sufficient time for interactions (no auto-timeouts)

### 5.4 Performance Testing

#### Lighthouse CI

**Setup**:
```bash
pnpm add -D @lhci/cli
```

**Configuration** (`.lighthouserc.json`):
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173"],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**CI Integration**:
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Run Lighthouse CI
        run: |
          pnpm exec lhci autorun
```

**Performance Budgets**:
```javascript
// Performance thresholds
{
  "performance": {
    "firstContentfulPaint": 1500,      // 1.5s
    "largestContentfulPaint": 2500,    // 2.5s
    "timeToInteractive": 3000,         // 3s
    "totalBlockingTime": 200,          // 200ms
    "cumulativeLayoutShift": 0.1,      // 0.1
    "speedIndex": 2000                 // 2s
  },
  "budgets": {
    "javascript": 150,  // 150 KB
    "css": 50,          // 50 KB
    "fonts": 100,       // 100 KB
    "images": 200,      // 200 KB
    "total": 500        // 500 KB total
  }
}
```

#### Real User Monitoring (RUM)

**Tool**: Sentry Performance or Vercel Analytics

**Setup** (Sentry):
```javascript
// src/lib/monitoring.js
import * as Sentry from '@sentry/svelte';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],

  // Performance monitoring
  tracesSampleRate: 0.1,  // 10% of transactions

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: import.meta.env.MODE
});
```

**Custom Metrics**:
```javascript
// Track audio-specific performance
Sentry.metrics.distribution('audio.initialization_time', initTime, {
  unit: 'millisecond',
  tags: { browser: browserName }
});

Sentry.metrics.distribution('audio.note_latency', latency, {
  unit: 'millisecond',
  tags: { polyphony: voiceCount }
});
```

### 5.5 UX Documentation

#### UX Testing Playbook

**Create**: `docs/ux/UX_TESTING_PLAYBOOK.md`

**Contents**:
1. When to conduct UX testing
2. How to recruit participants
3. Test script templates
4. Analysis frameworks
5. Reporting templates
6. Action item tracking

#### UX Metrics Dashboard

**Track over time**:
- System Usability Scale (SUS) score
- Net Promoter Score (NPS)
- Task success rates
- Time on task
- Error rates
- User satisfaction ratings

**Quarterly Review**:
- Analyze trends
- Identify improvement areas
- Prioritize UX enhancements
- Update roadmap

---

## 6. Implementation Timeline

### Sprint 1: Critical Stabilization (Week 1)

**Days 1-2**: Export structure fixes
- Create 5 missing index.js files
- Test imports
- Update documentation

**Days 3-4**: Dependency alignment
- Align Vitest and Svelte plugin versions
- Update lockfiles
- Verify all tests pass

**Day 5**: Critical bug fix
- Fix polyphonic visual feedback
- Verify with E2E tests
- Update QA documentation

**Deliverable**: Stable baseline, 100% test pass rate

### Sprint 2: High Priority Issues (Week 2)

**Days 6-7**: Accessibility
- Fix WCAG violations (#2, #5, #8)
- Run accessibility audit
- Document improvements

**Days 8-10**: Audio quality
- Fix filter instability (#4)
- Plan AudioWorklet migration (#3)
- Test audio quality improvements

**Deliverable**: WCAG compliant, audio quality improved

### Sprint 3: Testing Infrastructure (Week 3)

**Days 11-12**: Unit test expansion
- Add tests for audio-core modules
- Add tests for UI components
- Achieve 90% coverage

**Days 13-14**: E2E test expansion
- Add cross-browser tests
- Add performance tests
- Add mobile tests

**Day 15**: Visual regression setup
- Configure Playwright visual tests
- Create baseline snapshots
- Document process

**Deliverable**: Comprehensive test coverage

### Sprint 4: CI/CD Enhancement (Week 4)

**Days 16-17**: CI/CD workflows
- Create enhanced test.yml workflow
- Set up coverage reporting
- Configure status checks

**Days 18-19**: UX testing infrastructure
- Set up analytics (Plausible/Fathom)
- Create UX testing playbook
- Plan first user testing session

**Day 20**: Documentation and launch
- Update all documentation
- Create CHANGELOG
- Tag v1.0.0 release

**Deliverable**: Professional CI/CD pipeline, UX testing framework

### Ongoing: Maintenance (Continuous)

**Weekly**:
- Review test results
- Monitor error rates
- Address flaky tests

**Monthly**:
- Review analytics
- Conduct unmoderated testing
- Update UX metrics

**Quarterly**:
- Conduct moderated user testing
- Review UX metrics dashboard
- Plan UX improvements

---

## 7. Success Metrics

### Code Quality Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| **Test Pass Rate** | 92% (48/52) | 100% | Week 1 |
| **Code Coverage** | ~50% | 90% | Week 3 |
| **Linting Warnings** | Unknown | 0 | Week 3 |
| **Dependency Conflicts** | 3 | 0 | Week 1 |
| **Missing Exports** | 5 | 0 | Week 1 |
| **Known Bugs** | 9 | 0 | Week 2 |

### Testing Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| **Unit Tests** | 8 files | 20+ files | Week 3 |
| **E2E Test Suites** | 4 | 8 | Week 3 |
| **Browser Coverage** | 1 (Chrome) | 3 (Chrome, Firefox, Safari) | Week 3 |
| **Visual Regression** | None | Implemented | Week 3 |
| **Accessibility Tests** | Manual | Automated + Manual | Week 2 |

### Performance Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| **Page Load Time** | 764ms | <1000ms | Maintain |
| **LCP** | Unknown | <2.5s | Week 4 |
| **TBT** | Unknown | <200ms | Week 4 |
| **CLS** | Unknown | <0.1 | Week 4 |
| **Lighthouse Score** | Unknown | >90 | Week 4 |

### UX Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| **SUS Score** | Unknown | >70 | Month 2 |
| **Task Success Rate** | Unknown | >85% | Month 2 |
| **WCAG Compliance** | Partial | 2.1 AA | Week 2 |
| **User Testing Sessions** | 0 | 1/quarter | Month 3 |

### CI/CD Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| **CI Build Time** | ~2 min | <5 min | Week 4 |
| **Test Execution Time** | Unknown | <10 min | Week 4 |
| **Deployment Time** | Manual | <5 min | Week 4 |
| **Failed Deployment Rate** | Unknown | <5% | Ongoing |

---

## 8. Ongoing Maintenance

### Weekly Activities

**Monday**: Review test results
- Check CI/CD pipeline status
- Review failed tests
- Address flaky tests
- Update test documentation

**Wednesday**: Code quality check
- Review linting reports
- Check dependency updates
- Review security alerts
- Update dependencies as needed

**Friday**: Performance review
- Check Lighthouse scores
- Review analytics dashboard
- Monitor error rates
- Address performance regressions

### Monthly Activities

**Week 1**: Dependency updates
- Update all dependencies
- Test for breaking changes
- Update lockfiles
- Create PR for review

**Week 2**: UX testing
- Run unmoderated test session
- Analyze results
- Create action items
- Update UX backlog

**Week 3**: Test suite review
- Review test coverage
- Add missing tests
- Refactor flaky tests
- Update test documentation

**Week 4**: Documentation update
- Update CLAUDE.md
- Update README.md
- Update API documentation
- Review and update guides

### Quarterly Activities

**Month 1**: User testing
- Plan moderated testing session
- Recruit participants
- Conduct sessions
- Analyze results
- Create detailed report

**Month 2**: Accessibility audit
- Full WCAG audit
- Test with assistive technologies
- Document findings
- Fix critical issues

**Month 3**: Performance optimization
- Full Lighthouse audit
- Analyze bundle size
- Optimize assets
- Profile runtime performance
- Implement optimizations

### Annual Activities

**Q1**: Major dependency updates
- Update to latest major versions
- Test thoroughly
- Update documentation
- Plan migration path if needed

**Q2**: Security audit
- Run security scanners
- Review authentication/authorization
- Update security policies
- Address vulnerabilities

**Q3**: Architecture review
- Review project structure
- Identify technical debt
- Plan refactoring
- Update architecture docs

**Q4**: Year-end planning
- Review annual metrics
- Set goals for next year
- Update roadmap
- Plan major features

---

## Appendix A: Checklists

### Stabilization Checklist

**Critical (Week 1)**:
- [ ] Create `shared/audio-core/synthesis/index.js`
- [ ] Create `shared/audio-core/effects/index.js`
- [ ] Create `shared/audio-core/utils/index.js`
- [ ] Create `shared/ui-components/controls/index.js`
- [ ] Create `shared/ui-components/visualizers/index.js`
- [ ] Resolve `shared/ui-components/layouts/` (create or remove from exports)
- [ ] Align Vitest to v3.2.4 across workspace
- [ ] Align @sveltejs/vite-plugin-svelte to v3.0.0
- [ ] Fix #1: Polyphonic visual feedback
- [ ] Achieve 100% E2E test pass rate

**High Priority (Week 2)**:
- [ ] Fix #2: WCAG accessibility violation (main element)
- [ ] Fix #4: BiquadFilterNode instability
- [ ] Fix #5: Missing keyboard handlers
- [ ] Fix #8: Form label associations
- [ ] Plan #3: AudioWorklet migration
- [ ] Achieve WCAG 2.1 AA compliance

**Medium/Low Priority (Week 3)**:
- [ ] Fix #6: Unused CSS selectors
- [ ] Fix #7: Add favicon
- [ ] Fix #9: Move global styles to app.css
- [ ] Migrate root ESLint to flat config
- [ ] Clean up code quality warnings

### Testing Infrastructure Checklist

**Unit Tests**:
- [ ] Add oscillators.test.js
- [ ] Add envelopes.test.js
- [ ] Add filters.test.js
- [ ] Add delay.test.js
- [ ] Add audio-context.test.js
- [ ] Add component tests for all UI controls
- [ ] Achieve 90% code coverage

**E2E Tests**:
- [ ] Add cross-browser.spec.js
- [ ] Add performance.spec.js
- [ ] Add audio-quality.spec.js
- [ ] Add mobile.spec.js
- [ ] Run tests on Chromium, Firefox, WebKit
- [ ] Document browser-specific issues

**Visual Regression**:
- [ ] Set up Playwright visual testing
- [ ] Create baseline snapshots
- [ ] Add visual tests for all major UI components
- [ ] Integrate into CI/CD

**Accessibility**:
- [ ] Set up axe-core automated testing
- [ ] Test with NVDA
- [ ] Test with VoiceOver
- [ ] Document accessibility features

### CI/CD Enhancement Checklist

**Workflows**:
- [ ] Create test.yml workflow
- [ ] Set up unit test job
- [ ] Set up E2E test job (matrix: browsers)
- [ ] Set up visual regression job
- [ ] Set up accessibility job
- [ ] Set up coverage reporting (Codecov)

**Status Checks**:
- [ ] Require all tests pass
- [ ] Require coverage > 80%
- [ ] Require linting passes
- [ ] Require visual regression approval
- [ ] Require accessibility passes

**Reporting**:
- [ ] Add coverage badge to README
- [ ] Add build status badge
- [ ] Set up test result dashboard
- [ ] Configure Slack/Discord notifications

### UX Testing Checklist

**Infrastructure**:
- [ ] Set up privacy-focused analytics
- [ ] Create UX testing playbook
- [ ] Create test script templates
- [ ] Set up user feedback collection

**Testing Sessions**:
- [ ] Plan first moderated session
- [ ] Recruit 5-8 participants
- [ ] Conduct sessions
- [ ] Analyze results
- [ ] Create report
- [ ] Implement improvements

**Ongoing**:
- [ ] Review analytics weekly
- [ ] Conduct unmoderated testing monthly
- [ ] Update UX metrics dashboard
- [ ] Share insights with team

---

## Appendix B: Tools & Resources

### Testing Tools

| Tool | Purpose | Cost |
|------|---------|------|
| **Vitest** | Unit testing | Free |
| **Playwright** | E2E testing | Free |
| **@testing-library/svelte** | Component testing | Free |
| **@axe-core/playwright** | Accessibility testing | Free |
| **Codecov** | Coverage reporting | Free (open source) |
| **Lighthouse CI** | Performance testing | Free |

### UX Testing Tools

| Tool | Purpose | Cost |
|------|---------|------|
| **UserTesting.com** | Unmoderated testing | $49/test |
| **Hotjar** | Heatmaps & recordings | Free tier available |
| **Plausible Analytics** | Privacy-focused analytics | $9/mo |
| **Sentry** | Error & performance monitoring | Free tier available |
| **Figma** | Design & prototyping | Free tier available |

### Learning Resources

**Testing**:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)
- [Web Audio Testing Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Testing)

**Accessibility**:
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [axe DevTools Documentation](https://www.deque.com/axe/devtools/)
- [WebAIM Resources](https://webaim.org/resources/)

**UX Testing**:
- [Nielsen Norman Group](https://www.nngroup.com/)
- [UX Research Methods](https://www.usability.gov/)
- [System Usability Scale (SUS)](https://measuringu.com/sus/)
- [User Testing Best Practices](https://www.usertesting.com/resources)

**Performance**:
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Core Web Vitals](https://web.dev/vitals/)

---

## Appendix C: Contact & Ownership

### Stabilization Team

**Project Lead**: [To Be Assigned]
**Audio Engineer**: [To Be Assigned]
**Frontend Engineer**: [To Be Assigned]
**QA Engineer**: [To Be Assigned]
**UX Designer**: [To Be Assigned]

### Escalation Path

1. **Team Discussion**: GitHub Issues or Discussions
2. **Technical Decisions**: Architecture Decision Records (ADRs)
3. **Project Blocker**: Project Lead
4. **External Dependencies**: Project Lead

### Communication Channels

- **Daily Updates**: GitHub Discussions
- **Weekly Sync**: Team meeting
- **Async Communication**: GitHub Issues
- **Documentation**: This repository

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-13 | Claude | Initial draft created from comprehensive repository analysis |

---

**Next Steps**: Review this plan with the team, assign owners, and begin Sprint 1 execution.
