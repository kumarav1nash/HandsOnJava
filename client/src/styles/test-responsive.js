/**
 * Responsive Design Verification Script
 * Tests the enhanced styling system across different breakpoints
 */

class ResponsiveTester {
  constructor() {
    this.breakpoints = {
      mobile: 640,
      tablet: 768,
      smallDesktop: 1024,
      largeDesktop: 1200
    };
    
    this.testResults = [];
    this.currentBreakpoint = this.detectBreakpoint();
  }

  detectBreakpoint() {
    const width = window.innerWidth;
    if (width <= this.breakpoints.mobile) return 'mobile';
    if (width <= this.breakpoints.tablet) return 'tablet';
    if (width <= this.breakpoints.smallDesktop) return 'smallDesktop';
    return 'largeDesktop';
  }

  testTypography() {
    const tests = [];
    const elements = document.querySelectorAll('[class*="font-size"], [class*="text-"]');
    
    elements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      
      tests.push({
        element: element.tagName,
        fontSize: fontSize,
        lineHeight: lineHeight,
        readable: fontSize >= 12 && lineHeight >= 1.2,
        breakpoint: this.currentBreakpoint
      });
    });
    
    return tests;
  }

  testColorContrast() {
    const tests = [];
    const colorPairs = [
      { bg: '--ds-color-background', text: '--ds-color-text-primary' },
      { bg: '--ds-color-surface', text: '--ds-color-text-secondary' },
      { bg: '--ds-color-brand-primary', text: 'white' },
      { bg: '--ds-color-success', text: 'white' },
      { bg: '--ds-color-warning', text: 'black' },
      { bg: '--ds-color-error', text: 'white' }
    ];

    colorPairs.forEach(pair => {
      const bgColor = this.getColorValue(pair.bg);
      const textColor = this.getColorValue(pair.text);
      const contrastRatio = this.calculateContrastRatio(bgColor, textColor);
      
      tests.push({
        background: pair.bg,
        text: pair.text,
        contrastRatio: contrastRatio,
        wcagAA: contrastRatio >= 4.5,
        wcagAAA: contrastRatio >= 7.0,
        breakpoint: this.currentBreakpoint
      });
    });

    return tests;
  }

  getColorValue(color) {
    if (color === 'white') return { r: 255, g: 255, b: 255 };
    if (color === 'black') return { r: 0, g: 0, b: 0 };
    
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(color);
    
    if (value.startsWith('#')) {
      const hex = value.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
    
    if (value.startsWith('rgb')) {
      const matches = value.match(/\d+/g);
      return {
        r: parseInt(matches[0]),
        g: parseInt(matches[1]),
        b: parseInt(matches[2])
      };
    }
    
    return { r: 0, g: 0, b: 0 };
  }

  calculateContrastRatio(color1, color2) {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  getRelativeLuminance(color) {
    const { r, g, b } = color;
    const rs = r / 255;
    const gs = g / 255;
    const bs = b / 255;
    
    const rLinear = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
    const gLinear = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
    const bLinear = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  testLayout() {
    const tests = [];
    const containers = document.querySelectorAll('.test-card, .course-card, [class*="grid"], [class*="flex"]');
    
    containers.forEach(container => {
      const rect = container.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(container);
      
      tests.push({
        element: container.className,
        width: rect.width,
        height: rect.height,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        display: computedStyle.display,
        breakpoint: this.currentBreakpoint,
        responsive: this.testResponsiveBehavior(container)
      });
    });
    
    return tests;
  }

  testResponsiveBehavior(element) {
    const width = window.innerWidth;
    const elementWidth = element.getBoundingClientRect().width;
    
    if (width <= this.breakpoints.mobile) {
      return elementWidth <= width - 32; // Should have 16px padding on each side
    }
    
    return elementWidth > 0 && elementWidth <= width;
  }

  testAnimations() {
    const tests = [];
    const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="ds-animate-"]');
    
    animatedElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const transitionDuration = computedStyle.transitionDuration;
      const animationDuration = computedStyle.animationDuration;
      
      tests.push({
        element: element.className,
        hasTransition: transitionDuration !== '0s',
        hasAnimation: animationDuration !== '0s',
        transitionDuration: transitionDuration,
        animationDuration: animationDuration,
        breakpoint: this.currentBreakpoint
      });
    });
    
    return tests;
  }

  testAccessibility() {
    const tests = [];
    
    // Test focus styles
    const focusableElements = document.querySelectorAll('button, [tabindex], input, select, textarea, a');
    focusableElements.forEach(element => {
      element.focus();
      const outline = window.getComputedStyle(element).outline;
      tests.push({
        element: element.tagName,
        hasFocusStyle: outline !== 'none',
        outline: outline,
        breakpoint: this.currentBreakpoint
      });
      element.blur();
    });
    
    // Test reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    tests.push({
      test: 'prefers-reduced-motion',
      enabled: prefersReducedMotion,
      breakpoint: this.currentBreakpoint
    });
    
    // Test high contrast
    const prefersHighContrast = window.matchMedia('(prefers-high-contrast: high)').matches;
    tests.push({
      test: 'prefers-high-contrast',
      enabled: prefersHighContrast,
      breakpoint: this.currentBreakpoint
    });
    
    return tests;
  }

  runAllTests() {
    console.log('🧪 Running Responsive Design Tests...');
    console.log(`📱 Current breakpoint: ${this.currentBreakpoint}`);
    
    const results = {
      typography: this.testTypography(),
      colorContrast: this.testColorContrast(),
      layout: this.testLayout(),
      animations: this.testAnimations(),
      accessibility: this.testAccessibility(),
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    this.generateReport(results);
    return results;
  }

  generateReport(results) {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    // Typography summary
    const typographyIssues = results.typography.filter(t => !t.readable);
    console.log(`Typography: ${results.typography.length - typographyIssues.length}/${results.typography.length} passed`);
    if (typographyIssues.length > 0) {
      console.warn('Typography issues found:', typographyIssues);
    }
    
    // Color contrast summary
    const contrastIssues = results.colorContrast.filter(c => !c.wcagAA);
    console.log(`Color Contrast: ${results.colorContrast.length - contrastIssues.length}/${results.colorContrast.length} passed WCAG AA`);
    if (contrastIssues.length > 0) {
      console.warn('Color contrast issues found:', contrastIssues);
    }
    
    // Layout summary
    const layoutIssues = results.layout.filter(l => !l.responsive);
    console.log(`Layout: ${results.layout.length - layoutIssues.length}/${results.layout.length} responsive`);
    if (layoutIssues.length > 0) {
      console.warn('Layout issues found:', layoutIssues);
    }
    
    // Animation summary
    console.log(`Animations: ${results.animations.length} elements tested`);
    
    // Accessibility summary
    const accessibilityIssues = results.accessibility.filter(a => a.hasFocusStyle === false);
    console.log(`Accessibility: ${results.accessibility.length - accessibilityIssues.length}/${results.accessibility.length} elements have focus styles`);
    if (accessibilityIssues.length > 0) {
      console.warn('Accessibility issues found:', accessibilityIssues);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('📋 Full results available in console.');
  }
}

// Auto-run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const tester = new ResponsiveTester();
  
  // Run tests immediately
  setTimeout(() => {
    tester.runAllTests();
  }, 1000);
  
  // Re-run tests on resize with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      console.log('\n🔄 Viewport resized, re-running tests...');
      tester.currentBreakpoint = tester.detectBreakpoint();
      tester.runAllTests();
    }, 500);
  });
  
  // Make tester available globally for manual testing
  window.responsiveTester = tester;
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveTester;
}