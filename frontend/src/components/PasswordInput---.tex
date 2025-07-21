import React, { useState } from "react";

interface PasswordInputProps {
  id?: string;
  name?: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  showGenerator?: boolean;
  onGenerate?: (password: string) => void;
  labelClassName?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  label,
  value,
  defaultValue,
  onChange,
  className = "",
  placeholder = "",
  required = false,
  showGenerator = false,
  onGenerate,
  labelClassName = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePassword = async () => {
    setIsGenerating(true);
    
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Call the onGenerate callback if provided
    if (onGenerate) {
      onGenerate(password);
    }
    
    // For controlled inputs with onChange handler
    if (onChange) {
      console.log('Using controlled input mode'); // Debug log
      const event = {
        target: { value: password }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    } else {
      // For uncontrolled inputs, set the value directly using name or id
      const input = (name ? document.querySelector(`input[name="${name}"]`) : 
                     id ? document.getElementById(id) : null) as HTMLInputElement;
      if (input) {
        input.value = password;
        // Trigger a change event to ensure form validation and other listeners work
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
      }
    }
    
    // Brief visual feedback
    setTimeout(() => {
      setIsGenerating(false);
    }, 200);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-control">
      <label htmlFor={id} className="label">
        <span className={`label-text ${labelClassName || 'mb-3'}`}>{label}</span>
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={`input input-bordered w-full pr-20 ${className}`}
          placeholder={placeholder}
          required={required}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {showGenerator && (
            <button
              type="button"
              onClick={generatePassword}
              className={`btn btn-ghost btn-xs p-1 h-6 w-6 min-h-0 ${isGenerating ? 'animate-spin' : ''}`}
              title="Generate Password"
              disabled={isGenerating}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="btn btn-ghost btn-xs p-1 h-6 w-6 min-h-0"
            title={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.757 7.757M12 12l2.122 2.122M12 12L9.878 9.878m2.122 2.122L14.121 14.121M12 12l2.122-2.122"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordInput;
