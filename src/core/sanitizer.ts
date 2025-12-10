/**
 * HTML Sanitizer
 * Secure by default, CSP-friendly HTML sanitization
 */

// ============================================================================
// Allowed Elements and Attributes
// ============================================================================

const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'span', 'strong',
  'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
  'mark', 'small', 'del', 'ins', 'figure', 'figcaption', 'kbd', 'var', 'samp',
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'title', 'lang', 'dir', 'data-*']),
  'a': new Set(['href', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
  'ol': new Set(['start', 'type', 'reversed']),
  'li': new Set(['value']),
  'blockquote': new Set(['cite']),
};

// Protocols allowed in URLs
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'data:']);

// Dangerous patterns
const DANGEROUS_PATTERNS = [
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi,
];

// ============================================================================
// Sanitizer Implementation
// ============================================================================

export interface SanitizerOptions {
  /** Additional allowed tags */
  allowedTags?: string[];
  /** Additional allowed attributes per tag */
  allowedAttributes?: Record<string, string[]>;
  /** Allow data: URLs (disabled by default for security) */
  allowDataUrls?: boolean;
  /** Custom URL validator */
  urlValidator?: (url: string) => boolean;
  /** Allow target="_blank" (adds rel="noopener noreferrer" automatically) */
  allowTargetBlank?: boolean;
}

/**
 * Check if an attribute value is safe
 */
function isAttributeSafe(name: string, value: string, options: SanitizerOptions): boolean {
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(value)) {
      return false;
    }
  }

  // Check URL attributes
  if (name === 'href' || name === 'src') {
    try {
      const url = new URL(value, window.location.origin);

      // Custom validator
      if (options.urlValidator) {
        return options.urlValidator(value);
      }

      // Check protocol
      if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
        return false;
      }

      // Block data: URLs unless explicitly allowed
      if (url.protocol === 'data:' && !options.allowDataUrls) {
        return false;
      }

      return true;
    } catch {
      // Relative URLs are OK
      return !value.includes(':') || value.startsWith('/');
    }
  }

  return true;
}

/**
 * Check if an attribute is allowed for a tag
 */
function isAttributeAllowed(
  tagName: string,
  attrName: string,
  options: SanitizerOptions
): boolean {
  const globalAllowed = ALLOWED_ATTRIBUTES['*'];
  const tagAllowed = ALLOWED_ATTRIBUTES[tagName.toLowerCase()];
  const customAllowed = options.allowedAttributes?.[tagName.toLowerCase()];

  // Check global allowed
  if (globalAllowed?.has(attrName)) return true;
  if (globalAllowed?.has('data-*') && attrName.startsWith('data-')) return true;

  // Check tag-specific allowed
  if (tagAllowed?.has(attrName)) return true;

  // Check custom allowed
  if (customAllowed?.includes(attrName)) return true;

  return false;
}

/**
 * Sanitize HTML string
 */
export function sanitize(html: string, options: SanitizerOptions = {}): string {
  // Fast path for empty or plaintext
  if (!html || !html.includes('<')) {
    return escapeHtml(html);
  }

  // Build allowed tags set
  const allowedTags = new Set(ALLOWED_TAGS);
  if (options.allowedTags) {
    options.allowedTags.forEach(tag => allowedTags.add(tag.toLowerCase()));
  }

  // Use DOMParser for parsing (safer than innerHTML)
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;

  // Walk and sanitize
  sanitizeNode(body, allowedTags, options);

  return body.innerHTML;
}

/**
 * Recursively sanitize a node
 */
function sanitizeNode(
  node: Node,
  allowedTags: Set<string>,
  options: SanitizerOptions
): void {
  const nodesToRemove: Node[] = [];

  node.childNodes.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tagName = el.tagName.toLowerCase();

      if (!allowedTags.has(tagName)) {
        // Remove tag but keep content
        nodesToRemove.push(child);
        // We'll handle the children after
      } else {
        // Sanitize attributes
        const attrsToRemove: string[] = [];

        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          const attrName = attr.name.toLowerCase();

          if (!isAttributeAllowed(tagName, attrName, options)) {
            attrsToRemove.push(attr.name);
          } else if (!isAttributeSafe(attrName, attr.value, options)) {
            attrsToRemove.push(attr.name);
          }
        }

        // Remove unsafe attributes
        attrsToRemove.forEach(name => el.removeAttribute(name));

        // Add security attributes for links
        if (tagName === 'a') {
          const target = el.getAttribute('target');
          if (target === '_blank' && options.allowTargetBlank !== false) {
            // Prevent tabnabbing
            el.setAttribute('rel', 'noopener noreferrer');
          }
        }

        // Recurse into children
        sanitizeNode(el, allowedTags, options);
      }
    } else if (child.nodeType === Node.COMMENT_NODE) {
      // Remove comments
      nodesToRemove.push(child);
    }
  });

  // Remove disallowed nodes (but keep their text content for block elements)
  nodesToRemove.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      // Move children before removing
      while (el.firstChild) {
        el.parentNode?.insertBefore(el.firstChild, el);
      }
    }
    child.parentNode?.removeChild(child);
  });
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str: string): string {
  if (!str) return '';

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
  };

  return str.replace(/[&<>"'`]/g, char => escapeMap[char] || char);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  if (!str) return '';

  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Check if a string contains HTML
 */
export function containsHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

/**
 * Strip all HTML tags
 */
export function stripTags(html: string): string {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * Create a sanitized element from HTML
 */
export function createSanitizedElement(
  html: string,
  options: SanitizerOptions = {}
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = sanitize(html, options);
  return wrapper;
}
