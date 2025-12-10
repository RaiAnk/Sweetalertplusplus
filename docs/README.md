# SweetAlert++ Documentation

A modern, fully-featured modal and toast notification library with TypeScript support, form handling, theming, and plugin architecture.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Usage](#basic-usage)
  - [Alert](#alert)
  - [Confirm](#confirm)
  - [Prompt](#prompt)
- [Message Types](#message-types)
- [Input Types](#input-types)
- [Form Modals](#form-modals)
- [Toast Notifications](#toast-notifications)
- [Modal Queue](#modal-queue)
- [Theming](#theming)
- [Plugin System](#plugin-system)
- [API Reference](#api-reference)
- [TypeScript Support](#typescript-support)
- [Accessibility](#accessibility)
- [Enterprise Features](#enterprise-features)
  - [Morphism Style Variants](#morphism-style-variants)
  - [Animation Classes](#animation-classes)
  - [Premium Form Styling](#premium-form-styling)
  - [Confetti Effect](#confetti-effect)
  - [Design Tokens](#design-tokens)
- [Enterprise Demo](#enterprise-demo)

---

## Installation

```bash
# npm
npm install sweetalert-plus-plus

# yarn
yarn add sweetalert-plus-plus

# pnpm
pnpm add sweetalert-plus-plus
```

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/sweetalert-plus-plus/dist/sweetalert++.css">
<script src="https://unpkg.com/sweetalert-plus-plus/dist/sweetalert++.umd.js"></script>
```

---

## Quick Start

```javascript
import Swal from 'sweetalert-plus-plus';
import 'sweetalert-plus-plus/dist/sweetalert++.css';

// Simple alert
await Swal.alert('Hello World!');

// Confirmation dialog
const confirmed = await Swal.confirm('Are you sure?');

// Prompt for input
const name = await Swal.prompt('What is your name?');

// Success message
await Swal.success('Operation completed!');

// Toast notification
Swal.toast({ title: 'Saved!', icon: 'success' });
```

---

## Basic Usage

### Alert

Display a simple alert message:

```javascript
import { alert } from 'sweetalert-plus-plus';

// Simple text
await alert('Hello World');

// With options
await alert({
  title: 'Welcome',
  text: 'Thanks for using SweetAlert++',
  icon: 'info',
  buttonText: 'Got it!'
});
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | - | Modal title |
| `text` | `string` | - | Modal message |
| `icon` | `IconType` | - | Icon to display |
| `buttonText` | `string` | `'OK'` | Button text |

### Confirm

Display a confirmation dialog:

```javascript
import { confirm } from 'sweetalert-plus-plus';

// Simple confirm
const confirmed = await confirm('Are you sure?');
if (confirmed) {
  // User clicked Yes
}

// With options
const result = await confirm({
  title: 'Delete Item?',
  text: 'This action cannot be undone.',
  icon: 'warning',
  confirmText: 'Delete',
  cancelText: 'Keep'
});
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `confirmText` | `string` | `'Yes'` | Confirm button text |
| `cancelText` | `string` | `'No'` | Cancel button text |
| `showDeny` | `boolean` | `false` | Show deny button instead of cancel |
| `denyText` | `string` | `'No'` | Deny button text |

### Prompt

Display an input prompt:

```javascript
import { prompt } from 'sweetalert-plus-plus';

// Simple prompt
const name = await prompt('What is your name?');

// With validation
const email = await prompt({
  title: 'Subscribe',
  text: 'Enter your email address',
  inputType: 'email',
  placeholder: 'you@example.com',
  required: true,
  validate: (value) => {
    if (!value.includes('@')) return 'Please enter a valid email';
    return true;
  }
});
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `inputType` | `InputType` | `'text'` | Type of input field |
| `placeholder` | `string` | - | Input placeholder |
| `defaultValue` | `any` | - | Default value |
| `inputLabel` | `string` | - | Label above input |
| `validate` | `function` | - | Validation function |
| `required` | `boolean` | `false` | Is input required |
| `inputOptions` | `array` | - | Options for select input |

---

## Message Types

Predefined modal types for common messages:

```javascript
import { success, error, warning, info, loading } from 'sweetalert-plus-plus';

// Success (auto-closes after 2s)
await success('Operation completed!');
await success({
  title: 'Success!',
  text: 'Your file has been saved.',
  timer: 3000
});

// Error
await error('Something went wrong!');
await error({
  title: 'Error',
  text: 'Failed to save file. Please try again.'
});

// Warning
await warning('Are you sure you want to proceed?');

// Info
await info('Here is some information.');

// Loading (returns modal instance)
const loadingModal = loading('Please wait...');
// ... do async work
loadingModal.close();
```

---

## Input Types

SweetAlert++ supports a wide variety of input types:

### Text Inputs
```javascript
// Text
await prompt({ inputType: 'text', placeholder: 'Enter text...' });

// Email
await prompt({ inputType: 'email', placeholder: 'you@example.com' });

// Password
await prompt({ inputType: 'password', placeholder: 'Enter password' });

// URL
await prompt({ inputType: 'url', placeholder: 'https://example.com' });

// Phone
await prompt({ inputType: 'tel', placeholder: '+1 (555) 000-0000' });

// Search
await prompt({ inputType: 'search', placeholder: 'Search...' });
```

### Numeric Inputs
```javascript
// Number
await prompt({ inputType: 'number', min: 0, max: 100 });

// Currency
await prompt({ inputType: 'currency', currency: 'USD' });

// Percentage
await prompt({ inputType: 'percentage' });

// Range slider
await prompt({ inputType: 'range', min: 0, max: 100, step: 5 });

// Rating
await prompt({ inputType: 'rating', max: 5 });
```

### Selection Inputs
```javascript
// Select dropdown
await prompt({
  inputType: 'select',
  inputOptions: [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3' }
  ]
});

// Radio buttons
await prompt({
  inputType: 'radio',
  inputOptions: [
    { value: 'a', label: 'Choice A' },
    { value: 'b', label: 'Choice B' }
  ]
});

// Checkboxes
await prompt({
  inputType: 'checkbox',
  inputOptions: [
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' }
  ]
});
```

### Date/Time Inputs
```javascript
// Date
await prompt({ inputType: 'date' });

// Time
await prompt({ inputType: 'time' });

// DateTime
await prompt({ inputType: 'datetime' });

// Month
await prompt({ inputType: 'month' });

// Date range
await prompt({ inputType: 'daterange' });
```

### Special Inputs
```javascript
// Color picker
await prompt({ inputType: 'color' });

// File upload
await prompt({ inputType: 'file', accept: 'image/*' });

// Textarea
await prompt({ inputType: 'textarea', rows: 5 });

// Tags
await prompt({ inputType: 'tags' });

// OTP/PIN
await prompt({ inputType: 'otp', length: 6 });

// Signature
await prompt({ inputType: 'signature' });
```

---

## Form Modals

Create complex forms with multiple fields:

```javascript
import { form } from 'sweetalert-plus-plus';

// Using built-in presets
const loginData = await form({
  title: 'Sign In',
  form: 'login'  // Built-in preset
});

// Custom form schema
const userData = await form({
  title: 'User Registration',
  form: {
    fields: [
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        required: true,
        colSpan: 6
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        required: true,
        colSpan: 6
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        validation: {
          rules: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' }
          ]
        }
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password',
        required: true,
        showPasswordToggle: true
      },
      {
        name: 'role',
        type: 'select',
        label: 'Role',
        options: [
          { value: 'user', label: 'User' },
          { value: 'admin', label: 'Administrator' },
          { value: 'moderator', label: 'Moderator' }
        ]
      },
      {
        name: 'newsletter',
        type: 'switch',
        label: 'Subscribe to newsletter'
      }
    ],
    layout: {
      columns: 12,
      gap: 'md',
      labelPosition: 'top'
    }
  },
  submitText: 'Register',
  cancelText: 'Cancel'
});

if (userData) {
  console.log('Form submitted:', userData);
}
```

### Form Validation

```javascript
await form({
  title: 'Contact Us',
  form: {
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        required: true,
        validation: {
          rules: [
            { type: 'required', message: 'Name is required' },
            { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
          ],
          validateOnBlur: true
        }
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        required: true,
        validation: {
          rules: [
            { type: 'required' },
            { type: 'email' }
          ]
        }
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
        rows: 4,
        validation: {
          rules: [
            { type: 'required' },
            { type: 'minLength', value: 10 },
            { type: 'maxLength', value: 500 }
          ]
        }
      }
    ],
    validation: {
      validateOnSubmit: true,
      scrollToError: true
    }
  }
});
```

### Conditional Fields

```javascript
await form({
  title: 'Conditional Form',
  form: {
    fields: [
      {
        name: 'hasCompany',
        type: 'switch',
        label: 'Are you a business?'
      },
      {
        name: 'companyName',
        type: 'text',
        label: 'Company Name',
        showWhen: (formData) => formData.hasCompany === true
      }
    ]
  }
});
```

---

## Toast Notifications

Lightweight, non-blocking notifications:

```javascript
import { toast, toastSuccess, toastError } from 'sweetalert-plus-plus';

// Basic toast
toast({
  title: 'Hello!',
  text: 'This is a toast notification'
});

// Shorthand methods
toastSuccess('Saved successfully!');
toastError('Something went wrong');

// Positioned toasts
toast({
  title: 'Top Right',
  position: 'top-end',
  duration: 3000
});

// Toast with actions
toast({
  title: 'New message',
  text: 'You have a new message from John',
  actions: [
    { text: 'View', onClick: () => openMessage() },
    { text: 'Dismiss', onClick: () => {} }
  ]
});

// Promise toast
import { toastPromise } from 'sweetalert-plus-plus';

toastPromise(
  fetch('/api/save'),
  {
    loading: 'Saving...',
    success: 'Saved!',
    error: 'Failed to save'
  }
);
```

### Toast Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `ToastPosition` | `'top-end'` | Toast position |
| `duration` | `number` | `3000` | Auto-dismiss time (ms) |
| `progressBar` | `boolean` | `true` | Show progress bar |
| `pauseOnHover` | `boolean` | `true` | Pause timer on hover |
| `closeOnClick` | `boolean` | `true` | Close when clicked |
| `draggable` | `boolean` | `false` | Allow dragging to dismiss |
| `maxVisible` | `number` | `5` | Max visible toasts |
| `stackDirection` | `'up' \| 'down'` | `'up'` | Stack direction |

### Toast Positions

- `top-start` - Top left
- `top-center` - Top center
- `top-end` - Top right
- `bottom-start` - Bottom left
- `bottom-center` - Bottom center
- `bottom-end` - Bottom right

---

## Modal Queue

Display modals in sequence:

```javascript
import { queue, enqueue, enqueueAll } from 'sweetalert-plus-plus';

// Simple queue
const results = await queue([
  { title: 'Step 1', text: 'First modal' },
  { title: 'Step 2', text: 'Second modal' },
  { title: 'Step 3', text: 'Third modal' }
]);

// Add to existing queue
enqueue({ title: 'Added', text: 'This modal was added to the queue' });

// Add multiple
enqueueAll([
  { title: 'Modal 1' },
  { title: 'Modal 2' }
]);

// Queue with progress
const results = await queue([
  { title: 'Step 1/3', text: 'Enter your name', input: { type: 'text' } },
  { title: 'Step 2/3', text: 'Enter your email', input: { type: 'email' } },
  { title: 'Step 3/3', text: 'Choose a password', input: { type: 'password' } }
], {
  showProgress: true,
  allowSkip: true
});
```

### Queue Control

```javascript
import { pauseQueue, resumeQueue, clearQueue, skipCurrent, getQueueStatus } from 'sweetalert-plus-plus';

// Pause/resume
pauseQueue();
resumeQueue();

// Clear all
clearQueue();

// Skip current modal
skipCurrent();

// Get status
const status = getQueueStatus();
console.log(status); // { length: 3, currentIndex: 1, isPaused: false }
```

---

## Theming

### Theme Modes

```javascript
import { setTheme, getTheme, toggleTheme, initTheme } from 'sweetalert-plus-plus';

// Initialize theme (respects system preference)
initTheme();

// Set theme manually
setTheme('dark');
setTheme('light');
setTheme('system'); // Follow system preference

// Toggle between light and dark
toggleTheme();

// Get current theme
const theme = getTheme(); // 'light' | 'dark' | 'system'
```

### CSS Variables

```javascript
import { setVariable, setVariables, setPrimaryColor, setBorderRadius } from 'sweetalert-plus-plus';

// Set single variable
setVariable('--swal-primary', '#6366f1');

// Set multiple variables
setVariables({
  '--swal-primary': '#6366f1',
  '--swal-radius': '12px',
  '--swal-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
});

// Convenience methods
setPrimaryColor('#6366f1');
setBorderRadius('16px');
setAnimationSpeed(300);
```

### Theme Presets

```javascript
import { applyPreset, themePresets } from 'sweetalert-plus-plus';

// Available presets: default, midnight, ocean, forest, sunset, rose
applyPreset('midnight');
applyPreset('ocean');
applyPreset('forest');
applyPreset('sunset');
applyPreset('rose');

// List available presets
console.log(Object.keys(themePresets));
```

### Custom Theme Configuration

```javascript
import { applyConfig } from 'sweetalert-plus-plus';

applyConfig({
  mode: 'dark',
  primaryColor: '#8b5cf6',
  borderRadius: '16px',
  fontFamily: 'Inter, sans-serif',
  animationSpeed: 200,
  shadowIntensity: 'strong'
});
```

### Export Theme

```javascript
import { exportThemeCSS, exportThemeJS } from 'sweetalert-plus-plus';

// Export as CSS
const css = exportThemeCSS();
console.log(css);
// :root {
//   --swal-primary: #6366f1;
//   --swal-radius: 12px;
//   ...
// }

// Export as JavaScript object
const config = exportThemeJS();
console.log(config);
// { primaryColor: '#6366f1', borderRadius: '12px', ... }
```

---

## Plugin System

Extend SweetAlert++ with plugins:

### Using Plugins

```javascript
import { usePlugin, plugins } from 'sweetalert-plus-plus';

// Built-in plugins
await usePlugin(plugins.analytics);
await usePlugin(plugins.darkMode);
await usePlugin(plugins.keyboard);
await usePlugin(plugins.sound);
await usePlugin(plugins.confirmOnClose);
```

### Built-in Plugins

#### Analytics Plugin
Tracks modal usage statistics:
```javascript
await usePlugin(plugins.analytics);

// Access stats
const config = getConfig();
const stats = config.getAnalytics();
console.log(stats); // { openCount: 10, confirmCount: 7, dismissCount: 3 }
```

#### Dark Mode Plugin
Auto-applies theme based on system preference:
```javascript
await usePlugin(plugins.darkMode);
// Automatically sets data-swal-theme attribute on document
```

#### Keyboard Plugin
Adds keyboard shortcuts:
```javascript
await usePlugin(plugins.keyboard);
// Default: Ctrl+Enter confirms modal

// Add custom shortcuts
const config = getConfig();
config.addShortcut('Ctrl+S', () => {
  // Save action
});
```

#### Sound Plugin
Plays sounds on modal events:
```javascript
setConfig({
  sounds: {
    open: '/sounds/open.mp3',
    confirm: '/sounds/success.mp3',
    error: '/sounds/error.mp3'
  },
  soundVolume: 0.5
});
await usePlugin(plugins.sound);
```

#### Confirm on Close Plugin
Prompts before dismissing modals:
```javascript
setConfig({
  confirmOnClose: true,
  confirmOnCloseMessage: 'Are you sure you want to close?'
});
await usePlugin(plugins.confirmOnClose);
```

### Creating Custom Plugins

```javascript
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  install: (context) => {
    // Register a custom field type
    context.registerFieldType('stars', (field, value, onChange) => {
      const container = document.createElement('div');
      // ... render stars
      return container;
    });

    // Register a custom validator
    context.registerValidator('phone', (value, rule) => {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      return phoneRegex.test(value) || 'Invalid phone number';
    });

    // Register lifecycle hooks
    context.registerBeforeOpen((options) => {
      console.log('Modal opening:', options.title);
      return options; // Can modify options
    });

    context.registerAfterClose((result) => {
      console.log('Modal closed:', result);
    });

    // Register a custom preset
    context.registerPreset('custom-alert', {
      options: {
        icon: 'info',
        animation: 'slide-up',
        className: 'custom-alert'
      }
    });

    // Store configuration
    context.setConfig({
      myPluginEnabled: true
    });
  },

  uninstall: () => {
    console.log('Plugin uninstalled');
  }
};

await usePlugin(myPlugin);
```

---

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `modal(options)` | Display a modal with full options |
| `alert(options)` | Display an alert message |
| `confirm(options)` | Display a confirmation dialog |
| `prompt(options)` | Display an input prompt |
| `success(options)` | Display a success message |
| `error(options)` | Display an error message |
| `warning(options)` | Display a warning message |
| `info(options)` | Display an info message |
| `loading(options)` | Display a loading indicator |
| `form(options)` | Display a form modal |
| `image(options)` | Display an image modal |
| `wizard(options)` | Display a multi-step wizard |

### Toast Functions

| Function | Description |
|----------|-------------|
| `toast(options)` | Display a toast notification |
| `toastSuccess(message)` | Display a success toast |
| `toastError(message)` | Display an error toast |
| `toastWarning(message)` | Display a warning toast |
| `toastInfo(message)` | Display an info toast |
| `toastLoading(message)` | Display a loading toast |
| `toastPromise(promise, messages)` | Display toasts for promise states |
| `dismissToast(id)` | Dismiss a specific toast |
| `dismissAllToasts()` | Dismiss all toasts |

### Queue Functions

| Function | Description |
|----------|-------------|
| `queue(modals, config)` | Display modals in sequence |
| `enqueue(options)` | Add a modal to the queue |
| `enqueueAll(modals)` | Add multiple modals to the queue |
| `clearQueue()` | Clear all queued modals |
| `pauseQueue()` | Pause the queue |
| `resumeQueue()` | Resume the queue |
| `skipCurrent()` | Skip the current modal |
| `getQueueStatus()` | Get queue status |

### Theme Functions

| Function | Description |
|----------|-------------|
| `initTheme()` | Initialize theme system |
| `setTheme(mode)` | Set theme mode |
| `getTheme()` | Get current theme mode |
| `toggleTheme()` | Toggle between light/dark |
| `setVariable(name, value)` | Set a CSS variable |
| `setVariables(vars)` | Set multiple CSS variables |
| `setPrimaryColor(color)` | Set primary color |
| `setBorderRadius(radius)` | Set border radius |
| `setAnimationSpeed(ms)` | Set animation duration |
| `applyPreset(name)` | Apply a theme preset |
| `applyConfig(config)` | Apply full theme config |
| `exportThemeCSS()` | Export theme as CSS |
| `exportThemeJS()` | Export theme as JS object |

### Modal Instance Methods

When you call `modal()`, you get a promise that resolves with a `ModalResult`. For `loading()`, you get immediate access to the modal instance:

```javascript
const instance = await modal({ ... });

// Instance methods
instance.close(result);           // Close the modal
instance.update(options);         // Update modal options
instance.getInputValue();         // Get current input value
instance.setInputValue(value);    // Set input value
instance.getFormData();           // Get all form data
instance.setFormData(data);       // Set form data
instance.validateForm();          // Validate all form fields
instance.showValidationError(msg); // Show validation error
instance.clearValidationError();   // Clear validation errors
instance.setButtonState(btn, state); // Update button state
instance.showLoading(text);       // Show loading state
instance.hideLoading();           // Hide loading state

// Timer controls
instance.timer.pause();
instance.timer.resume();
instance.timer.reset();
instance.timer.getRemaining();
```

### Modal Result

```typescript
interface ModalResult<T = any> {
  confirmed: boolean;      // User clicked confirm button
  denied: boolean;         // User clicked deny button
  dismissed: boolean;      // User dismissed modal
  dismissReason?: string;  // 'backdrop' | 'escape' | 'close' | 'timer' | 'cancel'
  value?: T;              // Input/form value
  errors?: Record<string, string>;  // Validation errors
}
```

---

## TypeScript Support

SweetAlert++ is written in TypeScript and provides full type definitions:

```typescript
import {
  // Core types
  ModalOptions,
  ModalResult,
  ModalInstance,

  // Option types
  ButtonConfig,
  InputConfig,
  AnimationConfig,
  A11yConfig,

  // Form types
  FormSchema,
  FormField,
  FieldType,
  ValidationRule,

  // Toast types
  ToastOptions,
  ToastPosition,

  // Queue types
  QueueConfig,

  // Theme types
  ThemeMode,
  ThemeConfig,
  ThemePreset,

  // Plugin types
  Plugin,
  PluginContext
} from 'sweetalert-plus-plus';

// Type-safe usage
const result = await modal<{ name: string; email: string }>({
  title: 'User Info',
  form: {
    fields: [
      { name: 'name', type: 'text' },
      { name: 'email', type: 'email' }
    ]
  }
});

if (result.confirmed && result.value) {
  console.log(result.value.name);  // TypeScript knows this is string
  console.log(result.value.email); // TypeScript knows this is string
}
```

---

## Accessibility

SweetAlert++ is built with accessibility in mind:

- **ARIA attributes**: Proper roles, labels, and descriptions
- **Focus management**: Focus trapping and return focus
- **Keyboard navigation**: Full keyboard support
- **Screen reader support**: Live regions and announcements
- **Reduced motion**: Respects `prefers-reduced-motion`

```javascript
await modal({
  title: 'Accessible Modal',
  a11y: {
    role: 'alertdialog',
    ariaLabel: 'Important notification',
    ariaDescribedBy: 'modal-description',
    announceOnOpen: 'Important notification opened',
    liveRegion: true,
    autoFocus: 'confirm',
    returnFocus: true,
    closeOnEscape: true,
    trapFocus: true
  }
});
```

---

## Enterprise Features

SweetAlert++ includes premium enterprise-grade styling options for creating stunning, professional UI components.

### Morphism Style Variants

Apply different visual styles to your modals:

```javascript
// Glassmorphism - Frosted glass effect
await modal({
  title: 'Glassmorphism',
  text: 'Beautiful frosted glass effect',
  className: 'swal-modal-glassmorphism'
});

// Neumorphism - Soft UI with subtle shadows
await modal({
  title: 'Neumorphism',
  text: 'Soft, tactile interface design',
  className: 'swal-modal-neumorphism'
});

// Claymorphism - 3D clay-like appearance
await modal({
  title: 'Claymorphism',
  text: 'Modern 3D clay aesthetic',
  className: 'swal-modal-claymorphism'
});

// Aurora - Gradient mesh background
await modal({
  title: 'Aurora',
  text: 'Stunning gradient mesh effect',
  className: 'swal-modal-aurora'
});
```

### CSS Classes for Morphism Styles

| Class | Description |
|-------|-------------|
| `swal-modal-glassmorphism` | Frosted glass with blur backdrop |
| `swal-modal-neumorphism` | Soft UI with inset/outset shadows |
| `swal-modal-claymorphism` | 3D clay-like raised appearance |
| `swal-modal-aurora` | Animated gradient mesh background |

### Animation Classes

Apply entrance animations to modals:

```javascript
await modal({
  title: 'Animated Modal',
  className: 'animate-bounce-in'
});
```

| Class | Description |
|-------|-------------|
| `animate-bounce-in` | Bouncy entrance effect |
| `animate-elastic` | Elastic spring animation |
| `animate-flip-in` | 3D flip entrance |
| `animate-zoom-in` | Scale from small to full |
| `animate-slide-up` | Slide from bottom |
| `animate-slide-down` | Slide from top |
| `animate-fade-in` | Simple fade entrance |

### Icon Animations

Icons automatically animate based on type:

| Icon Type | Animation |
|-----------|-----------|
| `success` | Pop in with checkmark draw |
| `error` | Shake with X mark |
| `warning` | Bounce with pulse |
| `info` | Float up entrance |
| `question` | Wobble effect |

### Premium Form Styling

Forms automatically receive premium styling with:

- Gradient focus rings
- Smooth transitions
- Floating labels (optional)
- Validation state indicators
- Premium select dropdowns
- Toggle switches with animations

```javascript
await form({
  title: 'Premium Form',
  className: 'swal-modal-glassmorphism',
  form: {
    fields: [
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'password', type: 'password', label: 'Password', required: true },
      { name: 'remember', type: 'switch', label: 'Remember me' }
    ]
  }
});
```

### Toast with Progress Bar

```javascript
toast({
  title: 'Processing...',
  icon: 'info',
  progressBar: true,
  duration: 5000
});
```

### Confetti Effect

Trigger confetti celebration:

```javascript
import { triggerConfetti } from 'sweetalert-plus-plus';

await success({
  title: 'Congratulations!',
  text: 'You completed all tasks!'
});
triggerConfetti();
```

### Design Tokens

Enterprise CSS variables for customization:

```css
:root {
  /* Primary Colors */
  --primary-50: #eef2ff;
  --primary-500: #6366f1;
  --primary-600: #4f46e5;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

---

## Enterprise Demo

See the full enterprise demo at `examples/enterprise-demo.html` which showcases:

- All morphism style variants
- Working animations
- Premium form designs
- Toast notifications with progress
- Copyable code snippets
- Dark/light theme toggle
- Confetti effects

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 (with polyfills)

---

## License

MIT License - see LICENSE file for details.
