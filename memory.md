# SweetAlert++ Project Memory

## Project Overview
- **Name**: sweetalert-plus-plus
- **Version**: 1.0.0
- **Description**: Enterprise-grade, accessible, customizable modal and alert library with 30+ form field types, theme system, and advanced visual effects
- **License**: MIT
- **Homepage**: https://sweetalert-plus-plus.dev

## Project Structure

```
C:\Work\PythonProjects\SweetAlert++\
├── dist/                          # Build output directory
├── src/                           # Source code
│   └── styles/                    # CSS source files
│       ├── variables.css
│       ├── modal.css
│       └── form.css
├── scripts/
│   └── build-css.cjs              # CSS build script (CommonJS)
├── examples/
│   └── demo.html                  # Demo/documentation page
├── package.json                   # NPM configuration
├── rollup.config.js               # Rollup bundler config
├── tsconfig.json                  # TypeScript config
└── ins.txt                        # Build & CDN instructions
```

## Build System

### Package Configuration
- **Module Type**: ES Module (`"type": "module"` in package.json)
- **Bundler**: Rollup with TypeScript plugin
- **CSS Build**: Custom Node.js script (CommonJS - uses .cjs extension)

### NPM Scripts
| Command | Description |
|---------|-------------|
| `npm run build` | Full build (JS + CSS) |
| `npm run build:js` | JavaScript only (Rollup) |
| `npm run build:css` | CSS only (PostCSS) |
| `npm run build:types` | TypeScript declarations |
| `npm run build:cdn` | CDN-optimized build with minification |
| `npm run dev` | Watch mode for development |
| `npm run serve` | Local development server |
| `npm run test` | Run tests (Vitest) |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript validation |

### Build Output (dist/)
```
dist/
├── sweetalert-plus-plus.min.js     # CDN primary (minified UMD) ~96KB
├── sweetalert-plus-plus.umd.js     # UMD build ~253KB
├── sweetalert-plus-plus.esm.js     # ES modules ~226KB
├── sweetalert-plus-plus.cjs.js     # CommonJS ~228KB
├── sweetalert-plus-plus.iife.js    # IIFE (self-contained) ~95KB
├── sweetalert-plus-plus.css        # Main styles ~97KB
├── sweetalert-plus-plus.min.css    # Minified CSS ~68KB
├── sweetalert-plus-plus.minimal.css
├── sweetalert-plus-plus.dark.css
├── core.esm.js / core.cjs.js       # Core-only bundle
├── toast.esm.js / toast.cjs.js     # Toast-only bundle
├── theme.esm.js / theme.cjs.js     # Theme-only bundle
└── *.d.ts                          # TypeScript definitions
```

## Dependencies

### Dev Dependencies
- `@rollup/plugin-commonjs`: ^25.0.0
- `@rollup/plugin-node-resolve`: ^15.2.0
- `@rollup/plugin-terser`: ^0.4.0
- `@rollup/plugin-typescript`: ^11.1.0
- `autoprefixer`: ^10.4.0
- `cssnano`: ^6.0.0
- `postcss`: ^8.4.0
- `rollup`: ^4.0.0
- `terser`: ^5.24.0
- `tslib`: ^2.8.1
- `typescript`: ^5.0.0
- `vitest`: ^4.0.15

### Runtime Dependencies
- `@rollup/rollup-win32-x64-msvc`: ^4.53.3 (Windows native module)

## Known Issues & Fixes

### Build Issues (Resolved)

1. **Missing `@rollup/rollup-win32-x64-msvc`**
   - Cause: npm optional dependency bug after `npm audit fix --force`
   - Fix: `npm install @rollup/rollup-win32-x64-msvc`

2. **"Cannot use import statement outside a module"**
   - Cause: rollup.config.js uses ES imports but package wasn't configured
   - Fix: Added `"type": "module"` to package.json

3. **Missing `tslib`**
   - Cause: TypeScript plugin requires tslib helpers
   - Fix: `npm install tslib --save-dev`

4. **"require is not defined in ES module scope"**
   - Cause: build-css.js uses CommonJS but package is ES module
   - Fix: Renamed to `scripts/build-css.cjs` and updated package.json

5. **TypeScript type generation failures**
   - Cause: Many type errors in source (missing react/vue types)
   - Status: Removed from main build; JS/CSS builds work fine

## CDN Distribution

### Option 1: NPM (Recommended)
```bash
npm login
npm publish
```

Auto-available on:
```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@1.0.0/dist/sweetalert-plus-plus.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@1.0.0/dist/sweetalert-plus-plus.css">

<!-- unpkg -->
<script src="https://unpkg.com/sweetalert-plus-plus@1.0.0/dist/sweetalert-plus-plus.min.js"></script>
```

### Option 2: GitHub Releases
```bash
git tag v1.0.0
git push origin v1.0.0
```

Then via jsDelivr:
```html
<script src="https://cdn.jsdelivr.net/gh/USERNAME/sweetalert-plus-plus@1.0.0/dist/sweetalert-plus-plus.min.js"></script>
```

## Usage Example

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="sweetalert-plus-plus.css">
</head>
<body>
  <script src="sweetalert-plus-plus.min.js"></script>
  <script>
    Swal.modal({
      icon: 'success',
      title: 'Hello!',
      text: 'SweetAlert++ is working!',
      buttons: { confirm: 'Great!' }
    });
  </script>
</body>
</html>
```

## Features
- 30+ form field types
- Theme system (dark mode, neumorphism, glassmorphism)
- Accessible (a11y compliant)
- Toast notifications
- Visual builder in demo
- Copyable code snippets
- Multiple bundle formats (ESM, CJS, UMD, IIFE)
- Tree-shakeable core module

## Demo Page
Located at `examples/demo.html` - includes:
- Visual alert builder
- Live preview
- Copyable code generation
- Theme switching
- All field type demonstrations

## Quick Commands

```bash
# Install dependencies
npm install

# Build everything
npm run build

# Build for CDN (with minification)
npm run build:cdn

# Development mode (watch)
npm run dev

# Start local server
npm run serve

# Run tests
npm run test
```

## Project Export Settings
```json
{
  "main": "dist/sweetalert-plus-plus.cjs.js",
  "module": "dist/sweetalert-plus-plus.esm.js",
  "browser": "dist/sweetalert-plus-plus.umd.js",
  "unpkg": "dist/sweetalert-plus-plus.min.js",
  "jsdelivr": "dist/sweetalert-plus-plus.min.js",
  "types": "dist/index.d.ts"
}
```

## Size Limits
- Core ESM: 5 KB limit
- Full ESM: 15 KB limit
- Minified: 20 KB limit

---
*Last Updated: December 2024*
