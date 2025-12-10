/**
 * Core Type Definitions
 * Clean, intuitive naming conventions with full TypeScript support
 */

// ============================================================================
// Base Types
// ============================================================================

export type ModalRole = 'dialog' | 'alertdialog';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
export type Position = 'center' | 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
export type ToastPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';
export type AnimationPreset = 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'none';
export type IconType = 'success' | 'error' | 'warning' | 'info' | 'question' | 'loading' | 'none';

// ============================================================================
// Form Field Types - Comprehensive Data Type Support
// ============================================================================

export type FieldType =
  // Text inputs
  | 'text'
  | 'email'
  | 'password'
  | 'url'
  | 'tel'
  | 'search'
  // Numeric
  | 'number'
  | 'currency'
  | 'percentage'
  | 'range'
  | 'rating'
  // Date/Time
  | 'date'
  | 'time'
  | 'datetime'
  | 'daterange'
  | 'month'
  | 'week'
  // Selection
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'toggle'
  // Rich inputs
  | 'textarea'
  | 'richtext'
  | 'code'
  | 'markdown'
  // File
  | 'file'
  | 'image'
  | 'avatar'
  // Special
  | 'color'
  | 'tags'
  | 'autocomplete'
  | 'otp'
  | 'pin'
  | 'signature'
  | 'slider'
  // Layout
  | 'divider'
  | 'heading'
  | 'paragraph'
  | 'hidden';

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationRule {
  /** Rule type */
  type: 'required' | 'email' | 'url' | 'min' | 'max' | 'minLength' | 'maxLength' |
        'pattern' | 'custom' | 'match' | 'unique' | 'phone' | 'creditCard' |
        'date' | 'dateRange' | 'fileSize' | 'fileType' | 'dimensions';
  /** Error message */
  message?: string;
  /** Value for the rule (e.g., min value, pattern, etc.) */
  value?: any;
  /** Custom validation function */
  validator?: (value: any, formData: Record<string, any>) => boolean | string | Promise<boolean | string>;
}

export interface FieldValidation {
  rules?: ValidationRule[];
  /** Validate on blur */
  validateOnBlur?: boolean;
  /** Validate on change */
  validateOnChange?: boolean;
  /** Debounce validation (ms) */
  debounce?: number;
  /** Show validation state */
  showValidState?: boolean;
}

// ============================================================================
// Form Field Configuration
// ============================================================================

export interface SelectOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
  group?: string;
}

export interface FormFieldBase {
  /** Unique field name/key */
  name: string;
  /** Field type */
  type: FieldType;
  /** Display label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help text shown below field */
  helpText?: string;
  /** Default value */
  defaultValue?: any;
  /** Is field disabled */
  disabled?: boolean;
  /** Is field read-only */
  readOnly?: boolean;
  /** Is field required */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Field width in grid (1-12) */
  colSpan?: number;
  /** Validation rules */
  validation?: FieldValidation;
  /** Conditional visibility */
  showWhen?: (formData: Record<string, any>) => boolean;
  /** Custom render function */
  render?: (field: FormField, value: any, onChange: (value: any) => void) => HTMLElement;
  /** Transform value before submission */
  transform?: (value: any) => any;
  /** HTML attributes */
  attributes?: Record<string, string | number | boolean>;
}

export interface TextFieldConfig extends FormFieldBase {
  type: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
  /** Input mask pattern */
  mask?: string;
  /** Mask placeholder character */
  maskChar?: string;
  /** Show/hide password toggle */
  showPasswordToggle?: boolean;
  /** Prefix text/icon */
  prefix?: string;
  /** Suffix text/icon */
  suffix?: string;
  /** Max length */
  maxLength?: number;
  /** Min length */
  minLength?: number;
  /** Autocomplete attribute */
  autocomplete?: string;
  /** Enable clear button */
  clearable?: boolean;
}

export interface NumberFieldConfig extends FormFieldBase {
  type: 'number' | 'currency' | 'percentage';
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step value */
  step?: number;
  /** Decimal places */
  decimals?: number;
  /** Currency code (for currency type) */
  currency?: string;
  /** Locale for formatting */
  locale?: string;
  /** Show increment/decrement buttons */
  showButtons?: boolean;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%") */
  suffix?: string;
}

export interface RangeFieldConfig extends FormFieldBase {
  type: 'range' | 'slider';
  min: number;
  max: number;
  step?: number;
  /** Show value label */
  showValue?: boolean;
  /** Show min/max labels */
  showLabels?: boolean;
  /** Custom tick marks */
  ticks?: Array<{ value: number; label?: string }>;
  /** Enable range selection (two handles) */
  range?: boolean;
}

export interface RatingFieldConfig extends FormFieldBase {
  type: 'rating';
  /** Maximum rating */
  max?: number;
  /** Allow half values */
  allowHalf?: boolean;
  /** Icon type */
  icon?: 'star' | 'heart' | 'circle' | 'custom';
  /** Custom icon SVG */
  customIcon?: string;
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show rating value */
  showValue?: boolean;
}

export interface DateFieldConfig extends FormFieldBase {
  type: 'date' | 'time' | 'datetime' | 'month' | 'week';
  /** Minimum date */
  minDate?: Date | string;
  /** Maximum date */
  maxDate?: Date | string;
  /** Date format for display */
  format?: string;
  /** Disabled dates */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** Show today button */
  showToday?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Week starts on (0=Sun, 1=Mon) */
  weekStartsOn?: 0 | 1;
}

export interface DateRangeFieldConfig extends FormFieldBase {
  type: 'daterange';
  minDate?: Date | string;
  maxDate?: Date | string;
  format?: string;
  /** Preset ranges */
  presets?: Array<{
    label: string;
    range: [Date | string, Date | string];
  }>;
}

export interface SelectFieldConfig extends FormFieldBase {
  type: 'select' | 'multiselect' | 'radio' | 'checkbox';
  options: SelectOption[];
  /** Enable search/filter */
  searchable?: boolean;
  /** Allow creating new options */
  creatable?: boolean;
  /** Group options */
  grouped?: boolean;
  /** Max selections (for multiselect) */
  maxSelections?: number;
  /** Show select all option */
  showSelectAll?: boolean;
  /** Option layout for radio/checkbox */
  layout?: 'vertical' | 'horizontal' | 'grid';
  /** Grid columns (when layout=grid) */
  columns?: number;
}

export interface SwitchFieldConfig extends FormFieldBase {
  type: 'switch' | 'toggle';
  /** Label when on */
  onLabel?: string;
  /** Label when off */
  offLabel?: string;
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Color when on */
  color?: string;
}

export interface TextareaFieldConfig extends FormFieldBase {
  type: 'textarea' | 'richtext' | 'markdown' | 'code';
  /** Number of rows */
  rows?: number;
  /** Max rows for auto-resize */
  maxRows?: number;
  /** Enable auto-resize */
  autoResize?: boolean;
  /** Max length */
  maxLength?: number;
  /** Show character count */
  showCount?: boolean;
  /** Code language (for code type) */
  language?: string;
  /** Rich text toolbar options */
  toolbar?: string[];
}

export interface FileFieldConfig extends FormFieldBase {
  type: 'file' | 'image' | 'avatar';
  /** Accepted file types */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Max file size in bytes */
  maxSize?: number;
  /** Max files */
  maxFiles?: number;
  /** Enable drag & drop */
  dragDrop?: boolean;
  /** Show preview */
  showPreview?: boolean;
  /** Image aspect ratio (for image/avatar) */
  aspectRatio?: number;
  /** Enable cropping */
  crop?: boolean;
}

export interface ColorFieldConfig extends FormFieldBase {
  type: 'color';
  /** Color format */
  format?: 'hex' | 'rgb' | 'hsl';
  /** Preset colors */
  presets?: string[];
  /** Allow alpha/opacity */
  alpha?: boolean;
  /** Show input field */
  showInput?: boolean;
}

export interface TagsFieldConfig extends FormFieldBase {
  type: 'tags';
  /** Predefined suggestions */
  suggestions?: string[];
  /** Max tags */
  maxTags?: number;
  /** Allow duplicates */
  allowDuplicates?: boolean;
  /** Delimiter for typing */
  delimiter?: string;
  /** Transform input */
  transformTag?: (tag: string) => string;
}

export interface AutocompleteFieldConfig extends FormFieldBase {
  type: 'autocomplete';
  /** Static options */
  options?: SelectOption[];
  /** Async options loader */
  loadOptions?: (query: string) => Promise<SelectOption[]>;
  /** Debounce for async loading */
  debounce?: number;
  /** Minimum query length */
  minQueryLength?: number;
  /** Allow free text */
  freeSolo?: boolean;
  /** Multiple selections */
  multiple?: boolean;
}

export interface OTPFieldConfig extends FormFieldBase {
  type: 'otp' | 'pin';
  /** Number of digits */
  length?: number;
  /** Mask input (for PIN) */
  masked?: boolean;
  /** Auto-submit when complete */
  autoSubmit?: boolean;
  /** Allow letters */
  alphanumeric?: boolean;
}

export interface SignatureFieldConfig extends FormFieldBase {
  type: 'signature';
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Pen color */
  penColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Show clear button */
  clearable?: boolean;
}

export interface DividerConfig extends FormFieldBase {
  type: 'divider';
  /** Divider text */
  text?: string;
}

export interface HeadingConfig extends FormFieldBase {
  type: 'heading';
  /** Heading level */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Heading text */
  text: string;
}

export interface ParagraphConfig extends FormFieldBase {
  type: 'paragraph';
  /** Paragraph content */
  content: string;
}

export interface HiddenFieldConfig extends FormFieldBase {
  type: 'hidden';
}

// Union type for all field configs
export type FormField =
  | TextFieldConfig
  | NumberFieldConfig
  | RangeFieldConfig
  | RatingFieldConfig
  | DateFieldConfig
  | DateRangeFieldConfig
  | SelectFieldConfig
  | SwitchFieldConfig
  | TextareaFieldConfig
  | FileFieldConfig
  | ColorFieldConfig
  | TagsFieldConfig
  | AutocompleteFieldConfig
  | OTPFieldConfig
  | SignatureFieldConfig
  | DividerConfig
  | HeadingConfig
  | ParagraphConfig
  | HiddenFieldConfig;

// ============================================================================
// Form Schema
// ============================================================================

export interface FormSchema {
  /** Form fields */
  fields: FormField[];
  /** Form layout */
  layout?: {
    /** Number of columns */
    columns?: number;
    /** Gap between fields */
    gap?: 'sm' | 'md' | 'lg';
    /** Label position */
    labelPosition?: 'top' | 'left' | 'floating';
    /** Label width (when position=left) */
    labelWidth?: string;
  };
  /** Form-level validation */
  validation?: {
    /** Validate all fields on submit */
    validateOnSubmit?: boolean;
    /** Stop at first error */
    stopOnFirstError?: boolean;
    /** Scroll to first error */
    scrollToError?: boolean;
  };
  /** Form sections */
  sections?: Array<{
    title?: string;
    description?: string;
    fields: string[]; // Field names
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  }>;
}

// ============================================================================
// Result Types
// ============================================================================

export interface ModalResult<T = any> {
  /** User clicked confirm/OK button */
  confirmed: boolean;
  /** User clicked deny/No button */
  denied: boolean;
  /** User dismissed (ESC, backdrop click, close button, timer) */
  dismissed: boolean;
  /** The reason for dismissal */
  dismissReason?: DismissReason;
  /** Value from input or form data */
  value?: T;
  /** Form validation errors (if any) */
  errors?: Record<string, string>;
}

export type DismissReason =
  | 'backdrop'
  | 'escape'
  | 'close'
  | 'timer'
  | 'cancel'
  | 'programmatic';

// ============================================================================
// Button Configuration
// ============================================================================

export interface ButtonConfig {
  text?: string;
  visible?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'success' | 'warning';
  disabled?: boolean;
  ariaLabel?: string;
  autoFocus?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export interface ButtonsConfig {
  confirm?: ButtonConfig | string | boolean;
  deny?: ButtonConfig | string | boolean;
  cancel?: ButtonConfig | string | boolean;
  custom?: Array<ButtonConfig & { id: string; onClick?: () => void | Promise<void> }>;
  layout?: 'horizontal' | 'vertical' | 'space-between';
  reverseOrder?: boolean;
}

// ============================================================================
// Legacy Input Configuration (for simple use cases)
// ============================================================================

export interface InputConfig {
  type: FieldType;
  label?: string;
  placeholder?: string;
  value?: any;
  attributes?: Record<string, string | number | boolean>;
  validate?: (value: any) => string | boolean | undefined | Promise<string | boolean | undefined>;
  options?: SelectOption[];
  mask?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  required?: boolean;
  autoFocus?: boolean;
  autocomplete?: string;
  accept?: string;
  multiple?: boolean;
  rows?: number;
}

// ============================================================================
// Animation Configuration
// ============================================================================

export interface AnimationConfig {
  enter?: AnimationPreset | string;
  exit?: AnimationPreset | string;
  duration?: number;
  respectReducedMotion?: boolean;
  custom?: {
    enter?: Partial<CSSStyleDeclaration>;
    exit?: Partial<CSSStyleDeclaration>;
  };
}

// ============================================================================
// Accessibility Configuration
// ============================================================================

export interface A11yConfig {
  role?: ModalRole;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  announceOnOpen?: string;
  liveRegion?: boolean;
  autoFocus?: 'first-focusable' | 'confirm' | 'cancel' | 'input' | 'none' | string;
  returnFocus?: boolean;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
}

// ============================================================================
// Lifecycle Hooks
// ============================================================================

export interface LifecycleHooks<T = any> {
  onBeforeOpen?: () => void | boolean | Promise<void | boolean>;
  onOpen?: (modal: ModalInstance) => void;
  onAfterOpen?: (modal: ModalInstance) => void;
  onBeforeClose?: (modal: ModalInstance, result: ModalResult<T>) => void | boolean | Promise<void | boolean>;
  onClose?: (result: ModalResult<T>) => void;
  onAfterClose?: (result: ModalResult<T>) => void;
  onInputChange?: (value: any, modal: ModalInstance) => void;
  onFormChange?: (formData: Record<string, any>, changedField: string, modal: ModalInstance) => void;
  onBeforeConfirm?: (value: any) => any | Promise<any>;
  onTimerTick?: (remaining: number) => void;
  onValidationError?: (errors: Record<string, string>) => void;
}

// ============================================================================
// Main Modal Options
// ============================================================================

export interface ModalOptions<T = any> {
  // Content
  title?: string | HTMLElement;
  text?: string;
  html?: string | HTMLElement;
  footer?: string | HTMLElement;
  icon?: IconType | HTMLElement | string;
  iconColor?: string;
  image?: {
    src: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
  };

  // Buttons
  buttons?: ButtonsConfig;
  confirmText?: string;
  cancelText?: string;
  denyText?: string;

  // Simple input (legacy)
  input?: InputConfig;

  // Form schema (new)
  form?: FormSchema;

  // Layout & Style
  size?: ModalSize;
  width?: number | string;
  maxHeight?: number | string;
  position?: Position;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  container?: HTMLElement | string;
  zIndex?: number;

  // Backdrop
  backdrop?: boolean | 'static';
  backdropClass?: string;
  backdropOpacity?: number;

  // Behavior
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  timer?: number;
  timerProgressBar?: boolean;
  pauseTimerOnHover?: boolean;
  allowUnsafeHtml?: boolean;
  sanitizer?: (html: string) => string;
  scrollBehavior?: 'block' | 'keep' | 'smooth-top';

  // Animation
  animation?: AnimationConfig | AnimationPreset | false;

  // Accessibility
  a11y?: A11yConfig;

  // Lifecycle hooks
  hooks?: LifecycleHooks<T>;

  // Advanced
  render?: (options: ModalOptions<T>) => HTMLElement;
  id?: string;
  data?: Record<string, string>;

  // RTL support
  rtl?: boolean;
}

// ============================================================================
// Toast Options
// ============================================================================

export interface ToastOptions extends Omit<ModalOptions, 'input' | 'form' | 'buttons' | 'size' | 'backdrop'> {
  position?: ToastPosition;
  duration?: number;
  progressBar?: boolean;
  pauseOnHover?: boolean;
  pauseOnBlur?: boolean;
  closeOnClick?: boolean;
  draggable?: boolean;
  dragDirection?: 'x' | 'y';
  group?: string;
  maxVisible?: number;
  stackDirection?: 'up' | 'down';
  actions?: Array<{
    text: string;
    onClick: () => void;
    className?: string;
  }>;
}

// ============================================================================
// Queue Configuration
// ============================================================================

export interface QueueConfig {
  mode?: 'sequential' | 'stack';
  maxVisible?: number;
  delay?: number;
  allowSkip?: boolean;
  showProgress?: boolean;
}

export interface QueueItem<T = any> {
  id: string;
  options: ModalOptions<T>;
  resolve: (result: ModalResult<T>) => void;
  reject: (error: Error) => void;
}

// ============================================================================
// Modal Instance
// ============================================================================

export interface ModalInstance {
  id: string;
  element: HTMLElement;
  options: ModalOptions;
  isOpen: boolean;
  close: (result?: Partial<ModalResult>) => Promise<void>;
  update: (options: Partial<ModalOptions>) => void;
  getInputValue: () => any;
  setInputValue: (value: any) => void;
  getFormData: () => Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  validateForm: () => Promise<{ valid: boolean; errors: Record<string, string> }>;
  showValidationError: (message: string, field?: string) => void;
  clearValidationError: (field?: string) => void;
  setButtonState: (button: 'confirm' | 'deny' | 'cancel', state: Partial<ButtonConfig>) => void;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  timer: {
    pause: () => void;
    resume: () => void;
    reset: () => void;
    getRemaining: () => number;
  };
}

// ============================================================================
// Global Configuration
// ============================================================================

export interface GlobalConfig {
  defaults?: Partial<ModalOptions>;
  toastDefaults?: Partial<ToastOptions>;
  container?: HTMLElement | string;
  baseZIndex?: number;
  zIndexStep?: number;
  animation?: AnimationConfig;
  a11y?: A11yConfig;
  icons?: Partial<Record<IconType, string | HTMLElement>>;
  sanitizer?: (html: string) => string;
  queue?: QueueConfig;
  classPrefix?: string;
  rtl?: boolean;
  locale?: string;
}

// ============================================================================
// Plugin System
// ============================================================================

export interface Plugin {
  name: string;
  version?: string;
  install: (api: PluginAPI) => void | Promise<void>;
  uninstall?: () => void;
}

export interface PluginAPI {
  registerPreset: (name: string, options: Partial<ModalOptions>) => void;
  registerFieldType: (type: string, renderer: FieldRenderer) => void;
  registerValidator: (name: string, validator: ValidatorFn) => void;
  addHook: <K extends keyof LifecycleHooks>(hook: K, fn: NonNullable<LifecycleHooks[K]>) => void;
  removeHook: <K extends keyof LifecycleHooks>(hook: K, fn: NonNullable<LifecycleHooks[K]>) => void;
  config: GlobalConfig;
  getActiveModals: () => ModalInstance[];
  modal: <T = any>(options: ModalOptions<T>) => Promise<ModalResult<T>>;
}

export type FieldRenderer = (
  field: FormField,
  value: any,
  onChange: (value: any) => void,
  error?: string
) => HTMLElement;

export type ValidatorFn = (
  value: any,
  rule: ValidationRule,
  formData: Record<string, any>
) => boolean | string | Promise<boolean | string>;
