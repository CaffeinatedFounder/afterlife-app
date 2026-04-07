# Afterlife UI Components

Production-ready React/TypeScript UI component library for the Afterlife PWA, built with Tailwind CSS and using the Afterlife brand color palette.

## Base Path
```
/sessions/adoring-exciting-hopper/afterlife-app/src/components/ui/
```

## Import Pattern
All components are exported from `@/components/ui` for clean imports:
```typescript
import { Button, Card, Input, Modal } from '@/components/ui';
```

## Brand Colors
- **brand-primary**: #2D2D7F (Deep Purple)
- **brand-secondary**: #4A4ABA (Vibrant Purple)
- **brand-accent**: #6C63FF (Accent Purple)
- **afterlife-success**: #22C55E (Green)
- **afterlife-error**: #EF4444 (Red)

---

## Components

### 1. Button (`button.tsx`)
Versatile button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (shows spinner, defaults: false)
- Supports all standard HTML button attributes

**Usage:**
```typescript
<Button variant="primary" size="md">Click me</Button>
<Button variant="secondary" size="lg">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost" isLoading>Loading...</Button>
```

---

### 2. Card (`card.tsx`)
Flexible card container with header, body, and footer slots.

**Components:**
- `Card` - Main container
- `CardHeader` - Header section with border
- `CardBody` - Main content area
- `CardFooter` - Footer with action buttons

**Card Props:**
- `variant`: 'default' | 'elevated' | 'interactive' (default: 'default')

**Usage:**
```typescript
<Card variant="interactive">
  <CardHeader>Header Title</CardHeader>
  <CardBody>Main content goes here</CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### 3. Input (`input.tsx`)
Text input with label, error state, and helper text.

**Props:**
- `type`: 'text' | 'email' | 'password' | 'tel' | 'number' (default: 'text')
- `label`: Optional label text
- `error`: Error message to display
- `helperText`: Helper text below input
- `icon`: Optional icon component for left side
- Supports all standard HTML input attributes

**Usage:**
```typescript
<Input
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  error="Invalid email format"
  helperText="We'll never share your email"
/>

<Input
  type="password"
  label="Password"
  icon={<LockIcon />}
/>
```

---

### 4. Modal (`modal.tsx`)
Full-screen modal dialog with backdrop and slide-up animation.

**Components:**
- `Modal` - Main modal container
- `ModalFooter` - Footer with action buttons

**Modal Props:**
- `isOpen`: boolean (required, controls visibility)
- `onClose`: () => void (required, close handler)
- `title`: Optional modal title
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `showCloseButton`: boolean (default: true)

**Usage:**
```typescript
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

---

### 5. Progress Bar (`progress-bar.tsx`)
Two progress components for different use cases.

#### ProgressBar
Linear progress bar with optional percentage label.

**Props:**
- `value`: number (current progress)
- `max`: number (default: 100, max value)
- `showLabel`: boolean (show percentage, default: false)
- `animated`: boolean (pulse animation, default: true)

**Usage:**
```typescript
<ProgressBar value={65} max={100} showLabel animated />
<ProgressBar value={3} max={5} />
```

#### SteppedProgress
Multi-step progress indicator (for Will sections 1-6).

**Props:**
- `currentStep`: number (active step)
- `totalSteps`: number (total steps)
- `stepLabels`: string[] (optional labels for each step)

**Usage:**
```typescript
<SteppedProgress
  currentStep={3}
  totalSteps={6}
  stepLabels={['Basic', 'Beneficiaries', 'Assets', 'Instructions', 'Review', 'Sign']}
/>
```

---

### 6. Avatar (`avatar.tsx`)
User avatar showing initials or image.

**Props:**
- `name`: string (for generating initials, default: 'User')
- `image`: string (optional image URL)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `alt`: string (image alt text)

**Features:**
- Auto-generates initials from name
- Deterministic color assignment based on name
- Falls back to initials if no image provided
- 8 color palette for visual variety

**Usage:**
```typescript
<Avatar name="John Doe" />
<Avatar name="Jane Smith" image="https://..." size="lg" />
<Avatar name="Alice Johnson" size="sm" />
```

---

### 7. Badge (`badge.tsx`)
Small tag/label component with color variants.

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'error' | 'info' (default: 'default')
- `size`: 'sm' | 'md' (default: 'md')
- `icon`: Optional icon element

**Usage:**
```typescript
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info" icon={<InfoIcon />}>Info</Badge>
```

---

### 8. Toast (`toast.tsx`)
Re-export of Sonner toast with Afterlife styling.

**Features:**
- Pre-styled with brand colors
- Success, error, loading, and default variants
- Configurable position and theme
- Action buttons and close buttons

**Usage:**
```typescript
import { Toaster, toast } from '@/components/ui';

// In your layout
<Toaster position="bottom-right" theme="light" />

// In your components
toast.success('Changes saved!');
toast.error('Something went wrong');
toast.loading('Uploading...');
```

---

### 9. Dropdown (`dropdown.tsx`)
Custom select component with search capability.

**Props:**
- `label`: Optional label text
- `placeholder`: Placeholder text (default: 'Select an option')
- `options`: DropdownOption[] (required)
  - `label`: string
  - `value`: string
  - `disabled`: boolean (optional)
  - `icon`: ReactNode (optional)
- `value`: Current selected value
- `onValueChange`: (value: string) => void
- `searchable`: boolean (enable search, default: false)
- `error`: Error message
- `helperText`: Helper text
- `icon`: Left-side icon

**Usage:**
```typescript
const [selected, setSelected] = useState('');

<Dropdown
  label="Select Status"
  placeholder="Choose a status..."
  options={[
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived', disabled: true },
  ]}
  value={selected}
  onValueChange={setSelected}
  searchable
/>
```

---

### 10. Empty State (`empty-state.tsx`)
Placeholder component for empty lists or states.

**Props:**
- `icon`: Optional icon element
- `title`: string (required, main heading)
- `description`: Optional description text
- `actionLabel`: Label for primary button
- `onAction`: () => void (primary button handler)
- `secondaryActionLabel`: Secondary button label
- `onSecondaryAction`: () => void (secondary button handler)

**Usage:**
```typescript
<EmptyState
  icon={<DocumentIcon />}
  title="No documents found"
  description="Create your first document to get started"
  actionLabel="Create Document"
  onAction={() => navigateToCreate()}
  secondaryActionLabel="Browse Templates"
  onSecondaryAction={() => navigateToTemplates()}
/>
```

---

## Styling Approach

All components use:
- **Tailwind CSS** for utility-first styling
- **`cn()` utility** from `@/lib/utils` for class merging
- **CSS transitions** for smooth interactions
- **Focus rings** for accessibility
- **Brand color tokens** for consistent theming

## Accessibility

All components follow WAI-ARIA best practices:
- Proper `role` attributes
- Keyboard navigation support
- Focus management (modals trap focus)
- Semantic HTML (buttons, labels, etc.)
- Color contrast compliance
- Screen reader friendly

## TypeScript Support

All components are fully typed with:
- Proper interface exports
- Generic ref forwarding
- Standard HTML attribute extension
- Type-safe prop handling

## Usage in Layout

```typescript
'use client';

import { Toaster } from '@/components/ui';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
```

## Component Statistics

- **Total Files**: 11
- **Total Lines**: ~1,500 LOC (production code)
- **TypeScript**: 100% typed
- **Variants**: 25+ total across all components
- **Responsive**: Mobile-first design
- **Accessible**: WCAG 2.1 compliant

## Future Enhancements

- Dark mode support (toggle theme)
- Additional color variants
- Animation presets (Framer Motion integration)
- Form validation helpers
- Compound component patterns for complex layouts
