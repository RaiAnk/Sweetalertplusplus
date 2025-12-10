#!/usr/bin/env node

/**
 * SweetAlert++ Comprehensive Build Script
 *
 * Creates distribution files for:
 * - CDN usage (unpkg, jsdelivr, cdnjs)
 * - NPM package distribution
 * - Direct browser script tag usage
 * - ES Modules for modern bundlers
 * - CommonJS for Node.js
 *
 * Usage:
 *   node scripts/build.js [--watch] [--minify-only] [--css-only] [--js-only]
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  version: '1.0.0',
  name: 'SweetAlert++',
  outputDir: 'dist',
  srcDir: 'src',

  // CSS files to bundle
  cssFiles: [
    'src/styles/variables.css',
    'src/styles/modal.css',
    'src/styles/form.css',
    'src/styles/animations.css',
    'src/styles/enterprise.css'
  ],

  // Entry points for different builds
  entries: {
    main: 'src/index.ts',
    core: 'src/core/modal.ts',
    toast: 'src/toast/toast.ts',
    theme: 'src/core/theme.ts',
    form: 'src/form/index.ts',
    react: 'src/adapters/react.tsx',
    vue: 'src/adapters/vue.ts'
  },

  // CDN URLs for documentation
  cdnUrls: {
    unpkg: 'https://unpkg.com/sweetalert-plus-plus@{version}/dist/',
    jsdelivr: 'https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@{version}/dist/',
    cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert-plus-plus/{version}/'
  }
};

// Banner for all output files
const BANNER = `/*!
 * ${CONFIG.name} v${CONFIG.version}
 * Enterprise-grade, accessible modal and alert library
 * https://sweetalert-plus-plus.dev
 *
 * Copyright (c) ${new Date().getFullYear()}
 * Released under the MIT License
 */`;

// =============================================================================
// UTILITIES
// =============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return stats.size;
  } catch {
    return 0;
  }
}

// =============================================================================
// CSS BUILD
// =============================================================================

function minifyCSS(css) {
  return css
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
    // Remove spaces in selectors
    .replace(/\s*([>+~])\s*/g, '$1')
    // Optimize zeros
    .replace(/(:|\s)0px/g, '$10')
    .replace(/(:|\s)0\.(\d+)/g, '$1.$2')
    // Remove units from zero
    .replace(/(:|\s)0(rem|em|%)/g, '$10')
    .trim();
}

function buildCSS() {
  logStep('CSS', 'Building CSS bundles...');

  ensureDir(CONFIG.outputDir);

  // Combine all CSS files
  let combinedCSS = BANNER + '\n\n';
  let existingFiles = [];

  CONFIG.cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      existingFiles.push(file);
      const content = fs.readFileSync(file, 'utf-8');
      combinedCSS += `/* ============================================================================
   ${path.basename(file)}
   ============================================================================ */\n\n`;
      combinedCSS += content + '\n\n';
    }
  });

  if (existingFiles.length === 0) {
    // Create default CSS if no files exist
    combinedCSS += getDefaultCSS();
  }

  // Full CSS
  const fullCSSPath = path.join(CONFIG.outputDir, 'sweetalert-plus-plus.css');
  fs.writeFileSync(fullCSSPath, combinedCSS);
  logSuccess(`Generated sweetalert-plus-plus.css (${formatBytes(getFileSize(fullCSSPath))})`);

  // Minified CSS
  const minifiedCSS = minifyCSS(combinedCSS);
  const minCSSPath = path.join(CONFIG.outputDir, 'sweetalert-plus-plus.min.css');
  fs.writeFileSync(minCSSPath, minifiedCSS);
  logSuccess(`Generated sweetalert-plus-plus.min.css (${formatBytes(getFileSize(minCSSPath))})`);

  // Dark theme only
  const darkCSS = generateDarkThemeCSS();
  const darkCSSPath = path.join(CONFIG.outputDir, 'sweetalert-plus-plus.dark.css');
  fs.writeFileSync(darkCSSPath, darkCSS);
  logSuccess(`Generated sweetalert-plus-plus.dark.css (${formatBytes(getFileSize(darkCSSPath))})`);

  // Light theme only
  const lightCSS = generateLightThemeCSS();
  const lightCSSPath = path.join(CONFIG.outputDir, 'sweetalert-plus-plus.light.css');
  fs.writeFileSync(lightCSSPath, lightCSS);
  logSuccess(`Generated sweetalert-plus-plus.light.css (${formatBytes(getFileSize(lightCSSPath))})`);

  // Minimal CSS (core modal only)
  const minimalCSS = generateMinimalCSS();
  const minimalCSSPath = path.join(CONFIG.outputDir, 'sweetalert-plus-plus.minimal.css');
  fs.writeFileSync(minimalCSSPath, minimalCSS);
  logSuccess(`Generated sweetalert-plus-plus.minimal.css (${formatBytes(getFileSize(minimalCSSPath))})`);

  // Toast only CSS
  const toastCSS = generateToastCSS();
  const toastCSSPath = path.join(CONFIG.outputDir, 'sweetalert-plus-plus.toast.css');
  fs.writeFileSync(toastCSSPath, toastCSS);
  logSuccess(`Generated sweetalert-plus-plus.toast.css (${formatBytes(getFileSize(toastCSSPath))})`);

  // Form only CSS
  const formCSS = generateFormCSS();
  const formCSSPath = path.join(CONFIG.outputDir, 'sweetalert-plus-plus.form.css');
  fs.writeFileSync(formCSSPath, formCSS);
  logSuccess(`Generated sweetalert-plus-plus.form.css (${formatBytes(getFileSize(formCSSPath))})`);
}

function getDefaultCSS() {
  return `
/* =============================================================================
   DESIGN TOKENS
   ============================================================================= */

:root {
  /* Primary Colors */
  --swal-primary: #6366f1;
  --swal-primary-dark: #4f46e5;
  --swal-primary-light: #818cf8;

  /* Semantic Colors */
  --swal-success: #10b981;
  --swal-success-light: rgba(16, 185, 129, 0.15);
  --swal-error: #ef4444;
  --swal-error-light: rgba(239, 68, 68, 0.15);
  --swal-warning: #f59e0b;
  --swal-warning-light: rgba(245, 158, 11, 0.15);
  --swal-info: #3b82f6;
  --swal-info-light: rgba(59, 130, 246, 0.15);

  /* Light Mode (default) */
  --swal-bg: #ffffff;
  --swal-bg-secondary: #f8fafc;
  --swal-bg-tertiary: #f1f5f9;
  --swal-bg-elevated: #ffffff;
  --swal-bg-overlay: rgba(0, 0, 0, 0.5);
  --swal-bg-glass: rgba(255, 255, 255, 0.85);

  --swal-text: #0f172a;
  --swal-text-secondary: #475569;
  --swal-text-tertiary: #94a3b8;
  --swal-text-inverse: #ffffff;

  --swal-border: rgba(0, 0, 0, 0.1);
  --swal-border-light: rgba(0, 0, 0, 0.05);

  /* Shadows */
  --swal-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --swal-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --swal-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --swal-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --swal-radius-sm: 6px;
  --swal-radius-md: 10px;
  --swal-radius-lg: 16px;
  --swal-radius-xl: 24px;
  --swal-radius-full: 9999px;

  /* Animation */
  --swal-transition-fast: 150ms;
  --swal-transition-normal: 250ms;
  --swal-transition-slow: 400ms;
  --swal-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --swal-ease-smooth: cubic-bezier(0.23, 1, 0.32, 1);

  /* Z-Index */
  --swal-z-backdrop: 10000;
  --swal-z-modal: 10001;
  --swal-z-toast: 10002;
}

/* Dark Mode */
[data-theme="dark"],
.swal-dark {
  --swal-bg: #0f0f23;
  --swal-bg-secondary: #1a1a2e;
  --swal-bg-tertiary: #252542;
  --swal-bg-elevated: #1e1e38;
  --swal-bg-overlay: rgba(0, 0, 0, 0.75);
  --swal-bg-glass: rgba(30, 30, 56, 0.85);

  --swal-text: #f1f5f9;
  --swal-text-secondary: #94a3b8;
  --swal-text-tertiary: #64748b;
  --swal-text-inverse: #0f0f23;

  --swal-border: rgba(255, 255, 255, 0.1);
  --swal-border-light: rgba(255, 255, 255, 0.05);

  --swal-shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.3), 0 6px 10px rgba(0, 0, 0, 0.2);
  --swal-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --swal-bg: #0f0f23;
    --swal-bg-secondary: #1a1a2e;
    --swal-bg-tertiary: #252542;
    --swal-bg-elevated: #1e1e38;
    --swal-bg-overlay: rgba(0, 0, 0, 0.75);
    --swal-bg-glass: rgba(30, 30, 56, 0.85);
    --swal-text: #f1f5f9;
    --swal-text-secondary: #94a3b8;
    --swal-text-tertiary: #64748b;
    --swal-text-inverse: #0f0f23;
    --swal-border: rgba(255, 255, 255, 0.1);
    --swal-border-light: rgba(255, 255, 255, 0.05);
  }
}

/* =============================================================================
   BACKDROP
   ============================================================================= */

.swal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--swal-bg-overlay);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: var(--swal-z-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: swal-fade-in var(--swal-transition-normal) ease forwards;
}

.swal-backdrop--exiting {
  animation: swal-fade-out var(--swal-transition-fast) ease forwards;
}

/* =============================================================================
   DIALOG
   ============================================================================= */

.swal-dialog {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--swal-bg-elevated);
  border: 1px solid var(--swal-border);
  border-radius: var(--swal-radius-lg);
  padding: 2rem;
  box-shadow: var(--swal-shadow-xl);
  text-align: center;
  animation: swal-scale-in var(--swal-transition-normal) var(--swal-ease-spring) forwards;
  z-index: var(--swal-z-modal);
}

.swal-dialog--exiting {
  animation: swal-scale-out var(--swal-transition-fast) ease forwards;
}

/* Sizes */
.swal-dialog--sm { max-width: 320px; }
.swal-dialog--md { max-width: 420px; }
.swal-dialog--lg { max-width: 560px; }
.swal-dialog--xl { max-width: 720px; }
.swal-dialog--full { max-width: 95vw; max-height: 90vh; overflow: auto; }

/* Positions */
.swal-backdrop--top { align-items: flex-start; padding-top: 5vh; }
.swal-backdrop--bottom { align-items: flex-end; padding-bottom: 5vh; }
.swal-backdrop--top-start { align-items: flex-start; justify-content: flex-start; }
.swal-backdrop--top-end { align-items: flex-start; justify-content: flex-end; }
.swal-backdrop--bottom-start { align-items: flex-end; justify-content: flex-start; }
.swal-backdrop--bottom-end { align-items: flex-end; justify-content: flex-end; }

/* =============================================================================
   HEADER
   ============================================================================= */

.swal-header {
  margin-bottom: 1rem;
}

.swal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--swal-bg-secondary);
  border: 1px solid var(--swal-border);
  border-radius: var(--swal-radius-full);
  color: var(--swal-text-tertiary);
  cursor: pointer;
  transition: all var(--swal-transition-fast) ease;
}

.swal-close:hover {
  background: var(--swal-error);
  border-color: var(--swal-error);
  color: white;
  transform: rotate(90deg);
}

.swal-close svg {
  width: 16px;
  height: 16px;
}

/* =============================================================================
   ICONS
   ============================================================================= */

.swal-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--swal-radius-full);
}

.swal-icon svg {
  width: 36px;
  height: 36px;
}

.swal-icon--success {
  background: var(--swal-success-light);
  color: var(--swal-success);
}

.swal-icon--error {
  background: var(--swal-error-light);
  color: var(--swal-error);
}

.swal-icon--warning {
  background: var(--swal-warning-light);
  color: var(--swal-warning);
}

.swal-icon--info {
  background: var(--swal-info-light);
  color: var(--swal-info);
}

.swal-icon--question {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.swal-icon--loading {
  background: rgba(99, 102, 241, 0.15);
  color: var(--swal-primary);
}

.swal-icon--loading svg {
  animation: swal-spin 1s linear infinite;
}

/* Icon Animations */
.swal-icon--success .icon-circle {
  stroke-dasharray: 63;
  stroke-dashoffset: 63;
  animation: swal-draw-circle 0.6s ease forwards;
}

.swal-icon--success .icon-check {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: swal-draw-check 0.4s ease 0.4s forwards;
}

/* =============================================================================
   CONTENT
   ============================================================================= */

.swal-title {
  margin: 0 0 0.5rem;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--swal-text);
  line-height: 1.3;
}

.swal-body {
  margin-bottom: 1.5rem;
}

.swal-content {
  color: var(--swal-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.swal-content a {
  color: var(--swal-primary);
  text-decoration: none;
}

.swal-content a:hover {
  text-decoration: underline;
}

.swal-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--swal-border-light);
  font-size: 0.85rem;
  color: var(--swal-text-tertiary);
}

/* =============================================================================
   INPUTS
   ============================================================================= */

.swal-input-wrapper {
  margin-top: 1.25rem;
  text-align: left;
}

.swal-input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--swal-text);
  margin-bottom: 0.5rem;
}

.swal-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--swal-bg-secondary);
  border: 2px solid var(--swal-border);
  border-radius: var(--swal-radius-md);
  font-size: 1rem;
  color: var(--swal-text);
  outline: none;
  transition: border-color var(--swal-transition-fast) ease, box-shadow var(--swal-transition-fast) ease;
  font-family: inherit;
}

.swal-input::placeholder {
  color: var(--swal-text-tertiary);
}

.swal-input:focus {
  border-color: var(--swal-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.swal-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Textarea */
textarea.swal-input {
  min-height: 100px;
  resize: vertical;
}

/* Select */
select.swal-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

/* Range */
input[type="range"].swal-input {
  -webkit-appearance: none;
  height: 8px;
  padding: 0;
  border: none;
  background: var(--swal-border);
  border-radius: 4px;
}

input[type="range"].swal-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: var(--swal-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
}

/* Color */
input[type="color"].swal-input {
  height: 48px;
  padding: 4px;
  cursor: pointer;
}

/* =============================================================================
   BUTTONS
   ============================================================================= */

.swal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.swal-btn {
  flex: 1;
  min-width: 100px;
  max-width: 180px;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--swal-radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--swal-transition-fast) var(--swal-ease-spring);
  font-family: inherit;
}

.swal-btn:hover {
  transform: translateY(-2px);
}

.swal-btn:active {
  transform: translateY(0);
}

.swal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.swal-btn-confirm {
  background: linear-gradient(135deg, var(--swal-primary) 0%, var(--swal-primary-dark) 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.swal-btn-confirm:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.swal-btn-cancel {
  background: var(--swal-bg-secondary);
  border: 1px solid var(--swal-border);
  color: var(--swal-text);
}

.swal-btn-cancel:hover {
  background: var(--swal-bg-tertiary);
}

.swal-btn-deny {
  background: var(--swal-error-light);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--swal-error);
}

.swal-btn-deny:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* =============================================================================
   TIMER PROGRESS
   ============================================================================= */

.swal-timer-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--swal-primary);
  border-radius: 0 0 var(--swal-radius-lg) var(--swal-radius-lg);
  transform-origin: left;
}

/* =============================================================================
   ANIMATIONS
   ============================================================================= */

@keyframes swal-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes swal-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes swal-scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes swal-scale-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}

@keyframes swal-slide-up-in {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes swal-slide-up-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(30px); }
}

@keyframes swal-slide-down-in {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes swal-slide-down-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-30px); }
}

@keyframes swal-bounce-in {
  0% { opacity: 0; transform: scale(0.3); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes swal-bounce-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.3); }
}

@keyframes swal-flip-in {
  from { opacity: 0; transform: perspective(400px) rotateX(-90deg); }
  to { opacity: 1; transform: perspective(400px) rotateX(0); }
}

@keyframes swal-flip-out {
  from { opacity: 1; transform: perspective(400px) rotateX(0); }
  to { opacity: 0; transform: perspective(400px) rotateX(90deg); }
}

@keyframes swal-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes swal-draw-circle {
  to { stroke-dashoffset: 0; }
}

@keyframes swal-draw-check {
  to { stroke-dashoffset: 0; }
}

@keyframes swal-timer {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* =============================================================================
   STYLE VARIANTS
   ============================================================================= */

/* Glassmorphism */
.swal-dialog--glassmorphism {
  background: var(--swal-bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Neumorphism */
.swal-dialog--neumorphism {
  border: none;
  box-shadow:
    -8px -8px 20px rgba(255, 255, 255, 0.05),
    8px 8px 20px rgba(0, 0, 0, 0.3);
}

/* Claymorphism */
.swal-dialog--claymorphism {
  border: none;
  border-radius: var(--swal-radius-xl);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.25),
    inset 0 -10px 30px rgba(0, 0, 0, 0.1),
    inset 0 10px 30px rgba(255, 255, 255, 0.05);
}

/* =============================================================================
   REDUCED MOTION
   ============================================================================= */

@media (prefers-reduced-motion: reduce) {
  .swal-backdrop,
  .swal-dialog,
  .swal-icon svg,
  .swal-btn {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;
}

function generateDarkThemeCSS() {
  return `${BANNER}

/* SweetAlert++ Dark Theme */

[data-theme="dark"],
.swal-dark {
  --swal-bg: #0f0f23;
  --swal-bg-secondary: #1a1a2e;
  --swal-bg-tertiary: #252542;
  --swal-bg-elevated: #1e1e38;
  --swal-bg-overlay: rgba(0, 0, 0, 0.8);
  --swal-bg-glass: rgba(30, 30, 56, 0.9);

  --swal-text: #f1f5f9;
  --swal-text-secondary: #94a3b8;
  --swal-text-tertiary: #64748b;
  --swal-text-inverse: #0f0f23;

  --swal-border: rgba(255, 255, 255, 0.1);
  --swal-border-light: rgba(255, 255, 255, 0.05);

  --swal-success-light: rgba(16, 185, 129, 0.2);
  --swal-error-light: rgba(239, 68, 68, 0.2);
  --swal-warning-light: rgba(245, 158, 11, 0.2);
  --swal-info-light: rgba(59, 130, 246, 0.2);

  --swal-shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4), 0 6px 10px rgba(0, 0, 0, 0.3);
  --swal-shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.5), 0 12px 24px rgba(0, 0, 0, 0.4);
}
`;
}

function generateLightThemeCSS() {
  return `${BANNER}

/* SweetAlert++ Light Theme */

[data-theme="light"],
.swal-light {
  --swal-bg: #ffffff;
  --swal-bg-secondary: #f8fafc;
  --swal-bg-tertiary: #f1f5f9;
  --swal-bg-elevated: #ffffff;
  --swal-bg-overlay: rgba(0, 0, 0, 0.5);
  --swal-bg-glass: rgba(255, 255, 255, 0.9);

  --swal-text: #0f172a;
  --swal-text-secondary: #475569;
  --swal-text-tertiary: #94a3b8;
  --swal-text-inverse: #ffffff;

  --swal-border: rgba(0, 0, 0, 0.1);
  --swal-border-light: rgba(0, 0, 0, 0.05);

  --swal-success-light: rgba(16, 185, 129, 0.1);
  --swal-error-light: rgba(239, 68, 68, 0.1);
  --swal-warning-light: rgba(245, 158, 11, 0.1);
  --swal-info-light: rgba(59, 130, 246, 0.1);

  --swal-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --swal-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
`;
}

function generateMinimalCSS() {
  return `${BANNER}

/* SweetAlert++ Minimal - Core Modal Only (~2KB) */

.swal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.swal-dialog {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.swal-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.swal-content {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.swal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.swal-btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.swal-btn-confirm {
  background: #6366f1;
  color: white;
}

.swal-btn-cancel {
  background: #f1f5f9;
  color: #374151;
}

@media (prefers-color-scheme: dark) {
  .swal-dialog { background: #1e1e2e; }
  .swal-title { color: #f1f5f9; }
  .swal-content { color: #94a3b8; }
  .swal-btn-cancel { background: #374151; color: #f1f5f9; }
}
`;
}

function generateToastCSS() {
  return `${BANNER}

/* SweetAlert++ Toast Styles */

.swal-toast-container {
  position: fixed;
  z-index: 10002;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  max-height: 100vh;
  pointer-events: none;
}

.swal-toast-container--top { top: 0; }
.swal-toast-container--bottom { bottom: 0; flex-direction: column-reverse; }
.swal-toast-container--start { left: 0; }
.swal-toast-container--end { right: 0; }
.swal-toast-container--center { left: 50%; transform: translateX(-50%); }

.swal-toast {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  min-width: 300px;
  max-width: 420px;
  padding: 1rem 1.25rem;
  background: var(--swal-bg-elevated, #fff);
  border: 1px solid var(--swal-border, rgba(0,0,0,0.1));
  border-radius: var(--swal-radius-lg, 12px);
  box-shadow: var(--swal-shadow-lg, 0 10px 25px rgba(0,0,0,0.15));
  pointer-events: auto;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.swal-toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.swal-toast-icon--success { color: var(--swal-success, #10b981); }
.swal-toast-icon--error { color: var(--swal-error, #ef4444); }
.swal-toast-icon--warning { color: var(--swal-warning, #f59e0b); }
.swal-toast-icon--info { color: var(--swal-info, #3b82f6); }

.swal-toast-content {
  flex: 1;
  min-width: 0;
}

.swal-toast-title {
  font-weight: 600;
  color: var(--swal-text, #1a1a1a);
  margin-bottom: 0.25rem;
}

.swal-toast-text {
  font-size: 0.9rem;
  color: var(--swal-text-secondary, #666);
}

.swal-toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--swal-text-tertiary, #999);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.swal-toast:hover .swal-toast-close {
  opacity: 1;
}

.swal-toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--swal-primary, #6366f1);
  transform-origin: left;
}

@keyframes swal-toast-progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

@keyframes swal-toast-slide-in-right {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes swal-toast-slide-out-right {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}
`;
}

function generateFormCSS() {
  return `${BANNER}

/* SweetAlert++ Form Styles */

.swal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
  text-align: left;
}

.swal-form-section {
  padding: 1rem;
  background: var(--swal-bg-secondary, #f8fafc);
  border-radius: var(--swal-radius-md, 10px);
}

.swal-form-section-title {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--swal-text-tertiary, #94a3b8);
  margin-bottom: 1rem;
}

.swal-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.swal-field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--swal-text, #1a1a1a);
}

.swal-field-label .required {
  color: var(--swal-error, #ef4444);
  margin-left: 2px;
}

.swal-field-hint {
  font-size: 0.8rem;
  color: var(--swal-text-tertiary, #94a3b8);
}

.swal-field-error {
  font-size: 0.8rem;
  color: var(--swal-error, #ef4444);
}

/* Checkbox & Radio */
.swal-checkbox-group,
.swal-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.swal-checkbox-group--inline,
.swal-radio-group--inline {
  flex-direction: row;
  flex-wrap: wrap;
}

.swal-checkbox,
.swal-radio {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--swal-text, #1a1a1a);
}

.swal-checkbox input,
.swal-radio input {
  width: 18px;
  height: 18px;
  accent-color: var(--swal-primary, #6366f1);
}

/* Switch/Toggle */
.swal-switch {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.swal-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.swal-switch-track {
  width: 48px;
  height: 26px;
  background: var(--swal-bg-tertiary, #e2e8f0);
  border-radius: 13px;
  position: relative;
  transition: background 0.3s ease;
}

.swal-switch-track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.swal-switch input:checked + .swal-switch-track {
  background: var(--swal-primary, #6366f1);
}

.swal-switch input:checked + .swal-switch-track::after {
  transform: translateX(22px);
}

/* Rating */
.swal-rating {
  display: flex;
  gap: 0.375rem;
}

.swal-rating-star {
  font-size: 1.75rem;
  cursor: pointer;
  color: var(--swal-border, #e2e8f0);
  transition: color 0.15s, transform 0.15s;
}

.swal-rating-star:hover,
.swal-rating-star.active {
  color: #fbbf24;
  transform: scale(1.15);
}

/* File Upload */
.swal-file-dropzone {
  border: 2px dashed var(--swal-border, rgba(0,0,0,0.15));
  border-radius: var(--swal-radius-md, 10px);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.swal-file-dropzone:hover,
.swal-file-dropzone.dragover {
  border-color: var(--swal-primary, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.swal-file-dropzone-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: var(--swal-text-tertiary, #94a3b8);
}

.swal-file-dropzone-text {
  color: var(--swal-text-secondary, #666);
}

.swal-file-dropzone-hint {
  font-size: 0.8rem;
  color: var(--swal-text-tertiary, #94a3b8);
  margin-top: 0.5rem;
}

.swal-file-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.swal-file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--swal-bg-secondary, #f8fafc);
  border-radius: var(--swal-radius-sm, 6px);
}

/* Tags */
.swal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 2px solid var(--swal-border, rgba(0,0,0,0.1));
  border-radius: var(--swal-radius-md, 10px);
  min-height: 44px;
}

.swal-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: var(--swal-primary, #6366f1);
  color: white;
  border-radius: var(--swal-radius-full, 9999px);
  font-size: 0.85rem;
}

.swal-tag-remove {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 10px;
}

.swal-tags-input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: var(--swal-text, #1a1a1a);
}

/* OTP Input */
.swal-otp {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.swal-otp-input {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid var(--swal-border, rgba(0,0,0,0.1));
  border-radius: var(--swal-radius-md, 10px);
  background: var(--swal-bg-secondary, #f8fafc);
  color: var(--swal-text, #1a1a1a);
}

.swal-otp-input:focus {
  border-color: var(--swal-primary, #6366f1);
  outline: none;
}
`;
}

// =============================================================================
// JAVASCRIPT BUILD
// =============================================================================

function buildJS() {
  logStep('JS', 'Building JavaScript bundles with Rollup...');

  try {
    execSync('npx rollup -c rollup.config.js', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    logSuccess('JavaScript build complete');
  } catch (error) {
    logError('JavaScript build failed');
    console.error(error.message);
    process.exit(1);
  }
}

// =============================================================================
// TYPE DEFINITIONS BUILD
// =============================================================================

function buildTypes() {
  logStep('Types', 'Generating TypeScript declarations...');

  try {
    execSync('npx tsc --emitDeclarationOnly --declaration --outDir dist', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    logSuccess('TypeScript declarations generated');
  } catch (error) {
    // Types might fail if tsconfig is not set up correctly
    logError('TypeScript declarations failed (non-critical)');
  }
}

// =============================================================================
// CDN BUNDLE
// =============================================================================

function buildCDN() {
  logStep('CDN', 'Creating CDN-ready bundle...');

  const cdnDir = path.join(CONFIG.outputDir, 'cdn');
  ensureDir(cdnDir);

  // Copy main files to CDN folder
  const cdnFiles = [
    'sweetalert-plus-plus.min.js',
    'sweetalert-plus-plus.min.css',
    'sweetalert-plus-plus.umd.js',
    'sweetalert-plus-plus.css'
  ];

  cdnFiles.forEach(file => {
    const src = path.join(CONFIG.outputDir, file);
    const dest = path.join(cdnDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      logSuccess(`Copied ${file} to cdn/`);
    }
  });

  // Create CDN usage README
  const cdnReadme = `# SweetAlert++ CDN Usage

## Quick Start

### Using unpkg
\`\`\`html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/sweetalert-plus-plus@${CONFIG.version}/dist/sweetalert-plus-plus.min.css">

<!-- JavaScript -->
<script src="https://unpkg.com/sweetalert-plus-plus@${CONFIG.version}/dist/sweetalert-plus-plus.min.js"></script>
\`\`\`

### Using jsDelivr
\`\`\`html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@${CONFIG.version}/dist/sweetalert-plus-plus.min.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@${CONFIG.version}/dist/sweetalert-plus-plus.min.js"></script>
\`\`\`

## Usage

After including the files, SweetAlert++ is available as the global \`Swal\` object:

\`\`\`javascript
// Simple alert
Swal.alert('Hello World!');

// Success message
Swal.success('Operation completed!');

// Confirmation dialog
const result = await Swal.confirm({
  title: 'Are you sure?',
  text: 'This action cannot be undone.'
});

if (result.confirmed) {
  // User clicked confirm
}

// Toast notification
Swal.toast({
  icon: 'success',
  title: 'Saved!',
  text: 'Your changes have been saved.'
});

// Form modal
const data = await Swal.form({
  title: 'Contact Us',
  form: {
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'message', type: 'textarea', label: 'Message' }
    ]
  }
});
\`\`\`

## Available Bundles

| File | Size | Description |
|------|------|-------------|
| sweetalert-plus-plus.min.js | ~15KB | Minified UMD bundle (recommended for CDN) |
| sweetalert-plus-plus.min.css | ~8KB | Minified CSS with all styles |
| sweetalert-plus-plus.umd.js | ~40KB | Unminified UMD bundle (for debugging) |
| sweetalert-plus-plus.css | ~20KB | Unminified CSS |

## Version

Current version: ${CONFIG.version}

Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(cdnDir, 'README.md'), cdnReadme);
  logSuccess('Created cdn/README.md');
}

// =============================================================================
// SIZE REPORT
// =============================================================================

function generateSizeReport() {
  logStep('Report', 'Generating size report...');

  const files = [
    'sweetalert-plus-plus.esm.js',
    'sweetalert-plus-plus.cjs.js',
    'sweetalert-plus-plus.umd.js',
    'sweetalert-plus-plus.min.js',
    'sweetalert-plus-plus.iife.js',
    'core.esm.js',
    'toast.esm.js',
    'theme.esm.js',
    'sweetalert-plus-plus.css',
    'sweetalert-plus-plus.min.css',
    'sweetalert-plus-plus.minimal.css',
    'sweetalert-plus-plus.toast.css',
    'sweetalert-plus-plus.form.css'
  ];

  console.log('\n' + colors.bright + '='.repeat(60) + colors.reset);
  console.log(colors.bright + ' Build Output Size Report' + colors.reset);
  console.log('='.repeat(60));
  console.log('');

  let totalSize = 0;

  files.forEach(file => {
    const filepath = path.join(CONFIG.outputDir, file);
    const size = getFileSize(filepath);
    if (size > 0) {
      totalSize += size;
      const sizeStr = formatBytes(size).padStart(10);
      const icon = file.includes('.min.') ? colors.green + '*' : ' ';
      console.log(`${icon}${colors.reset} ${sizeStr}  ${file}`);
    }
  });

  console.log('');
  console.log('-'.repeat(60));
  console.log(`   ${formatBytes(totalSize).padStart(10)}  Total`);
  console.log('');
  console.log(colors.green + '*' + colors.reset + ' = minified (recommended for production)');
  console.log('');
}

// =============================================================================
// MAIN BUILD PROCESS
// =============================================================================

async function build() {
  const args = process.argv.slice(2);
  const cssOnly = args.includes('--css-only');
  const jsOnly = args.includes('--js-only');
  const minifyOnly = args.includes('--minify-only');
  const watch = args.includes('--watch');

  console.log('');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║          SweetAlert++ Build System v' + CONFIG.version + '                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('');

  const startTime = Date.now();

  ensureDir(CONFIG.outputDir);

  if (!jsOnly) {
    buildCSS();
    console.log('');
  }

  if (!cssOnly && !minifyOnly) {
    buildJS();
    console.log('');

    buildTypes();
    console.log('');
  }

  buildCDN();
  console.log('');

  generateSizeReport();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  log(`✨ Build completed in ${elapsed}s`, 'green');
  console.log('');

  // CDN usage examples
  console.log(colors.bright + 'CDN Usage:' + colors.reset);
  console.log('');
  console.log(colors.cyan + '  <!-- unpkg -->' + colors.reset);
  console.log(`  <link rel="stylesheet" href="https://unpkg.com/sweetalert-plus-plus@${CONFIG.version}/dist/sweetalert-plus-plus.min.css">`);
  console.log(`  <script src="https://unpkg.com/sweetalert-plus-plus@${CONFIG.version}/dist/sweetalert-plus-plus.min.js"></script>`);
  console.log('');
  console.log(colors.cyan + '  <!-- jsDelivr -->' + colors.reset);
  console.log(`  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@${CONFIG.version}/dist/sweetalert-plus-plus.min.css">`);
  console.log(`  <script src="https://cdn.jsdelivr.net/npm/sweetalert-plus-plus@${CONFIG.version}/dist/sweetalert-plus-plus.min.js"></script>`);
  console.log('');

  if (watch) {
    logStep('Watch', 'Watching for changes...');
    // Watch implementation would go here
  }
}

// Run build
build().catch(error => {
  logError('Build failed:');
  console.error(error);
  process.exit(1);
});
