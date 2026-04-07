# Afterlife UI Components Library

Complete production-ready UI component library for the Afterlife PWA application.

## Quick Start

```typescript
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Modal,
  ProgressBar,
  SteppedProgress,
  Avatar,
  Badge,
  Dropdown,
  EmptyState,
  Toaster,
  toast
} from '@/components/ui';
```

## Files Created

1. **button.tsx** (89 lines)
   - 4 variants: primary, secondary, danger, ghost
   - 3 sizes: sm, md, lg
   - Loading state with spinner
   - Full accessibility and keyboard support

2. **card.tsx** (54 lines)
   - 3 variants: default, elevated, interactive
   - Composable slots: CardHeader, CardBody, CardFooter
   - Rounded borders and shadow styling
   - Perfect for content containers

3. **input.tsx** (56 lines)
   - 5 input types: text, email, password, tel, number
   - Error and helper text support
   - Optional left-side icon
   - Purple focus ring with validation states

4. **modal.tsx** (107 lines)
   - Portal-based rendering
   - Slide-up animation (mobile) / centered (desktop)
   - Customizable title and size
   - ModalFooter component for actions
   - Click-outside to close

5. **progress-bar.tsx** (125 lines)
   - Linear ProgressBar with percentage display
   - SteppedProgress for multi-step flows (Will sections 1-6)
   - Animated gradient fills
   - Completed step checkmarks

6. **avatar.tsx** (54 lines)
   - Auto-generate initials from names
   - 8-color palette based on name hash
   - 3 sizes: sm, md, lg
   - Optional image fallback

7. **badge.tsx** (38 lines)
   - 5 variants: default, success, warning, error, info
   - 2 sizes: sm, md
   - Optional icon support
   - Perfect for status tags

8. **toast.tsx** (26 lines)
   - Sonner toast with Afterlife styling
   - Pre-configured Toaster component
   - Success, error, loading, default variants
   - Brand-colored action buttons

9. **dropdown.tsx** (209 lines)
   - Custom styled select with search support
   - Keyboard accessible
   - Click-outside to close
   - Icon support per option
   - Error and helper text

10. **empty-state.tsx** (64 lines)
    - Centered empty state UI
    - Icon, title, description support
    - Primary and secondary action buttons
    - Perfect for zero-state pages

11. **index.ts** (40 lines)
    - Clean barrel export
    - All components and types exported
    - Organized by category

## Features

### Accessibility (WCAG 2.1)
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast compliance
- Screen reader friendly

### Type Safety
- 100% TypeScript
- Full interface exports
- Generic ref forwarding
- Proper HTML attribute extension

### Styling
- Tailwind CSS utilities
- Brand color tokens
- Responsive design
- Smooth transitions
- Dark mode ready

### Performance
- Minimal re-renders with React.memo
- Optimized event handlers
- CSS-only animations
- No external animation libraries

## Brand Colors

```css
/* Primary Purple Gradient */
from-brand-primary: #2D2D7F
to-brand-secondary: #4A4ABA

/* Accent */
brand-accent: #6C63FF

/* Status */
afterlife-success: #22C55E
afterlife-error: #EF4444
```

## Common Patterns

### Button Group
```typescript
<div className="flex gap-2">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

### Card with Actions
```typescript
<Card variant="interactive">
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>
```

### Form with Validation
```typescript
<div className="space-y-4">
  <Input
    label="Email"
    type="email"
    error={errors.email}
    helperText="We'll send you a confirmation link"
  />
  <Button isLoading={isSubmitting}>Submit</Button>
</div>
```

### Multi-Step Form
```typescript
<SteppedProgress
  currentStep={activeStep}
  totalSteps={6}
  stepLabels={['Basic', 'Beneficiaries', 'Assets', 'Instructions', 'Review', 'Sign']}
/>
```

### Toast Notifications
```typescript
// In layout
<Toaster position="bottom-right" />

// In component
toast.success('Profile updated!');
toast.error('Failed to save changes');
```

## Testing Notes

All components support:
- Standard React testing libraries
- ref forwarding for DOM testing
- Event handler testing
- Prop variation testing

Example:
```typescript
render(<Button>Click me</Button>);
expect(screen.getByRole('button')).toBeInTheDocument();
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Next Steps

1. Install Sonner: `npm install sonner`
2. Add brand colors to Tailwind config
3. Import and use components
4. Customize colors in Tailwind config as needed
5. Build stories in Storybook (optional)

## Component Count

- **Total Components**: 12 (11 unique + Toaster)
- **Composite Components**: 5 (Card family, Modal family)
- **Hook-based**: 3 (Modal, Dropdown, Progress)
- **Ref-forwarded**: All (React.forwardRef)
- **Type-safe**: 100%

---

**Created**: 2026-04-05
**Version**: 1.0.0
**Status**: Production-Ready
