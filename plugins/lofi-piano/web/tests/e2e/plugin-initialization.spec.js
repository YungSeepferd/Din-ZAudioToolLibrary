/**
 * E2E Tests: Plugin Initialization
 * 
 * Tests the initial load and setup of the LoFi Piano plugin
 */

import { test, expect } from '@playwright/test';

test.describe('Plugin Initialization', () => {
  test('should load the plugin successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for main content to load
    await expect(page.locator('body')).toBeVisible();
    
    // Verify title or header
    await expect(page).toHaveTitle(/LoFi Piano|Postcard Piano/i);
  });

  test('should display control panel', async ({ page }) => {
    await page.goto('/');
    
    // Look for control panel or main UI elements
    const controlPanel = page.locator('[class*="control-panel"]').first();
    await expect(controlPanel).toBeVisible({ timeout: 10000 });
  });

  test('should display piano keyboard', async ({ page }) => {
    await page.goto('/');
    
    // Look for piano keyboard component
    const keyboard = page.locator('[class*="piano"]').first();
    await expect(keyboard).toBeVisible({ timeout: 10000 });
  });

  test('should not show console errors on load', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (e.g., Web Audio warnings)
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('AudioContext') && 
      !err.includes('user gesture')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should require user interaction for audio', async ({ page }) => {
    await page.goto('/');
    
    // Web Audio API requires user gesture
    // The plugin should handle this gracefully
    const audioButton = page.locator('button').first();
    
    if (await audioButton.isVisible()) {
      await audioButton.click();
      // After click, audio context should initialize
    }
  });
});
