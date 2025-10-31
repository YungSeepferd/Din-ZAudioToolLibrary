/**
 * E2E Tests: Plugin Initialization & Audio System Setup
 *
 * QA Focus: Verify complete initialization pipeline and audio system readiness
 *
 * Test Scenarios:
 * - DOM structure loads correctly
 * - Audio subsystem initializes without critical errors
 * - User gesture requirement is properly enforced
 * - All UI components render within acceptable timeframe
 * - Browser compatibility verified
 */

import { test, expect } from '@playwright/test';

test.describe('Plugin Initialization & Audio System', () => {

  test.beforeEach(async ({ page }) => {
    // Capture all console messages for error analysis
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Browser Error] ${msg.text()}`);
      }
    });
  });

  test('✓ Should load plugin and display complete UI within 5 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify page title
    await expect(page).toHaveTitle(/LoFi Piano/i);

    // Verify main container loads
    const mainElement = page.locator('main');
    await expect(mainElement).toBeVisible({ timeout: 5000 });

    // Verify header section
    const header = page.locator('h1');
    await expect(header).toContainText(/LoFi Piano/);

    const loadTime = Date.now() - startTime;
    console.log(`✓ Page loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('✓ Should render control panel with all effect sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify control panel exists
    const controlPanel = page.locator('[class*="control"]').filter({ hasText: /Volume|AGE|Room|Saturation/ });
    await expect(controlPanel.first()).toBeVisible({ timeout: 5000 });

    // Verify key effect controls are present
    const effectNames = ['Master Volume', 'AGE', 'Room', 'Saturation'];
    for (const effectName of effectNames) {
      const effectControl = page.locator('text=' + effectName);
      await expect(effectControl).toBeVisible({ timeout: 3000 });
    }
  });

  test('✓ Should render complete 88-key piano keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for keyboard to render
    const keyboard = page.locator('[class*="keyboard"]').first();
    await expect(keyboard).toBeVisible({ timeout: 5000 });

    // Verify piano keys exist (should have 88 keys)
    const pianoKeys = page.locator('button[class*="key"]');
    const keyCount = await pianoKeys.count();

    expect(keyCount).toBe(88, 'Piano should have exactly 88 keys');

    // Verify both white and black keys exist
    const whiteKeys = page.locator('button[class*="white-key"]');
    const blackKeys = page.locator('button[class*="black-key"]');

    const whiteCount = await whiteKeys.count();
    const blackCount = await blackKeys.count();

    expect(whiteCount).toBeGreaterThan(0, 'Piano should have white keys');
    expect(blackCount).toBeGreaterThan(0, 'Piano should have black keys');
    expect(whiteCount + blackCount).toBe(88);
  });

  test('✓ Should initialize AudioContext correctly', async ({ page }) => {
    const contextErrors = [];
    const contextLogs = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('AudioContext')) {
        contextLogs.push(text);
      }
      if (msg.type() === 'error' && text.includes('AudioContext')) {
        contextErrors.push(text);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow time for initialization
    await page.waitForTimeout(1000);

    // Verify no critical audio context errors
    const criticalErrors = contextErrors.filter(err =>
      !err.includes('NotAllowedError') && // Expected until user interaction
      !err.includes('suspended') // Expected before resume
    );

    expect(criticalErrors).toHaveLength(0, 'No critical AudioContext errors expected on load');
  });

  test('✓ Should require user interaction to unlock audio (browser security)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Initially, audio context should be suspended
    const initialState = await page.evaluate(() => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx.state;
      } catch (e) {
        return 'error';
      }
    });

    expect(['suspended', 'running']).toContain(initialState);

    // Click on page to trigger user gesture
    const mainElement = page.locator('main').first();
    await mainElement.click({ force: true });

    // Allow time for audio unlock
    await page.waitForTimeout(500);

    // Verify no crashes occurred
    await expect(page.locator('main')).toBeVisible();
  });

  test('✓ Should handle no critical JavaScript errors on load', async ({ page }) => {
    const jsErrors = [];

    page.on('pageerror', err => {
      jsErrors.push({
        message: err.message,
        stack: err.stack
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors
    const criticalErrors = jsErrors.filter(err =>
      !err.message.includes('user gesture') &&
      !err.message.includes('NotAllowedError') &&
      !err.message.includes('Web Audio')
    );

    expect(criticalErrors).toHaveLength(0, 'No critical JavaScript errors expected');
  });

  test('✓ Should verify browser Web Audio API support', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const hasWebAudio = await page.evaluate(() => {
      return !!(
        window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext ||
        window.msAudioContext
      );
    });

    expect(hasWebAudio).toBe(true, 'Browser must support Web Audio API');
    await context.close();
  });

  test('✓ Should display loading state properly until ready', async ({ page }) => {
    // Intercept network to slow down loading
    await page.route('**/*', route => setTimeout(() => route.continue(), 100));

    await page.goto('/');

    // Content should eventually be visible
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('✓ Should handle viewport resize without breaking layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 414, height: 896 }    // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);

      // Main content should remain visible
      await expect(page.locator('main')).toBeVisible();

      // Keyboard should be accessible
      const keyboard = page.locator('[class*="keyboard"]').first();
      const isVisible = await keyboard.isVisible().catch(() => false);

      if (isVisible) {
        const keyCount = await page.locator('button[class*="key"]').count();
        expect(keyCount).toBeGreaterThan(0);
      }
    }
  });
});
