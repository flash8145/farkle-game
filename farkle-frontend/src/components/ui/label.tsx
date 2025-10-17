import * as React from "react";

// ============================================
// LABEL COMPONENT
// ============================================

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className = "", 
    children,
    required = false,
    optional = false,
    error = false,
    disabled = false,
    size = 'md',
    tooltip,
    ...props 
  }, ref) => {
    const baseStyles = "block font-semibold transition-colors duration-200";
    
    const sizeStyles = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base"
    };

    const colorStyles = error
      ? "text-red-600 dark:text-red-400"
      : disabled
      ? "text-gray-400 dark:text-gray-600"
      : "text-gray-700 dark:text-gray-300";

    const cursorStyle = disabled ? "cursor-not-allowed" : "cursor-pointer";

    const labelStyles = `${baseStyles} ${sizeStyles[size]} ${colorStyles} ${cursorStyle} ${className}`;

    return (
      <label
        ref={ref}
        className={labelStyles}
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {children}
          
          {required && (
            <span className="text-red-500" aria-label="required">
              *
            </span>
          )}
          
          {optional && (
            <span className="text-gray-400 text-xs font-normal">
              (optional)
            </span>
          )}

          {tooltip && (
            <span
              className="group relative inline-flex"
              aria-label={tooltip}
            >
              <svg
                className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              
              {/* Tooltip */}
              <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs font-normal text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap z-50">
                {tooltip}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></span>
              </span>
            </span>
          )}
        </span>
      </label>
    );
  }
);

Label.displayName = "Label";

// ============================================
// FORM FIELD COMPONENT (Label + Input wrapper)
// ============================================

export interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  helperText?: string;
  tooltip?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  optional = false,
  error,
  helperText,
  tooltip,
  children,
  htmlFor,
}) => {
  const fieldId = React.useId();
  const errorId = React.useId();
  const helperId = React.useId();
  const inputId = htmlFor || fieldId;

  return (
    <div className="w-full space-y-2">
      <Label
        htmlFor={inputId}
        required={required}
        optional={optional}
        error={!!error}
        tooltip={tooltip}
      >
        {label}
      </Label>

      <div className="w-full">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              id: inputId,
              'aria-invalid': error ? 'true' : 'false',
              'aria-describedby': error
                ? errorId
                : helperText
                ? helperId
                : undefined,
            })
          : children}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          id={helperId}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

// ============================================
// FIELD GROUP COMPONENT (Multiple fields in a row)
// ============================================

export interface FieldGroupProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  children,
  cols = 1,
  gap = 4,
}) => {
  const colStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapStyles = {
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div className={`grid ${colStyles[cols]} ${gapStyles[gap]}`}>
      {children}
    </div>
  );
};

// ============================================
// SECTION LABEL (For grouping form sections)
// ============================================

export interface SectionLabelProps {
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  description,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {children}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export { Label };
export default Label;