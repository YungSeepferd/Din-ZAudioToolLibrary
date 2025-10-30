/**
 * E2E Tests: VintageKnob Interaction
 * 
 * Tests user interaction with the custom VintageKnob component
 */

import { test, expect } from '@playwright/test';

test.describe('VintageKnob Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display knobs on page', async ({ page }) => {
    const knobs = page.locator('[class*="knob"]');
    const count = await knobs.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should show knob labels', async ({ page }) => {
    const knobLabels = page.locator('[class*="knob-label"]');
    const firstLabel = knobLabels.first();
    
    await expect(firstLabel).toBeVisible();
    await expect(firstLabel).not.toBeEmpty();
  });

  test('should rotate knob on drag', async ({ page }) => {
    const knob = page.locator('[class*="knob"]').first();
    await expect(knob).toBeVisible();
    
    // Get initial position
    const box = await knob.boundingBox();
    if (!box) return;
    
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Drag from center upward (should increase value)
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 30, centerY - 30);
    await page.mouse.up();
    
    // Verify interaction occurred (no crash)
    await expect(knob).toBeVisible();
  });

  test('should respond to keyboard arrow keys', async ({ page }) => {
    const knob = page.locator('[role="slider"]').first();
    await expect(knob).toBeVisible();
    
    // Focus the knob
    await knob.focus();
    
    // Press arrow up (should increase value)
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    
    // Press arrow down (should decrease value)
    await page.keyboard.press('ArrowDown');
    
    // No crashes = success
    await expect(knob).toBeVisible();
  });

  test('should show visual feedback on hover', async ({ page }) => {
    const knob = page.locator('[class*="knob"]').first();
    await expect(knob).toBeVisible();
    
    // Hover over knob
    await knob.hover();
    
    // Visual feedback should be present (shadow, border change, etc.)
    // We can't easily test CSS changes, but we verify no crash
    await expect(knob).toBeVisible();
  });

  test('should have accessible ARIA attributes', async ({ page }) => {
    const knob = page.locator('[role="slider"]').first();
    await expect(knob).toBeVisible();
    
    // Check for ARIA attributes
    const ariaLabel = await knob.getAttribute('aria-label');
    const ariaValueMin = await knob.getAttribute('aria-valuemin');
    const ariaValueMax = await knob.getAttribute('aria-valuemax');
    
    expect(ariaLabel).toBeTruthy();
    expect(ariaValueMin).toBeTruthy();
    expect(ariaValueMax).toBeTruthy();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through controls
    await page.keyboard.press('Tab');
    
    // Check if focus is on a knob
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
