import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IoAdd, IoCopy, IoEye, IoChevronDown, IoChevronUp, IoTrash, IoSave, IoRefresh, IoSettings, IoPrint, IoDownload, IoShare } from 'react-icons/io5';

export type FormFieldType = 
  | 'text' | 'password' | 'email' | 'url' | 'tel' | 'number' | 'search'
  | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'switch'
  | 'date' | 'datetime-local' | 'time' | 'month' | 'week' | 'color'
  | 'file' | 'image' | 'range' | 'rating' | 'signature' | 'rich-text'
  | 'json' | 'code' | 'markdown' | 'address' | 'phone' | 'currency'
  | 'tags' | 'autocomplete' | 'cascader' | 'tree-select' | 'transfer'
  | 'upload' | 'cropper' | 'map' | 'chart' | 'calendar' | 'table'
  | 'divider' | 'html' | 'custom' | 'group' | 'repeater' | 'conditional';

export type ValidationRule = {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: string | number | RegExp;
  message: string;
  validator?: (value: unknown, formData: Record<string, unknown>) => boolean | Promise<boolean>;
};

export type FormFieldOption = {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
  group?: string;
  children?: FormFieldOption[];
};

export type ConditionalLogic = {
  when: string | string[]; // field name(s) to watch
  is?: any; // value to match
  isNot?: any; // value to not match
  in?: any[]; // value in array
  notIn?: any[]; // value not in array
  contains?: string; // string contains
  startsWith?: string; // string starts with
  endsWith?: string; // string ends with
  isEmpty?: boolean; // field is empty
  isNotEmpty?: boolean; // field is not empty
  greaterThan?: number; // numeric comparison
  lessThan?: number; // numeric comparison
  and?: ConditionalLogic[]; // AND logic
  or?: ConditionalLogic[]; // OR logic
  custom?: (formData: Record<string, any>) => boolean; // custom logic
};

export type FormFieldLayout = {
  span?: number; // Grid span (1-12)
  offset?: number; // Grid offset
  order?: number; // Flex order
  breakpoint?: {
    xs?: { span?: number; offset?: number };
    sm?: { span?: number; offset?: number };
    md?: { span?: number; offset?: number };
    lg?: { span?: number; offset?: number };
    xl?: { span?: number; offset?: number };
  };
};

export type FormField = {
  // Basic properties
  id: string;
  name: string;
  type: FormFieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  helpText?: React.ReactNode;
  
  // Value and validation
  defaultValue?: any;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  validation?: ValidationRule[];
  
  // Options for select, radio, checkbox
  options?: FormFieldOption[];
  multiple?: boolean;
  searchable?: boolean;
  creatable?: boolean;
  clearable?: boolean;
  
  // Styling and layout
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'default' | 'large';
  layout?: FormFieldLayout;
  
  // Field-specific configurations
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  rows?: number; // for textarea
  cols?: number; // for textarea
  accept?: string; // for file inputs
  capture?: string; // for file inputs
  autoComplete?: string;
  autoFocus?: boolean;
  
  // Advanced features
  conditionalLogic?: ConditionalLogic;
  dependsOn?: string[]; // field dependencies
  computedValue?: (formData: Record<string, any>) => any;
  formatValue?: (value: any) => string;
  parseValue?: (value: string) => any;
  
  // Events
  onChange?: (value: any, formData: Record<string, any>) => void;
  onBlur?: (value: any, formData: Record<string, any>) => void;
  onFocus?: (value: any, formData: Record<string, any>) => void;
  onValidate?: (value: any, formData: Record<string, any>) => string | undefined;
  
  // Custom rendering
  render?: (field: FormField, value: any, onChange: (value: any) => void, errors: string[]) => React.ReactNode;
  renderLabel?: () => React.ReactNode;
  renderDescription?: () => React.ReactNode;
  renderError?: (errors: string[]) => React.ReactNode;
  
  // Grouping and nesting
  group?: string;
  children?: FormField[]; // for group and repeater fields
  
  // Metadata
  tags?: string[];
  category?: string;
  version?: string;
  author?: string;
  permissions?: string[];
  
  // API integration
  dataSource?: {
    url?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    params?: Record<string, any>;
    transform?: (data: any) => FormFieldOption[];
    cache?: boolean;
    debounce?: number;
  };
  
  // UI state
  collapsed?: boolean;
  expanded?: boolean;
  sortable?: boolean;
  removable?: boolean;
  duplicatable?: boolean;
};

export type FormSection = {
  id: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  fields: FormField[];
  conditionalLogic?: ConditionalLogic;
  className?: string;
  style?: React.CSSProperties;
};

export type FormValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'all';

export type FormLayout = 'vertical' | 'horizontal' | 'inline' | 'grid';

export type FormTheme = {
  primaryColor?: string;
  borderRadius?: string;
  spacing?: string;
  fontSize?: string;
  fontFamily?: string;
  shadows?: boolean;
  animations?: boolean;
  colorScheme?: 'light' | 'dark' | 'auto';
};

export type FormBuilder = {
  id: string;
  title?: string;
  description?: string;
  version?: string;
  
  // Structure
  sections: FormSection[];
  layout: FormLayout;
  columns?: number;
  
  // Behavior
  validationMode: FormValidationMode;
  autoSave?: boolean;
  autoSaveInterval?: number;
  showProgress?: boolean;
  allowDraft?: boolean;
  
  // Styling
  theme?: FormTheme;
  className?: string;
  style?: React.CSSProperties;
  
  // Features
  features?: {
    export?: boolean;
    import?: boolean;
    preview?: boolean;
    print?: boolean;
    share?: boolean;
    history?: boolean;
    comments?: boolean;
    collaboration?: boolean;
  };
  
  // Events
  onSubmit?: (formData: Record<string, any>, isValid: boolean) => void | Promise<void>;
  onChange?: (formData: Record<string, any>, changedField: string) => void;
  onValidate?: (formData: Record<string, any>, errors: Record<string, string[]>) => void;
  onSectionChange?: (sectionId: string, collapsed: boolean) => void;
  onFieldAdd?: (field: FormField, sectionId: string) => void;
  onFieldRemove?: (fieldId: string, sectionId: string) => void;
  onFieldMove?: (fieldId: string, fromSection: string, toSection: string, index: number) => void;
  
  // API integration
  submitUrl?: string;
  submitMethod?: 'POST' | 'PUT' | 'PATCH';
  submitHeaders?: Record<string, string>;
  autoSubmit?: boolean;
  
  // Persistence
  storage?: {
    type: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'custom';
    key: string;
    encrypt?: boolean;
    compress?: boolean;
    ttl?: number; // time to live in seconds
  };
  
  // Localization
  locale?: string;
  translations?: Record<string, Record<string, string>>;
  
  // Security
  csrf?: string;
  sanitize?: boolean;
  allowHtml?: boolean;
  
  // Analytics
  tracking?: {
    enabled: boolean;
    events: string[];
    provider?: 'google' | 'mixpanel' | 'custom';
    config?: Record<string, any>;
  };
};

interface DynamicFormBuilderProps {
  config: FormBuilder;
  initialData?: Record<string, any>;
  mode?: 'design' | 'preview' | 'fill';
  onConfigChange?: (config: FormBuilder) => void;
  onDataChange?: (data: Record<string, any>) => void;
  onValidationChange?: (errors: Record<string, string[]>) => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  readonly?: boolean;
}

/**
 * Advanced Dynamic Form Builder Component
 * Supports complex form structures, validation, conditional logic, and more
 */
const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  config,
  initialData = {},
  mode = 'fill',
  onConfigChange,
  onDataChange,
  onValidationChange,
  className = '',
  style,
  disabled = false,
  readonly = false
}) => {
  // State management
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({});
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [validationCache, setValidationCache] = useState<Map<string, any>>(new Map());

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoized calculations
  const flattenedFields = useMemo(() => {
    const fields: FormField[] = [];
    
    const collectFields = (fieldsArray: FormField[]) => {
      fieldsArray.forEach(field => {
        fields.push(field);
        if (field.children) {
          collectFields(field.children);
        }
      });
    };

    config.sections.forEach(section => {
      collectFields(section.fields);
    });

    return fields;
  }, [config.sections]);

  const visibleFields = useMemo(() => {
    return flattenedFields.filter(field => {
      if (field.hidden) return false;
      
      if (field.conditionalLogic) {
        return evaluateConditionalLogic(field.conditionalLogic, formData);
      }
      
      return fieldVisibility[field.id] !== false;
    });
  }, [flattenedFields, formData, fieldVisibility]);

  const computedValues = useMemo(() => {
    const computed: Record<string, any> = {};
    
    flattenedFields.forEach(field => {
      if (field.computedValue) {
        computed[field.name] = field.computedValue(formData);
      }
    });
    
    return computed;
  }, [flattenedFields, formData]);

  // Helper functions
  const evaluateConditionalLogic = useCallback((logic: ConditionalLogic, data: Record<string, any>): boolean => {
    if (logic.custom) {
      return logic.custom(data);
    }

    if (logic.and) {
      return logic.and.every(condition => evaluateConditionalLogic(condition, data));
    }

    if (logic.or) {
      return logic.or.some(condition => evaluateConditionalLogic(condition, data));
    }

    const watchFields = Array.isArray(logic.when) ? logic.when : [logic.when];
    const values = watchFields.map(field => data[field]);

    // Single value checks
    if (logic.is !== undefined) {
      return values.some(value => value === logic.is);
    }

    if (logic.isNot !== undefined) {
      return values.every(value => value !== logic.isNot);
    }

    if (logic.in) {
      return values.some(value => logic.in!.includes(value));
    }

    if (logic.notIn) {
      return values.every(value => !logic.notIn!.includes(value));
    }

    if (logic.isEmpty !== undefined) {
      return values.some(value => logic.isEmpty ? !value : !!value);
    }

    if (logic.isNotEmpty !== undefined) {
      return values.some(value => logic.isNotEmpty ? !!value : !value);
    }

    if (logic.contains) {
      return values.some(value => String(value).includes(logic.contains!));
    }

    if (logic.startsWith) {
      return values.some(value => String(value).startsWith(logic.startsWith!));
    }

    if (logic.endsWith) {
      return values.some(value => String(value).endsWith(logic.endsWith!));
    }

    if (logic.greaterThan !== undefined) {
      return values.some(value => Number(value) > logic.greaterThan!);
    }

    if (logic.lessThan !== undefined) {
      return values.some(value => Number(value) < logic.lessThan!);
    }

    return true;
  }, []);

  const validateField = useCallback(async (field: FormField, value: unknown, allData: Record<string, unknown>): Promise<string[]> => {
    const errors: string[] = [];
    
    if (!field.validation) return errors;

    for (const rule of field.validation) {
      let isValid = true;
      
      switch (rule.type) {
        case 'required':
          isValid = value !== undefined && value !== null && value !== '';
          break;
          
        case 'minLength':
          if (rule.value !== undefined && typeof rule.value === 'number') {
            isValid = !value || String(value).length >= rule.value;
          }
          break;
          
        case 'maxLength':
          if (rule.value !== undefined && typeof rule.value === 'number') {
            isValid = !value || String(value).length <= rule.value;
          }
          break;
          
        case 'min':
          if (rule.value !== undefined && typeof rule.value === 'number') {
            isValid = !value || Number(value) >= rule.value;
          }
          break;
          
        case 'max':
          if (rule.value !== undefined && typeof rule.value === 'number') {
            isValid = !value || Number(value) <= rule.value;
          }
          break;
          
        case 'pattern':
          if (rule.value !== undefined && (typeof rule.value === 'string' || rule.value instanceof RegExp)) {
            isValid = !value || new RegExp(rule.value).test(String(value));
          }
          break;
          
        case 'email':
          isValid = !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
          break;
          
        case 'url':
          isValid = !value || /^https?:\/\/.+/.test(String(value));
          break;
          
        case 'custom':
          if (rule.validator) {
            const result = await rule.validator(value, allData);
            isValid = result;
          }
          break;
      }
      
      if (!isValid) {
        errors.push(rule.message);
      }
    }

    // Custom field validation
    if (field.onValidate) {
      const customError = field.onValidate(value, allData);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors;
  }, []);

  const validateForm = useCallback(async (data: Record<string, any> = formData): Promise<Record<string, string[]>> => {
    const allErrors: Record<string, string[]> = {};
    
    const validationPromises = visibleFields.map(async field => {
      const value = data[field.name];
      const fieldErrors = await validateField(field, value, data);
      if (fieldErrors.length > 0) {
        allErrors[field.name] = fieldErrors;
      }
    });

    await Promise.all(validationPromises);
    return allErrors;
  }, [formData, visibleFields, validateField]);

  const handleFieldChange = useCallback(async (fieldName: string, value: any) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    setIsDirty(true);
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Find the field
    const field = flattenedFields.find(f => f.name === fieldName);
    if (field?.onChange) {
      field.onChange(value, newData);
    }

    // Trigger validation if needed
    if (config.validationMode === 'onChange' || config.validationMode === 'all') {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      
      validationTimeoutRef.current = setTimeout(async () => {
        if (field) {
          const fieldErrors = await validateField(field, value, newData);
          setErrors(prev => ({
            ...prev,
            [fieldName]: fieldErrors
          }));
        }
      }, 300);
    }

    // Auto-save if enabled
    if (config.autoSave && config.autoSaveInterval) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveForm(newData);
      }, config.autoSaveInterval);
    }

    // Notify parent
    onDataChange?.(newData);
    config.onChange?.(newData, fieldName);
  }, [formData, flattenedFields, config, onDataChange, validateField]);

  const handleFieldBlur = useCallback(async (fieldName: string, value: any) => {
    const field = flattenedFields.find(f => f.name === fieldName);
    if (field?.onBlur) {
      field.onBlur(value, formData);
    }

    // Trigger validation if needed
    if (config.validationMode === 'onBlur' || config.validationMode === 'all') {
      if (field) {
        const fieldErrors = await validateField(field, value, formData);
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldErrors
        }));
      }
    }
  }, [flattenedFields, formData, config.validationMode, validateField]);

  const handleFieldFocus = useCallback((fieldName: string, value: any) => {
    const field = flattenedFields.find(f => f.name === fieldName);
    if (field?.onFocus) {
      field.onFocus(value, formData);
    }
  }, [flattenedFields, formData]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      const formErrors = await validateForm();
      setErrors(formErrors);
      onValidationChange?.(formErrors);

      const isValid = Object.keys(formErrors).length === 0;

      if (isValid || config.validationMode === 'onSubmit') {
        // Include computed values
        const submitData = { ...formData, ...computedValues };
        
        // Call submit handler
        await config.onSubmit?.(submitData, isValid);

        // API submission if configured
        if (config.submitUrl && isValid) {
          await submitToApi(submitData);
        }

        setIsDirty(false);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, computedValues, config, validateForm, onValidationChange]);

  const submitToApi = useCallback(async (data: Record<string, any>) => {
    if (!config.submitUrl) return;

    const response = await fetch(config.submitUrl, {
      method: config.submitMethod || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.submitHeaders,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API submission failed: ${response.statusText}`);
    }

    return response.json();
  }, [config]);

  const saveForm = useCallback((data: Record<string, any> = formData) => {
    if (!config.storage) return;

    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: config.version,
      });

      switch (config.storage.type) {
        case 'localStorage':
          localStorage.setItem(config.storage.key, serializedData);
          break;
        case 'sessionStorage':
          sessionStorage.setItem(config.storage.key, serializedData);
          break;
        // IndexedDB and custom storage would be implemented here
      }
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [formData, config]);

  const loadForm = useCallback(() => {
    if (!config.storage) return;

    try {
      let savedData: string | null = null;

      switch (config.storage.type) {
        case 'localStorage':
          savedData = localStorage.getItem(config.storage.key);
          break;
        case 'sessionStorage':
          savedData = sessionStorage.getItem(config.storage.key);
          break;
      }

      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Check TTL if configured
        if (config.storage.ttl) {
          const age = (Date.now() - parsed.timestamp) / 1000;
          if (age > config.storage.ttl) {
            return; // Data is too old
          }
        }

        setFormData(parsed.data);
        onDataChange?.(parsed.data);
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  }, [config, onDataChange]);

  const resetForm = useCallback(() => {
    const resetData: Record<string, any> = {};
    
    flattenedFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        resetData[field.name] = field.defaultValue;
      }
    });

    setFormData(resetData);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    onDataChange?.(resetData);
  }, [flattenedFields, onDataChange]);

  const addField = useCallback((sectionId: string, field: FormField, index?: number) => {
    if (mode !== 'design') return;

    const newConfig = { ...config };
    const section = newConfig.sections.find(s => s.id === sectionId);
    
    if (section) {
      if (index !== undefined) {
        section.fields.splice(index, 0, field);
      } else {
        section.fields.push(field);
      }
      
      onConfigChange?.(newConfig);
      config.onFieldAdd?.(field, sectionId);
    }
  }, [config, mode, onConfigChange]);

  const removeField = useCallback((fieldId: string) => {
    if (mode !== 'design') return;

    const newConfig = { ...config };
    
    newConfig.sections.forEach(section => {
      section.fields = section.fields.filter(field => field.id !== fieldId);
    });

    onConfigChange?.(newConfig);
    
    // Also remove from form data
    const newData = { ...formData };
    delete newData[fieldId];
    setFormData(newData);
    onDataChange?.(newData);
  }, [config, mode, onConfigChange, formData, onDataChange]);

  const moveField = useCallback((fieldId: string, fromSectionId: string, toSectionId: string, index: number) => {
    if (mode !== 'design') return;

    const newConfig = { ...config };
    const fromSection = newConfig.sections.find(s => s.id === fromSectionId);
    const toSection = newConfig.sections.find(s => s.id === toSectionId);
    
    if (fromSection && toSection) {
      const fieldIndex = fromSection.fields.findIndex(f => f.id === fieldId);
      if (fieldIndex !== -1) {
        const [field] = fromSection.fields.splice(fieldIndex, 1);
        toSection.fields.splice(index, 0, field);
        
        onConfigChange?.(newConfig);
        config.onFieldMove?.(fieldId, fromSectionId, toSectionId, index);
      }
    }
  }, [config, mode, onConfigChange]);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    
    config.onSectionChange?.(sectionId, !collapsedSections[sectionId]);
  }, [collapsedSections, config]);

  const exportForm = useCallback((format: 'json' | 'csv' | 'pdf') => {
    switch (format) {
      case 'json':
        const jsonData = JSON.stringify({ config, data: formData }, null, 2);
        downloadFile(jsonData, `form-${config.id}.json`, 'application/json');
        break;
        
      case 'csv':
        const csvData = convertToCSV(formData);
        downloadFile(csvData, `form-${config.id}.csv`, 'text/csv');
        break;
        
      case 'pdf':
        // PDF generation would be implemented here
        break;
    }
  }, [config, formData]);

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: Record<string, any>): string => {
    const headers = Object.keys(data);
    const values = Object.values(data);
    return [headers.join(','), values.join(',')].join('\n');
  };

  // Effects
  useEffect(() => {
    loadForm();
  }, [loadForm]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...initialData }));
  }, [initialData]);

  useEffect(() => {
    // Update field visibility based on conditional logic
    const newVisibility: Record<string, boolean> = {};
    
    flattenedFields.forEach(field => {
      if (field.conditionalLogic) {
        newVisibility[field.id] = evaluateConditionalLogic(field.conditionalLogic, formData);
      }
    });
    
    setFieldVisibility(newVisibility);
  }, [flattenedFields, formData, evaluateConditionalLogic]);

  // Render field based on type
  const renderField = useCallback((field: FormField) => {
    const value = formData[field.name] ?? field.defaultValue;
    const fieldErrors = errors[field.name] || [];
    const isInvalid = fieldErrors.length > 0;
    const isTouched = touched[field.name];

    if (field.render) {
      return field.render(field, value, (newValue) => handleFieldChange(field.name, newValue), fieldErrors);
    }

    const commonProps = {
      id: field.id,
      name: field.name,
      value,
      disabled: disabled || field.disabled,
      readOnly: readonly || field.readonly,
      required: field.required,
      placeholder: field.placeholder,
      className: `form-control ${field.className || ''} ${isInvalid ? 'is-invalid' : ''}`,
      style: field.style,
      onChange: (e: any) => {
        const newValue = field.type === 'checkbox' ? e.target.checked : e.target.value;
        handleFieldChange(field.name, newValue);
      },
      onBlur: () => handleFieldBlur(field.name, value),
      onFocus: () => handleFieldFocus(field.name, value),
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'tel':
      case 'search':
        return (
          <input
            type={field.type}
            {...commonProps}
            minLength={field.minLength}
            maxLength={field.maxLength}
            autoComplete={field.autoComplete}
            autoFocus={field.autoFocus}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 3}
            cols={field.cols}
            minLength={field.minLength}
            maxLength={field.maxLength}
          />
        );

      case 'select':
        return (
          <select {...commonProps} multiple={field.multiple}>
            {!field.required && !field.multiple && <option value="">Select an option</option>}
            {field.options?.map((option, index) => (
              <option key={index} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((option, index) => (
              <label key={index} className="radio-option">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  disabled={disabled || field.disabled || option.disabled}
                  onChange={() => handleFieldChange(field.name, option.value)}
                />
                {option.icon && <span className="radio-icon">{option.icon}</span>}
                <span className="radio-label">{option.label}</span>
                {option.description && <span className="radio-description">{option.description}</span>}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        if (field.options) {
          // Multiple checkboxes
          const selectedValues = Array.isArray(value) ? value : [];
          return (
            <div className="checkbox-group">
              {field.options.map((option, index) => (
                <label key={index} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    disabled={disabled || field.disabled || option.disabled}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      handleFieldChange(field.name, newValues);
                    }}
                  />
                  {option.icon && <span className="checkbox-icon">{option.icon}</span>}
                  <span className="checkbox-label">{option.label}</span>
                </label>
              ))}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <label className="checkbox-single">
              <input
                type="checkbox"
                checked={!!value}
                disabled={disabled || field.disabled}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              />
              <span className="checkbox-label">{field.label}</span>
            </label>
          );
        }

      case 'date':
      case 'datetime-local':
      case 'time':
      case 'month':
      case 'week':
        return (
          <input
            type={field.type}
            {...commonProps}
            min={field.min}
            max={field.max}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            {...commonProps}
            accept={field.accept}
            multiple={field.multiple}
            capture={field.capture}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              handleFieldChange(field.name, field.multiple ? files : files[0]);
            }}
          />
        );

      case 'range':
        return (
          <div className="range-field">
            <input
              type="range"
              {...commonProps}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            <span className="range-value">{value}</span>
          </div>
        );

      case 'color':
        return (
          <input
            type="color"
            {...commonProps}
          />
        );

      case 'divider':
        return <hr className="form-divider" />;

      case 'html':
        return field.description ? (
          <div
            className="html-content"
            dangerouslySetInnerHTML={{ __html: field.description }}
          />
        ) : null;

      default:
        return (
          <div className="unsupported-field">
            <p>Unsupported field type: {field.type}</p>
          </div>
        );
    }
  }, [formData, errors, touched, disabled, readonly, handleFieldChange, handleFieldBlur, handleFieldFocus]);

  const renderFieldWrapper = useCallback((field: FormField) => {
    if (!visibleFields.some(f => f.id === field.id)) return null;

    const fieldErrors = errors[field.name] || [];
    const hasErrors = fieldErrors.length > 0;

    return (
      <div
        key={field.id}
        className={`form-field ${field.type} ${hasErrors ? 'has-error' : ''} ${field.className || ''}`}
        style={field.style}
        data-field-id={field.id}
        data-field-type={field.type}
      >
        {/* Label */}
        {field.label && field.type !== 'checkbox' && (
          <label htmlFor={field.id} className="field-label">
            {field.renderLabel ? field.renderLabel() : field.label}
            {field.required && <span className="required-indicator">*</span>}
            {field.tooltip && (
              <span className="tooltip" title={field.tooltip}>
                <IoSettings size={14} />
              </span>
            )}
          </label>
        )}

        {/* Description */}
        {field.description && (
          <div className="field-description">
            {field.renderDescription ? field.renderDescription() : field.description}
          </div>
        )}

        {/* Field input */}
        <div className="field-input">
          {renderField(field)}
        </div>

        {/* Help text */}
        {field.helpText && (
          <div className="field-help">
            {field.helpText}
          </div>
        )}

        {/* Errors */}
        {hasErrors && (
          <div className="field-errors">
            {field.renderError ? (
              field.renderError(fieldErrors)
            ) : (
              fieldErrors.map((error, index) => (
                <span key={index} className="error-message">
                  {error}
                </span>
              ))
            )}
          </div>
        )}

        {/* Design mode controls */}
        {mode === 'design' && (
          <div className="field-controls">
            <button
              type="button"
              className="btn-control"
              onClick={() => setSelectedField(field.id)}
              title="Configure field"
            >
              <IoSettings size={16} />
            </button>
            <button
              type="button"
              className="btn-control"
              onClick={() => removeField(field.id)}
              title="Remove field"
            >
              <IoTrash size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }, [visibleFields, errors, mode, renderField, removeField, setSelectedField]);

  const renderSection = useCallback((section: FormSection) => {
    const isCollapsed = collapsedSections[section.id] || section.collapsed;
    const isVisible = !section.conditionalLogic || evaluateConditionalLogic(section.conditionalLogic, formData);

    if (!isVisible) return null;

    return (
      <div
        key={section.id}
        className={`form-section ${section.className || ''}`}
        style={section.style}
        data-section-id={section.id}
      >
        {/* Section header */}
        {(section.title || section.description) && (
          <div className="section-header">
            {section.title && (
              <h3 className="section-title">
                {section.icon && <span className="section-icon">{section.icon}</span>}
                {section.title}
                {section.collapsible && (
                  <button
                    type="button"
                    className="collapse-toggle"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={!isCollapsed}
                  >
                    {isCollapsed ? <IoChevronDown /> : <IoChevronUp />}
                  </button>
                )}
              </h3>
            )}
            {section.description && (
              <p className="section-description">{section.description}</p>
            )}
          </div>
        )}

        {/* Section content */}
        {!isCollapsed && (
          <div className="section-content">
            <div className={`fields-container ${config.layout}`}>
              {section.fields.map(renderFieldWrapper)}
            </div>
          </div>
        )}
      </div>
    );
  }, [collapsedSections, formData, evaluateConditionalLogic, toggleSection, config.layout, renderFieldWrapper]);

  return (
    <div
      className={`dynamic-form-builder ${mode} ${config.layout} ${className}`}
      style={style}
      data-form-id={config.id}
    >
      {/* Form header */}
      {config.title && (
        <div className="form-header">
          <h1 className="form-title">{config.title}</h1>
          {config.description && (
            <p className="form-description">{config.description}</p>
          )}
        </div>
      )}

      {/* Form toolbar */}
      {mode === 'design' && (
        <div className="form-toolbar">
          <div className="toolbar-group">
            <button type="button" className="btn btn-outline">
              <IoAdd /> Add Field
            </button>
            <button type="button" className="btn btn-outline">
              <IoCopy /> Duplicate
            </button>
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              <IoRefresh /> Reset
            </button>
          </div>
          <div className="toolbar-group">
            <button type="button" className="btn btn-outline" onClick={() => exportForm('json')}>
              <IoDownload /> Export
            </button>
            <button type="button" className="btn btn-outline">
              <IoEye /> Preview
            </button>
            <button type="button" className="btn btn-outline">
              <IoShare /> Share
            </button>
          </div>
        </div>
      )}

      {/* Form content */}
      <form
        ref={formRef}
        className="form-content"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Progress indicator */}
        {config.showProgress && (
          <div className="form-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(Object.keys(touched).length / visibleFields.length) * 100}%`
                }}
              />
            </div>
            <span className="progress-text">
              {Object.keys(touched).length} of {visibleFields.length} fields completed
            </span>
          </div>
        )}

        {/* Form sections */}
        <div className="form-sections">
          {config.sections.map(renderSection)}
        </div>

        {/* Form actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={resetForm}
            disabled={!isDirty}
          >
            <IoRefresh /> Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Submitting...
              </>
            ) : (
              <>
                <IoSave /> Submit
              </>
            )}
          </button>
        </div>
      </form>

      {/* Summary/footer */}
      {config.features?.export && (
        <div className="form-footer">
          <div className="export-options">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => exportForm('json')}
            >
              <IoDownload /> JSON
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => exportForm('csv')}
            >
              <IoDownload /> CSV
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => exportForm('pdf')}
            >
              <IoPrint /> PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFormBuilder;
