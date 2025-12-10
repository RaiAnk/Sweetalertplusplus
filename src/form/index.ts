/**
 * Form Module
 * Schema-based form builder with beautiful input components
 */

export {
  validateField,
  validateForm,
  registerValidator,
  unregisterValidator,
  applyMask,
  unmask,
  createMaskedInput,
  createDebouncedValidator,
} from './validation';

export type { MaskOptions } from './validation';

export {
  renderForm,
  createFormSchema,
  formPresets,
  registerFieldRenderer,
} from './form-renderer';

export type { FormState, FormController } from './form-renderer';

export {
  getFieldRenderer,
  builtInRenderers,
} from './field-renderers';
