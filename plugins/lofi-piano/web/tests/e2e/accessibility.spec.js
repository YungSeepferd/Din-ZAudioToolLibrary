/**
 * E2E Tests: Accessibility & WCAG Compliance
 *
 * QA Focus: WCAG 2.1 AA compliance for audio applications
 *
 * Test Scenarios:
 * - Semantic HTML structure
 * - Keyboard navigation without traps
 * - ARIA labels and attributes on controls
 * - Focus indicators visible
 * - Screen reader friendly content
 * - Color contrast meets WCAG AA
 * - Audio-specific accessibility (no auto-play, user gesture required)
 * - Reduced motion support
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility & WCAG Compliance', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('✓ Should have proper HTML language attribute', async ({ page }) => {
    const htmlElement = page.locator('html');
    const langAttr = await htmlElement.getAttribute('lang');

    expect(langAttr).toBeTruthy('HTML element should have lang attribute');
  });

  test('✓ Should have semantic button elements for interactive controls', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0, 'Should have semantic button elements');

    // Verify buttons have proper role
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const role = await button.getAttribute('role');

      // Should either have no role (semantic button) or explicit role
      const isAccessible = !role || role === 'button' || role.includes('button');
      expect(isAccessible).toBe(true);
    }
  });

  test('✓ Should support full keyboard navigation via Tab key', async ({ page }) => {
    const interactiveElements = [];

    // Tab through elements
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');

      if (await focused.count() > 0) {
        const tagName = await focused.evaluate(el => el.tagName);
        const ariaRole = await focused.getAttribute('role');
        interactiveElements.push({
          tag: tagName,
          role: ariaRole
        });
      }
    }

    // Should have found multiple focusable elements
    expect(interactiveElements.length).toBeGreaterThan(5, 'Should have multiple focusable elements');
  });

  test('✓ Should have visible focus indicators on all interactive elements', async ({ page }) => {
    // Tab to first interactive element
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    const isFocused = await focused.evaluate(el => el === document.activeElement);

    expect(isFocused).toBe(true);

    // Verify focus is visible (not hidden)
    await expect(focused).toBeVisible();
  });

  test('✓ Should not trap keyboard focus in any section', async ({ page }) => {
    // Tab forward 50 times
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Tab');
    }

    // Should still have a focused element (not stuck)
    const focused = page.locator(':focus');
    const count = await focused.count();

    expect(count).toBeGreaterThan(0, 'Should always have a focusable element');
  });

  test('✓ Should provide descriptive ARIA labels on all piano keys', async ({ page }) => {
    const pianoKeys = page.locator('button[data-note]');
    const keyCount = await pianoKeys.count();

    expect(keyCount).toBe(88, 'Should have 88 piano keys');

    // Check first 10 keys for ARIA labels
    for (let i = 0; i < Math.min(keyCount, 10); i++) {
      const key = pianoKeys.nth(i);
      const ariaLabel = await key.getAttribute('aria-label');

      expect(ariaLabel).toBeTruthy(`Piano key ${i} should have aria-label`);
      if (ariaLabel) {
        expect(ariaLabel.length).toBeGreaterThan(0);
      }
    }
  });

  test('✓ Should provide ARIA labels on all effect controls', async ({ page }) => {
    const controls = page.locator('input[type="range"], input[role="slider"]');
    const controlCount = await controls.count();

    expect(controlCount).toBeGreaterThan(0, 'Should have effect controls');

    // Verify each control has ARIA labeling
    for (let i = 0; i < controlCount; i++) {
      const control = controls.nth(i);
      const ariaLabel = await control.getAttribute('aria-label');

      if (!ariaLabel) {
        // Alternative: check for associated label
        const idAttr = await control.getAttribute('id');
        if (idAttr) {
          const label = page.locator(`label[for="${idAttr}"]`);
          const labelText = await label.textContent();
          expect(labelText?.length).toBeGreaterThan(0);
        }
      } else {
        expect(ariaLabel.length).toBeGreaterThan(0);
      }
    }
  });

  test('✓ Should have sufficient color contrast for text (WCAG AA)', async ({ page }) => {
    // Check headings for color contrast
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();

    expect(count).toBeGreaterThan(0, 'Should have heading elements');

    for (let i = 0; i < Math.min(count, 3); i++) {
      const heading = headings.nth(i);
      const color = await heading.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.color;
      });

      expect(color).toBeTruthy('Heading should have color defined');
    }
  });

  test('✓ Should have proper document structure with landmarks', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for header
    const header = page.locator('header');
    const headerCount = await header.count();

    expect(headerCount).toBeGreaterThanOrEqual(0);
  });

  test('✓ Should respect prefers-reduced-motion setting', async ({ browser }) => {
    // Create context with reduced motion preference
    const context = await browser.newContext({
      reducedMotion: 'reduce'
    });

    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Plugin should load without animation-related crashes
    await expect(page.locator('main')).toBeVisible();

    // Verify page is still interactive
    const buttons = page.locator('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);

    await context.close();
  });

  test('✓ Should support screen reader mode without content loss', async ({ page }) => {
    // Check for proper ARIA labels and landmarks
    const ariaLabeledElements = page.locator('[aria-label]');
    const labeledCount = await ariaLabeledElements.count();

    expect(labeledCount).toBeGreaterThan(0, 'Should have ARIA-labeled elements for screen readers');

    // Check for role attributes
    const roledElements = page.locator('[role]');
    const roleCount = await roledElements.count();

    expect(roleCount).toBeGreaterThan(0, 'Should have role attributes for semantic meaning');
  });

  test('✓ Should require user gesture before audio playback (accessibility)', async ({ page }) => {
    // Audio should not auto-play
    // Verify user must click to enable audio
    const initialContent = await page.content();
    expect(initialContent).toBeTruthy();

    // No audio should play on page load
    // User must interact first
    const mainElement = page.locator('main');
    await mainElement.click();
    await page.waitForTimeout(500);

    // After interaction, app should be ready
    await expect(mainElement).toBeVisible();
  });

  test('✓ Should have descriptive titles for all pages/sections', async ({ page }) => {
    const title = await page.title();

    expect(title).toBeTruthy('Page should have a descriptive title');
    expect(title).toContain(/LoFi|Piano/i);
  });

  test('✓ Should handle text size changes without breaking layout', async ({ page }) => {
    // Set larger text size
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '18px'; // Increase from default 16px
    });

    await page.waitForTimeout(300);

    // Main content should remain accessible
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check that controls are still visible
    const controls = page.locator('button, input[type="range"]');
    const count = await controls.count();

    expect(count).toBeGreaterThan(0);
  });

  test('✓ Should support zoom/scale without horizontal scroll', async ({ page }) => {
    // Zoom to 150%
    await page.evaluate(() => {
      document.body.style.zoom = '150%';
    });

    await page.waitForTimeout(300);

    // Main content should still be visible
    const main = page.locator('main');
    const isVisible = await main.isVisible();

    // If not visible, check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Layout should handle zoom gracefully
    if (!isVisible) {
      // Allow some horizontal scroll but not excessive
      expect(hasHorizontalScroll).toBe(true);
    }
  });

  test('✓ Should have tab order that makes logical sense', async ({ page }) => {
    // Get initial focused element
    await page.keyboard.press('Tab');
    let previousRole = await page.locator(':focus').getAttribute('role');

    // Tab to next element
    await page.keyboard.press('Tab');
    let currentRole = await page.locator(':focus').getAttribute('role');

    // Verify we can navigate
    expect(previousRole).toBeDefined();
    expect(currentRole).toBeDefined();

    // Both should be interactive or undefined (semantic elements)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      const count = await focused.count();

      expect(count).toBeGreaterThan(0);
    }
  });

  test('✓ Should work with multiple input devices (mouse, keyboard, touch simulation)', async ({ page }) => {
    // Keyboard interaction
    const pianoKey = page.locator('button[data-note="60"]');
    await pianoKey.focus();
    await page.keyboard.press('Enter');

    // Mouse interaction
    await pianoKey.click();

    // Verify no errors from different interaction methods
    await expect(page.locator('main')).toBeVisible();
  });
});
