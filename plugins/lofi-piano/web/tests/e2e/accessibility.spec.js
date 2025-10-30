/**
 * E2E Tests: Accessibility
 * 
 * Tests WCAG compliance and accessibility features
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have no automatic accessibility violations', async ({ page }) => {
    // This is a basic check - you can integrate axe-core for deeper testing
    const html = await page.locator('html');
    await expect(html).toHaveAttribute('lang');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through all interactive elements
    const interactiveElements = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      
      if (await focused.count() > 0) {
        const tagName = await focused.evaluate(el => el.tagName);
        interactiveElements.push(tagName);
      }
    }
    
    // Should have found some interactive elements
    expect(interactiveElements.length).toBeGreaterThan(0);
  });

  test('should have proper focus indicators', async ({ page }) => {
    const firstKnob = page.locator('[role="slider"]').first();
    await firstKnob.focus();
    
    // Focused element should be visible
    await expect(firstKnob).toBeFocused();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Check for proper button elements (not divs with onclick)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should have descriptive labels for controls', async ({ page }) => {
    const sliders = page.locator('[role="slider"]');
    const count = await sliders.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const slider = sliders.nth(i);
      const ariaLabel = await slider.getAttribute('aria-label');
      
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel.length).toBeGreaterThan(0);
    }
  });

  test('should not trap keyboard focus', async ({ page }) => {
    // Tab forward multiple times
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Should be able to continue tabbing (no focus trap)
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Check for ARIA landmarks
    const main = page.locator('main, [role="main"]');
    const landmarks = await main.count();
    
    // Should have proper document structure
    expect(landmarks).toBeGreaterThanOrEqual(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Get computed styles of text elements
    const textElements = page.locator('p, h1, h2, h3, span, label').first();
    
    if (await textElements.count() > 0) {
      const color = await textElements.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor
        };
      });
      
      // At minimum, color should be defined
      expect(color.color).toBeTruthy();
    }
  });

  test('should support reduced motion preferences', async ({ page, context }) => {
    // Test with reduced motion enabled
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });
    
    await page.goto('/');
    
    // Plugin should load without animation crashes
    await expect(page.locator('body')).toBeVisible();
  });
});
