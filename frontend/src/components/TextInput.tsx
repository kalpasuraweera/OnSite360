import React from "react";

interface TextInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  className = "",
  placeholder = "",
}) => (
  <div className="form-control">
    <label htmlFor={id} className="label">
      <span className="label-text mb-3">{label}</span>
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className={`input input-bordered w-full ${className}`}
      placeholder={placeholder}
    />
  </div>
);

export default TextInput;