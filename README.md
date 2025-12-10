# Sweet Alert++
                            
A modern, accessible, lightweight modal and alert library. The better alternative to SweetAlert2.

**[Live Demo](https://raiank.github.io/sweetalertplusplus.github.io/)** | **[NPM Package](https://www.npmjs.com/package/sweetalert-plus-plus)**

## Features

- **Lightweight**: Core is ~5KB gzipped, full library ~12KB (vs SweetAlert2's ~15KB)
- **Tree-shakeable**: Import only what you need
- **Accessible**: Full WCAG 2.1 AA compliance, proper focus management, screen reader support
- **Modern**: CSS custom properties, Web Animations API, ESM-first
- **Framework Ready**: First-class React and Vue 3 adapters
- **TypeScript**: Complete type definitions
- **No Dependencies**: Zero runtime dependencies
- **SSR Safe**: Works with Next.js, Nuxt, and other SSR frameworks
- **Dark Mode**: Automatic dark mode support via CSS custom properties
- **Reduced Motion**: Respects `prefers-reduced-motion`

## Installation

### NPM / Yarn / PNPM

```bash
npm install sweetalert-plus-plus
# or
yarn add sweetalert-plus-plus
# or
pnpm add sweetalert-plus-plus
```

### CDN

Include directly in your HTML via jsDelivr or unpkg:

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@1/dist/sweetalert-plus-plus.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@1/dist/sweetalert-plus-plus.min.js"></script>
```

Or using unpkg:

```html
<link rel="stylesheet" href="https://unpkg.com/sweetalert-plus-plus@1/dist/sweetalert-plus-plus.css">
<script src="https://unpkg.com/sweetalert-plus-plus@1/dist/sweetalert-plus-plus.min.js"></script>
```

## Quick Start

### ES Modules (Recommended)

```javascript
import { alert, confirm, prompt } from 'sweetalert-plus-plus';
import 'sweetalert-plus-plus/css';

// Simple alert
await alert('Hello World!');

// Confirmation dialog
const confirmed = await confirm('Are you sure?');

// Prompt for input
const name = await prompt('What is your name?');
```

### HTML / CDN Usage

Just add two lines to your HTML and start using:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. Add the CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@1/dist/sweetalert-plus-plus.css">
</head>
<body>

  <!-- 3. Use it! -->
  <button onclick="Swal.alert('Hello!')">Alert</button>
  <button onclick="Swal.confirm('Sure?')">Confirm</button>
  <button onclick="Swal.toast('Done!')">Toast</button>

  <!-- 2. Add the JavaScript (before closing body tag) -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@1/dist/sweetalert-plus-plus.min.js"></script>
</body>
</html>
```

**That's it!** The global `Swal` object is available with all functions:

```javascript
// Simple alert
Swal.alert('Hello World!');

// Confirm dialog
Swal.confirm('Are you sure?').then(result => {
  if (result.confirmed) {
    console.log('User confirmed!');
  }
});

// Get user input
Swal.prompt('What is your name?').then(result => {
  console.log('Name:', result.value);
});

// Toast notification
Swal.toast('Saved successfully!');

// Custom modal
Swal.modal({
  title: 'Welcome',
  text: 'Thanks for visiting!',
  icon: 'success'
});
```

> **See it in action:** [Live Demo](https://raiank.github.io/sweetalertplusplus.github.io/)

## API Overview

### Core Functions

```javascript
import { modal, alert, confirm, prompt, toast } from 'sweetalert-plus-plus';

// Full modal with all options
const result = await modal({
  title: 'Custom Modal',
  text: 'This is a custom modal with many options',
  icon: 'info',
  buttons: {
    confirm: 'Proceed',
    cancel: 'Go Back',
  },
  input: {
    type: 'text',
    placeholder: 'Enter something...',
  },
});

// Simple alerts
await alert('Something happened!');
await alert({ title: 'Error', text: 'Something went wrong', icon: 'error' });

// Confirmations
const yes = await confirm('Delete this item?');
const result = await confirm({
  title: 'Are you sure?',
  text: 'This cannot be undone',
  icon: 'warning',
  confirmText: 'Delete',
  cancelText: 'Keep',
});

// Prompts
const value = await prompt('Enter your email');
const email = await prompt({
  title: 'Subscribe',
  inputType: 'email',
  placeholder: 'you@example.com',
  validate: (v) => v.includes('@') || 'Invalid email',
});

// Toast notifications
toast('Quick message');
toast({ text: 'Success!', icon: 'success' });
```

### Result Object

```javascript
const result = await modal({ title: 'Example' });

result.confirmed   // true if user clicked confirm
result.denied      // true if user clicked deny
result.dismissed   // true if dismissed (ESC, backdrop, etc.)
result.dismissReason // 'backdrop' | 'escape' | 'close' | 'timer' | 'cancel'
result.value       // Input value (if input was used)
```

## Full Options Reference

```typescript
interface ModalOptions {
  // Content
  title?: string | HTMLElement;
  text?: string;
  html?: string | HTMLElement;  // Sanitized by default
  footer?: string | HTMLElement;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'loading';
  iconColor?: string;
  image?: { src: string; alt?: string; width?: number; height?: number };

  // Buttons
  buttons?: {
    confirm?: ButtonConfig | string | boolean;
    deny?: ButtonConfig | string | boolean;
    cancel?: ButtonConfig | string | boolean;
    layout?: 'horizontal' | 'vertical' | 'space-between';
  };

  // Input
  input?: {
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
    label?: string;
    placeholder?: string;
    value?: any;
    validate?: (value: any) => string | boolean | Promise<string | boolean>;
    options?: Array<{ value: string; label: string }>;  // For select/radio/checkbox
    required?: boolean;
  };

  // Layout
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  position?: 'center' | 'top' | 'bottom' | 'top-start' | 'top-end';
  width?: number | string;

  // Backdrop
  backdrop?: boolean | 'static';
  closeOnBackdrop?: boolean;

  // Behavior
  showCloseButton?: boolean;
  timer?: number;
  timerProgressBar?: boolean;
  pauseTimerOnHover?: boolean;

  // Animation
  animation?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | false;

  // Accessibility
  a11y?: {
    role?: 'dialog' | 'alertdialog';
    ariaLabel?: string;
    closeOnEscape?: boolean;
    trapFocus?: boolean;
    returnFocus?: boolean;
  };

  // Lifecycle Hooks
  hooks?: {
    onBeforeOpen?: (modal) => void | boolean;
    onOpen?: (modal) => void;
    onAfterOpen?: (modal) => void;
    onBeforeClose?: (modal, result) => void | boolean;
    onClose?: (result) => void;
    onBeforeConfirm?: (value) => any | Promise<any>;
    onInputChange?: (value, modal) => void;
  };
}
```

## Theming with CSS Custom Properties

```css
:root {
  /* Colors */
  --modal-color-primary: #3b82f6;
  --modal-bg: #ffffff;
  --modal-text: #111827;

  /* Sizing */
  --modal-width-md: 28rem;
  --modal-radius: 0.75rem;

  /* Buttons */
  --modal-btn-primary-bg: var(--modal-color-primary);
  --modal-btn-radius: 0.5rem;

  /* Icons */
  --modal-icon-success: #10b981;
  --modal-icon-error: #ef4444;
}

/* Dark mode */
[data-theme="dark"] {
  --modal-bg: #1f2937;
  --modal-text: #f3f4f6;
}
```

## Toast Notifications

```javascript
import { toast, toastSuccess, toastError, toastPromise } from 'sweetalert-plus-plus';

// Simple toast
toast('Hello!');

// With options
toast({
  title: 'New Message',
  text: 'You have a new message',
  icon: 'info',
  position: 'top-end',
  duration: 5000,
  progressBar: true,
  pauseOnHover: true,
  closeOnClick: true,
  draggable: true,
});

// Convenience methods
toastSuccess('Saved!');
toastError('Failed to save');

// Promise toast
const result = await toastPromise(
  fetch('/api/save'),
  {
    loading: 'Saving...',
    success: 'Saved successfully!',
    error: (err) => `Error: ${err.message}`,
  }
);
```

## Queue System

```javascript
import { queue, createQueue } from 'sweetalert-plus-plus';

// Add to queue
await queue.enqueue({ title: 'Step 1' });
await queue.enqueue({ title: 'Step 2' });

// Configure queue
queue.configure({
  mode: 'sequential',  // or 'stack'
  delay: 100,
  showProgress: true,
});

// Fluent builder
const results = await createQueue()
  .add({ title: 'First', text: 'First modal' })
  .add({ title: 'Second', text: 'Second modal' })
  .add({ title: 'Third', text: 'Third modal' })
  .configure({ showProgress: true })
  .run();
```

## React Integration

```jsx
import { ModalProvider, useModal, useConfirm, useToast } from 'sweetalert-plus-plus/react';

// Wrap your app
function App() {
  return (
    <ModalProvider>
      <MyComponent />
    </ModalProvider>
  );
}

// Use hooks
function MyComponent() {
  const { open, close, isOpen } = useModal();
  const { confirm } = useConfirm();
  const { toast, success, error } = useToast();

  async function handleDelete() {
    const yes = await confirm('Delete this item?');
    if (yes) {
      try {
        await deleteItem();
        success('Deleted!');
      } catch (e) {
        error('Failed to delete');
      }
    }
  }

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Vue 3 Integration

```vue
<script setup>
import { useModal, useConfirm, useToast } from 'sweetalert-plus-plus/vue';

const { open, close, isOpen } = useModal();
const { confirm } = useConfirm();
const { toast, success, error } = useToast();

async function handleDelete() {
  const yes = await confirm('Delete this item?');
  if (yes) {
    try {
      await deleteItem();
      success('Deleted!');
    } catch (e) {
      error('Failed to delete');
    }
  }
}
</script>
```

```javascript
// main.js - Plugin installation
import { createApp } from 'vue';
import { createModalPlugin } from 'sweetalert-plus-plus/vue';

const app = createApp(App);
app.use(createModalPlugin({
  // Global config
}));
```

## Multi-step Wizard

```javascript
import { wizard } from 'sweetalert-plus-plus';

const result = await wizard({
  steps: [
    {
      title: 'Step 1: Name',
      input: { type: 'text', label: 'Your name' },
      validate: () => true,
    },
    {
      title: 'Step 2: Email',
      input: { type: 'email', label: 'Your email' },
    },
    {
      title: 'Step 3: Confirm',
      text: 'Ready to submit?',
    },
  ],
  showSteps: true,
  allowBack: true,
});

if (result.completed) {
  console.log(result.values);
  // { 'step-0': 'John', 'step-1': 'john@example.com' }
}
```

## Accessibility Features

- **ARIA Support**: Proper `role`, `aria-modal`, `aria-labelledby`, `aria-describedby`
- **Focus Management**: Focus trapped within modal, returns to trigger on close
- **Keyboard Navigation**: Full Tab cycling, ESC to close
- **Screen Readers**: Live region announcements for dynamic content
- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **Color Contrast**: Default theme meets WCAG AA standards

## Security

- **HTML Sanitization**: All HTML content is sanitized by default
- **CSP Friendly**: No inline styles or `eval`
- **XSS Prevention**: Safe by default, opt-in for unsafe HTML

```javascript
// Safe (sanitized)
modal({ html: '<b>Bold</b><script>evil()</script>' });
// Result: <b>Bold</b>

// Explicit unsafe (use with caution!)
modal({ html: userContent, allowUnsafeHtml: true });
```

## Bundle Sizes

| Entry Point | Minified | Gzipped |
|------------|----------|---------|
| Core only | ~15KB | ~5KB |
| Full library | ~35KB | ~12KB |
| React adapter | +4KB | +1.5KB |
| Vue adapter | +3KB | +1KB |

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Comparison with SweetAlert2

| Feature | Sweet Alert++ | SweetAlert2 |
|---------|--------------|-------------|
| Bundle size | ~12KB gzip | ~15KB gzip |
| Tree-shaking | Yes | No |
| CSS Variables | Yes | Limited |
| Dark mode | Automatic | Manual |
| React hooks | Built-in | Community |
| Vue 3 | Built-in | Community |
| Focus trap | Robust | Buggy |
| ARIA support | Complete | Partial |
| Reduced motion | Yes | No |
| TypeScript | Full | Incomplete |

## Migration from SweetAlert2

```javascript
// SweetAlert2
import Swal from 'sweetalert2';
Swal.fire({
  title: 'Are you sure?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes',
  cancelButtonText: 'No',
});

// Sweet Alert++ equivalent
import { confirm } from 'sweetalert-plus-plus';
await confirm({
  title: 'Are you sure?',
  icon: 'warning',
  confirmText: 'Yes',
  cancelText: 'No',
});
```

## Links

- [Live Demo](https://raiank.github.io/sweetalertplusplus.github.io/)
- [NPM Package](https://www.npmjs.com/package/sweetalert-plus-plus)
- [jsDelivr CDN](https://www.jsdelivr.com/package/npm/sweetalert-plus-plus)
- [unpkg CDN](https://unpkg.com/sweetalert-plus-plus/)
- [GitHub Repository](https://github.com/RaiAnk/Sweetalertplusplus)

## License

MIT
