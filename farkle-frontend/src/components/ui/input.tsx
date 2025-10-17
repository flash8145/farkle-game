import * as React from "react";

// ============================================
// INPUT COMPONENT
// ============================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = "", 
    type = "text",
    error,
    label,
    helperText,
    leftIcon,
    rightIcon,
    disabled,
    ...props 
  }, ref) => {
    const inputId = React.useId();
    const errorId = React.useId();
    const helperId = React.useId();

    const baseStyles = "w-full rounded-lg border-2 bg-white dark:bg-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const normalStyles = "border-gray-300 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500";
    const errorStyles = "border-red-500 focus:border-red-500 focus:ring-red-500";
    
    const paddingStyles = leftIcon && rightIcon 
      ? "pl-12 pr-12" 
      : leftIcon 
      ? "pl-12 pr-4" 
      : rightIcon 
      ? "pl-4 pr-12" 
      : "px-4";
    
    const sizeStyles = "py-3 text-base";

    const inputStyles = `${baseStyles} ${error ? errorStyles : normalStyles} ${paddingStyles} ${sizeStyles} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={inputStyles}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4"
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
            className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ============================================
// SPECIALIZED INPUT VARIANTS
// ============================================

/**
 * Game Code Input - Automatically uppercase, max 6 characters
 */
export const GameCodeInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'maxLength'>>(
  (props, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = e.target.value.toUpperCase();
      props.onChange?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        maxLength={6}
        placeholder="ABC123"
        className="text-center text-2xl font-bold tracking-widest uppercase"
        {...props}
        onChange={handleChange}
        leftIcon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
            />
          </svg>
        }
      />
    );
  }
);

GameCodeInput.displayName = "GameCodeInput";

/**
 * Player Name Input - With character limit
 */
export const PlayerNameInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'maxLength'>>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        maxLength={50}
        placeholder="Enter your name"
        {...props}
        leftIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />
    );
  }
);

PlayerNameInput.displayName = "PlayerNameInput";

/**
 * Search Input - With search icon
 */
export const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        placeholder="Search..."
        {...props}
        leftIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

// ============================================
// EXPORTS
// ============================================

export { Input };
export default Input;