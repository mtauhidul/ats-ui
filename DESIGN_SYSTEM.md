# ATS UI Design System

A comprehensive design system implementation for the ATS (Applicant Tracking System) UI with dark theme support and consistent styling guidelines.

## 🎨 Color Palette

### Primary Colors
- **Black (Background)**: `#0D0D0D`
- **Deep Gray (Card)**: `#1A1A1A`
- **Medium Gray (Border/Divider)**: `#2B2B2B`

### Accent Colors
- **Purple (Highlight/Graph Line)**: `#A689F3`
- **Yellow (Highlight/Secondary Graph Line)**: `#FFD85C`
- **Green (Success Indicator)**: `#2ECC71`
- **Red (Error/Negative Indicator)**: `#E74C3C`

### Text Colors
- **Primary Text (White)**: `#FFFFFF`
- **Secondary Text (Muted Gray)**: `#B3B3B3`
- **Subtle Text/Placeholder**: `#7A7A7A`

### Data Visualization
- **Chart Line 1**: `#A689F3`
- **Chart Line 2**: `#FFD85C`
- **Map Dots/Heat Area**: `#C5A3FF`

## 🔤 Typography

### Font Family
- **Primary**: Inter or Poppins (Sans-serif)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600

### Font Sizes (Responsive)
- **Heading**: 20–28px (`clamp(20px, 2.5vw, 28px)`)
- **Body**: 14–16px (`clamp(14px, 1.5vw, 16px)`)
- **Label**: 12–13px (`clamp(12px, 1vw, 13px)`)

## 🚀 Usage

### Method 1: CSS Variables
The design system is implemented using CSS custom properties that automatically adapt to light/dark themes.

```css
.my-component {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

### Method 2: Design Tokens (TypeScript)
Import and use the design tokens in your React components:

```tsx
import { colors, typography, tailwindClasses } from '../lib/design-tokens';

const MyComponent = () => (
  <div style={{ backgroundColor: colors.deepGray, color: colors.text.primary }}>
    <h1 style={{ fontSize: typography.fontSize.heading.responsive }}>
      Hello World
    </h1>
  </div>
);
```

### Method 3: Tailwind CSS Classes
Use the predefined Tailwind classes:

```tsx
const MyComponent = () => (
  <div className={`${tailwindClasses.backgrounds.deepGray} ${tailwindClasses.text.primary}`}>
    <h1 className="text-heading font-semibold">Hello World</h1>
  </div>
);
```

### Method 4: Utility Classes
Use the custom utility classes defined in the CSS:

```tsx
const MyComponent = () => (
  <div className="bg-deep-gray text-primary">
    <h1 className="text-heading font-semibold">Hello World</h1>
  </div>
);
```

## 📁 File Structure

```
src/
├── styles/
│   └── design-system.css          # Comprehensive CSS with utilities
├── lib/
│   └── design-tokens.ts           # TypeScript design tokens
├── components/
│   └── DesignSystemDemo.tsx       # Interactive demo component
└── index.css                      # Main CSS with theme variables
```

## 🎯 Component Examples

### Button Primary
```tsx
<button className="button-primary">
  Click me
</button>
```

### Button Secondary
```tsx
<button className="button-secondary">
  Secondary Action
</button>
```

### Card Component
```tsx
<div className="card-dark">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>
```

### Input Field
```tsx
<input 
  type="text" 
  className="input-dark" 
  placeholder="Enter text..."
/>
```

## 🎨 Theme Support

The design system supports both light and dark themes automatically. The dark theme is the primary focus with the following characteristics:

- **Background**: Deep black (`#0D0D0D`)
- **Cards/Containers**: Deep gray (`#1A1A1A`)
- **Borders**: Medium gray (`#2B2B2B`)
- **Text**: White (`#FFFFFF`) for primary, muted gray (`#B3B3B3`) for secondary

## 🛠️ Customization

### Adding New Colors
1. Update `src/lib/design-tokens.ts`
2. Add corresponding CSS variables in `src/index.css`
3. Create utility classes in `src/styles/design-system.css`

### Modifying Typography
1. Update font sizes in `design-tokens.ts`
2. Modify CSS custom properties in `src/index.css`
3. Adjust responsive clamp values as needed

## 📊 Data Visualization Guidelines

When creating charts and data visualizations:

- **Primary data series**: Use purple (`#A689F3`)
- **Secondary data series**: Use yellow (`#FFD85C`)
- **Tertiary/accent elements**: Use light purple (`#C5A3FF`)
- **Success metrics**: Use green (`#2ECC71`)
- **Error/warning metrics**: Use red (`#E74C3C`)

## 🔧 Development

### Viewing the Design System
Run the application and the design system demo will be displayed by default:

```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## 📚 Best Practices

1. **Consistency**: Always use design tokens instead of hardcoded values
2. **Accessibility**: Ensure sufficient contrast ratios (already built into the color palette)
3. **Responsive**: Typography scales automatically based on viewport size
4. **Performance**: CSS variables enable efficient theme switching
5. **Maintainability**: Centralized design tokens make updates easy

## 🎭 Dark Theme by Default

This design system is optimized for dark interfaces, providing:
- Reduced eye strain in low-light environments
- Professional, modern appearance
- Better focus on data and content
- Energy efficiency on OLED displays

## 📝 Contributing

When adding new components or styles:
1. Follow the established color palette
2. Use the defined typography scale
3. Implement responsive design principles
4. Test in both light and dark themes (if applicable)
5. Update this documentation