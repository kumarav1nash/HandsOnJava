# Learn Section Styling Documentation

## Overview
This document provides comprehensive guidelines for the enhanced Learn section styling system, including design tokens, component usage, and accessibility standards.

## Design System Architecture

### Color Palette
The Learn section uses a custom color scheme built around indigo and emerald tones:

**Primary Colors:**
- Primary: `#6366f1` (Indigo 500) - Main brand color
- Primary Light: `#818cf8` (Indigo 400) - Hover states
- Primary Dark: `#4f46e5` (Indigo 600) - Active states

**Secondary Colors:**
- Secondary: `#10b981` (Emerald 500) - Success states
- Secondary Light: `#34d399` (Emerald 400) - Success hover
- Secondary Dark: `#059669` (Emerald 600) - Success active

**Semantic Colors:**
- Success: `#059669` - Positive feedback
- Warning: `#d97706` - Cautions and alerts
- Danger: `#dc2626` - Errors and critical states
- Info: `#2563eb` - Information and tips

### Typography System

**Font Families:**
```css
--ds-font-family-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--ds-font-family-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--ds-font-family-mono: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
```

**Fluid Typography Scale:**
- XS: `clamp(0.75rem, 0.7rem + 0.25vw, 0.8rem)` (12-13px)
- SM: `clamp(0.875rem, 0.825rem + 0.25vw, 0.95rem)` (14-15px)
- Base: `clamp(1rem, 0.95rem + 0.25vw, 1.1rem)` (16-18px)
- LG: `clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)` (18-20px)
- XL: `clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)` (20-24px)
- 2XL: `clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)` (24-30px)

### Spacing System
Based on a 4px grid system with golden ratio scaling:
```css
--ds-spacing-xs: 0.5rem;    /* 8px */
--ds-spacing-sm: 0.75rem;   /* 12px */
--ds-spacing-md: 1rem;      /* 16px */
--ds-spacing-lg: 1.25rem;   /* 20px */
--ds-spacing-xl: 1.5rem;    /* 24px */
--ds-spacing-2xl: 2rem;     /* 32px */
--ds-spacing-3xl: 2.5rem;   /* 40px */
```

## Component Usage Guidelines

### Course Cards
Enhanced course cards with gradient backgrounds and hover animations:

```jsx
<div className="course-card ds-card ds-card--elevated ds-card--interactive">
  <div className="course-card__header">
    <h3 className="course-card__title">{title}</h3>
    <span className="ds-tag ds-tag--beginner ds-tag--sm ds-tag--interactive">
      {level}
    </span>
  </div>
  <p className="course-card__description">{summary}</p>
  
  {/* Progress tracker with animated fill */}
  <div className="course-card__progress">
    <div className="course-card__progress-header">
      <span className="course-card__progress-label">Progress</span>
      <span className="course-card__progress-value">{progress}%</span>
    </div>
    <div className="course-card__progress-bar">
      <div className="course-card__progress-fill" style={{ width: `${progress}%` }} />
    </div>
  </div>
  
  <button className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block ds-hover-lift">
    {started ? 'Continue Learning' : 'Start Learning'}
  </button>
</div>
```

### Navigation Chips
Interactive navigation with state-based styling:

```jsx
<button
  className={`course__nav-chip ${active ? 'is-active' : ''} ${completed ? 'is-completed' : ''}`}
  aria-current={active ? 'page' : undefined}
>
  <span className="course__nav-label">{i + 1}. {label}</span>
</button>
```

### Concept Steps
Enhanced learning steps with gradient backgrounds:

```jsx
<div className="concept__step ds-card ds-card--elevated">
  <h3 className="concept__step-header">
    <span className="concept__step-number">{stepNumber}</span>
    {step.description}
  </h3>
  
  {step.hint && (
    <div className="concept__step-hint">
      <strong>Hint:</strong> {step.hint}
    </div>
  )}
  
  <div className="concept__step-try">
    <p className="ds-text ds-text--muted">Try it out:</p>
    <InlineCodeRunner initialCode={step.code} />
  </div>
</div>
```

## Animation System

### Entrance Animations
- `ds-animate-fade-in`: Simple fade in
- `ds-animate-fade-in-up`: Fade in with upward motion
- `ds-animate-fade-in-down`: Fade in with downward motion
- `ds-animate-scale-in`: Scale up from center
- `ds-animate-slide-in-right`: Slide in from right
- `ds-animate-slide-in-left`: Slide in from left

### Interactive Animations
- `ds-hover-lift`: Subtle lift on hover
- `ds-card--interactive`: Enhanced card hover with scaling
- `ds-tag--interactive`: Interactive tag animations

### Staggered Animations
```jsx
<div className="ds-animate-stagger">
  <div>Item 1</div> {/* 0ms delay */}
  <div>Item 2</div> {/* 100ms delay */}
  <div>Item 3</div> {/* 200ms delay */}
</div>
```

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: All text meets 4.5:1 contrast ratio minimum
- **Interactive Elements**: Minimum 44px touch targets
- **Focus Indicators**: Visible focus states with 2px outline
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **High Contrast**: Supports `prefers-contrast: high` mode

### ARIA Implementation
- Proper `role` attributes for semantic elements
- `aria-label` and `aria-labelledby` for screen readers
- `aria-current` for active navigation items
- `aria-describedby` for additional context

### Keyboard Navigation
- Tab order follows logical content flow
- Interactive elements are keyboard accessible
- Skip links for main content navigation
- Escape key support for modals and overlays

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
@media (max-width: 480px)  { /* Phones */ }
@media (max-width: 768px)  { /* Tablets */ }
@media (max-width: 1024px) { /* Small Laptops */ }
@media (min-width: 1280px) { /* Large Screens */ }
```

### Fluid Typography
All font sizes use `clamp()` for responsive scaling that adapts to viewport size while maintaining readability.

### Flexible Layouts
- CSS Grid for course card layouts
- Flexbox for navigation and component alignment
- Container queries for component-level responsiveness

## Performance Optimizations

### CSS Architecture
- Modular imports to reduce bundle size
- Utility classes for common patterns
- CSS custom properties for theme switching
- Hardware acceleration with `transform: translateZ(0)`

### Animation Performance
- `transform` and `opacity` for smooth 60fps animations
- `will-change` for complex animations
- Reduced motion support for accessibility
- Hardware acceleration enabled

### Bundle Optimization
```css
/* Only import what's needed */
@import './enhanced-tokens.css';
@import './animations.css';
@import './learn-enhancements.css';
```

## Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers (iOS Safari, Chrome Android)

## Maintenance Guidelines

### Adding New Components
1. Use existing design tokens for consistency
2. Follow BEM naming convention
3. Include accessibility attributes
4. Add responsive considerations
5. Document usage examples

### Theme Customization
Modify the design tokens in `enhanced-tokens.css`:
```css
:root {
  --ds-brand-primary: #your-color;
  --ds-brand-secondary: #your-secondary;
}
```

### Animation Adjustments
Customize animation timing in component styles:
```css
.my-component {
  transition: all var(--ds-duration-normal) var(--ds-easing-base);
}
```

## Testing Checklist

### Visual Regression Testing
- [ ] Course cards display correctly
- [ ] Progress bars animate smoothly
- [ ] Navigation chips show active states
- [ ] Typography hierarchy is clear
- [ ] Color contrast meets standards

### Responsive Testing
- [ ] Mobile layout (320px - 480px)
- [ ] Tablet layout (481px - 768px)
- [ ] Desktop layout (769px+)
- [ ] Fluid typography scaling
- [ ] Touch target sizes

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Focus indicators visible
- [ ] Reduced motion respected

### Performance Testing
- [ ] CSS bundle size optimized
- [ ] Animation performance (60fps)
- [ ] Loading states functional
- [ ] No layout shifts
- [ ] Memory usage efficient

## Troubleshooting

### Common Issues
1. **Animations not working**: Check if reduced motion is enabled
2. **Colors not updating**: Verify CSS custom property usage
3. **Responsive issues**: Check breakpoint implementation
4. **Accessibility violations**: Run automated accessibility tests

### Debug Mode
Enable debug mode by adding `data-debug="true"` to the HTML element to visualize component boundaries and spacing.