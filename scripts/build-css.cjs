/**
 * CSS Build Script
 * Concatenates and minifies all CSS files for distribution
 */

const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/styles/variables.css',
  'src/styles/modal.css',
  'src/styles/form.css',
];

const outputDir = 'dist';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read and concatenate all CSS files
let combinedCSS = `/*!
 * SweetAlert++ v1.0.0
 * Enterprise-grade modal and alert library
 * https://sweetalert-plus-plus.dev
 *
 * Copyright (c) ${new Date().getFullYear()}
 * Released under the MIT License
 */

`;

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    combinedCSS += `/* ============================================================================\n`;
    combinedCSS += `   ${path.basename(file)}\n`;
    combinedCSS += `   ============================================================================ */\n\n`;
    combinedCSS += content + '\n\n';
  } else {
    console.warn(`Warning: CSS file not found: ${file}`);
  }
});

// Write full CSS
fs.writeFileSync(path.join(outputDir, 'sweetalert-plus-plus.css'), combinedCSS);
console.log('✓ Generated sweetalert-plus-plus.css');

// Simple minification (remove comments and extra whitespace)
let minifiedCSS = combinedCSS
  // Keep banner comment
  .replace(/\/\*![\s\S]*?\*\//, match => match + '\n')
  // Remove other comments
  .replace(/\/\*(?!\!)[\s\S]*?\*\//g, '')
  // Remove extra whitespace
  .replace(/\s+/g, ' ')
  // Remove spaces around special chars
  .replace(/\s*([{};:,>+~])\s*/g, '$1')
  // Remove trailing semicolons before }
  .replace(/;}/g, '}')
  // Trim
  .trim();

fs.writeFileSync(path.join(outputDir, 'sweetalert-plus-plus.min.css'), minifiedCSS);
console.log('✓ Generated sweetalert-plus-plus.min.css');

// Generate dark-only theme file
const darkOnlyCSS = `/*!
 * SweetAlert++ Dark Theme v1.0.0
 * https://sweetalert-plus-plus.dev
 */

[data-theme="dark"],
.swal-dark {
  --swal-bg: #0f0f23;
  --swal-bg-secondary: #1a1a2e;
  --swal-bg-tertiary: #252542;
  --swal-bg-elevated: #1e1e38;
  --swal-bg-overlay: rgba(0, 0, 0, 0.8);
  --swal-bg-glass: rgba(30, 30, 56, 0.85);
  --swal-text: #f1f5f9;
  --swal-text-secondary: #94a3b8;
  --swal-text-tertiary: #64748b;
  --swal-text-inverse: #0f0f23;
  --swal-border: rgba(255, 255, 255, 0.1);
  --swal-border-light: rgba(255, 255, 255, 0.05);
  --swal-success-light: rgba(16, 185, 129, 0.15);
  --swal-error-light: rgba(239, 68, 68, 0.15);
  --swal-warning-light: rgba(245, 158, 11, 0.15);
  --swal-info-light: rgba(59, 130, 246, 0.15);
  --swal-shadow-lg: 0 8px 10px rgba(0, 0, 0, 0.2), 0 16px 24px rgba(0, 0, 0, 0.2), 0 24px 48px rgba(0, 0, 0, 0.15), 0 32px 64px rgba(0, 0, 0, 0.1);
  --swal-backdrop-color: rgba(0, 0, 0, 0.75);
}
`;

fs.writeFileSync(path.join(outputDir, 'sweetalert-plus-plus.dark.css'), darkOnlyCSS);
console.log('✓ Generated sweetalert-plus-plus.dark.css');

// Generate minimal CSS (just core modal styles, no form fields)
const minimalCSS = `/*!
 * SweetAlert++ Minimal v1.0.0
 * Core modal styles only
 * https://sweetalert-plus-plus.dev
 */

.swal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.swal-dialog {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.swal-title {
  margin: 0 0 0.5rem;
  font-size: 1.375rem;
  font-weight: 700;
  color: #18181b;
}

.swal-content {
  color: #71717a;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.swal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.swal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.swal-btn-confirm {
  background: #6366f1;
  color: white;
}

.swal-btn-cancel {
  background: #f4f4f5;
  color: #18181b;
}

@media (prefers-color-scheme: dark) {
  .swal-dialog {
    background: #1e1e38;
  }
  .swal-title {
    color: #f1f5f9;
  }
  .swal-content {
    color: #94a3b8;
  }
  .swal-btn-cancel {
    background: #252542;
    color: #f1f5f9;
  }
}
`;

fs.writeFileSync(path.join(outputDir, 'sweetalert-plus-plus.minimal.css'), minimalCSS);
console.log('✓ Generated sweetalert-plus-plus.minimal.css');

console.log('\n✅ CSS build complete!');
