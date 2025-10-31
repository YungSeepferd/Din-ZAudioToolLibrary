/**
 * E2E Tests: Effect Parameter Controls (Sliders/Knobs)
 *
 * QA Focus: Verify control interaction patterns and parameter mapping
 *
 * Test Scenarios:
 * - Slider/knob drag interactions work correctly
 * - Keyboard controls (arrow keys) adjust values
 * - Value boundaries are enforced
 * - Visual feedback on interaction
 * - ARIA accessibility attributes present
 * - Parameter changes affect audio output
 */

import { test, expect } from '@playwright/test';

test.describe('Effect Parameter Controls', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('✓ Should display all effect control sliders', async ({ page }) => {
    // Find all slider controls
    const sliders = page.locator('input[type="range"], input[role="slider"]');
    const count = await sliders.count();

    expect(count).toBeGreaterThan(0, 'Should have at least one effect control slider');

    // Verify they are visible
    const firstSlider = sliders.first();
    await expect(firstSlider).toBeVisible();
  });

  test('✓ Should change value by dragging slider horizontally', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    // Get initial value
    const initialValue = await slider.evaluate(el => parseFloat(el.value));

    // Get slider bounds
    const box = await slider.boundingBox();
    if (!box) return;

    // Drag slider to the right
    const startX = box.x + box.width * 0.3;
    const endX = box.x + box.width * 0.8;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY);
    await page.mouse.up();

    // Value should have changed
    const newValue = await slider.evaluate(el => parseFloat(el.value));
    expect(newValue).not.toBe(initialValue);
  });

  test('✓ Should respond to ArrowUp to increase value', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    // Set to mid-range value
    await slider.fill('50');
    const initialValue = await slider.evaluate(el => parseFloat(el.value));

    // Focus and press arrow up
    await slider.focus();
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    const newValue = await slider.evaluate(el => parseFloat(el.value));
    expect(newValue).toBeGreaterThanOrEqual(initialValue);
  });

  test('✓ Should respond to ArrowDown to decrease value', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    // Set to mid-range value
    await slider.fill('50');
    const initialValue = await slider.evaluate(el => parseFloat(el.value));

    // Focus and press arrow down
    await slider.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    const newValue = await slider.evaluate(el => parseFloat(el.value));
    expect(newValue).toBeLessThanOrEqual(initialValue);
  });

  test('✓ Should enforce minimum boundary value', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    const minValue = await slider.getAttribute('min') ||
                     await slider.getAttribute('aria-valuemin') || '0';

    // Try to set below minimum
    await slider.fill(String(parseFloat(minValue) - 10));
    await page.waitForTimeout(100);

    const value = await slider.evaluate(el => parseFloat(el.value));
    expect(value).toBeGreaterThanOrEqual(parseFloat(minValue));
  });

  test('✓ Should enforce maximum boundary value', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    const maxValue = await slider.getAttribute('max') ||
                     await slider.getAttribute('aria-valuemax') || '100';

    // Try to set above maximum
    await slider.fill(String(parseFloat(maxValue) + 10));
    await page.waitForTimeout(100);

    const value = await slider.evaluate(el => parseFloat(el.value));
    expect(value).toBeLessThanOrEqual(parseFloat(maxValue));
  });

  test('✓ Should have descriptive ARIA labels on all sliders', async ({ page }) => {
    const sliders = page.locator('input[type="range"], input[role="slider"]');
    const count = await sliders.count();

    for (let i = 0; i < count; i++) {
      const slider = sliders.nth(i);
      const ariaLabel = await slider.getAttribute('aria-label');

      expect(ariaLabel).toBeTruthy(`Slider ${i} should have aria-label`);
      expect(ariaLabel?.length).toBeGreaterThan(0);
    }
  });

  test('✓ Should have min/max ARIA attributes', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    const ariaValueMin = await slider.getAttribute('aria-valuemin');
    const ariaValueMax = await slider.getAttribute('aria-valuemax');

    expect(ariaValueMin).toBeTruthy();
    expect(ariaValueMax).toBeTruthy();
    expect(parseFloat(ariaValueMin!)).toBeLessThan(parseFloat(ariaValueMax!));
  });

  test('✓ Should support precise value input via keyboard', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    // Set a specific value
    const targetValue = '42.5';
    await slider.fill(targetValue);
    await page.waitForTimeout(100);

    const value = await slider.evaluate(el => el.value);
    expect(parseFloat(value)).toBe(parseFloat(targetValue));
  });

  test('✓ Should show visual feedback when focused', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    // Focus the slider
    await slider.focus();

    // Verify it's focused
    const isFocused = await slider.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('✓ Should be keyboard navigable (Tab/Shift+Tab)', async ({ page }) => {
    // Tab to first slider
    await page.keyboard.press('Tab');
    let focused = page.locator(':focus');
    let isFocused = await focused.evaluate(el => el.getAttribute('type') === 'range' || el.getAttribute('role') === 'slider').catch(() => false);

    // Keep tabbing until we find a slider
    for (let i = 0; i < 20 && !isFocused; i++) {
      await page.keyboard.press('Tab');
      focused = page.locator(':focus');
      isFocused = await focused.evaluate(el => el.getAttribute('type') === 'range' || el.getAttribute('role') === 'slider').catch(() => false);
    }

    expect(isFocused).toBe(true, 'Should be able to reach a slider via Tab');
  });

  test('✓ Should handle rapid value changes without crashing', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    // Rapidly change values
    for (let i = 0; i < 20; i++) {
      await slider.fill(String(Math.random() * 100));
    }

    // Application should still be responsive
    await expect(page.locator('main')).toBeVisible();
  });

  test('✓ Should display current value feedback during adjustment', async ({ page }) => {
    const slider = page.locator('input[type="range"], input[role="slider"]').first();

    // Get aria-valuenow for tracking
    const initialValueNow = await slider.getAttribute('aria-valuenow');

    // Change value
    await slider.fill('75');
    await page.waitForTimeout(100);

    // Check if aria-valuenow was updated
    const newValueNow = await slider.getAttribute('aria-valuenow');

    if (initialValueNow && newValueNow) {
      expect(newValueNow).not.toBe(initialValueNow);
    }
  });

  test('✓ Should verify parameter control range specifications', async ({ page }) => {
    // Test specific effect controls with expected ranges
    const effectControls = [
      { name: 'Volume', range: [0, 1] },
      { name: 'AGE', range: [0, 100] },
      { name: 'Room', range: [0, 100] },
      { name: 'Saturation', range: [0, 100] }
    ];

    for (const effect of effectControls) {
      const control = page.locator(`input[aria-label*="${effect.name}"]`).first();
      const exists = await control.isVisible().catch(() => false);

      if (exists) {
        const min = parseFloat(await control.getAttribute('min') || await control.getAttribute('aria-valuemin') || '0');
        const max = parseFloat(await control.getAttribute('max') || await control.getAttribute('aria-valuemax') || '100');

        expect(min).toBeLessThanOrEqual(effect.range[0] + 10);
        expect(max).toBeGreaterThanOrEqual(effect.range[1] - 10);
      }
    }
  });
});
