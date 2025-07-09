import { useState, type KeyboardEvent } from 'react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
}

const TagsInput = ({ 
  value = [], 
  onChange, 
  placeholder = "Type and press Enter to add tags",
  disabled = false,
  className = "",
  maxTags
}: TagsInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      if (!maxTags || value.length < maxTags) {
        onChange([...value, trimmedTag]);
      }
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(value.length - 1);
    } else if (e.key === ',' || e.key === ';') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Prevent adding comma or semicolon to input
    if (newValue.includes(',') || newValue.includes(';')) {
      addTag(newValue.replace(/[,;]/g, ''));
    } else {
      setInputValue(newValue);
    }
  };

  return (
    <div className={`tags-input-container ${className}`}>
      <div className="flex flex-wrap gap-2 p-3 border border-base-300 rounded-lg bg-base-100 min-h-[48px] focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2">
        {/* Render existing tags */}
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-content rounded-md text-sm"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:bg-primary-focus rounded-full w-4 h-4 flex items-center justify-center text-xs"
                aria-label={`Remove ${tag} tag`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        
        {/* Input field */}
        {(!maxTags || value.length < maxTags) && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-base-content placeholder-base-content/50"
          />
        )}
      </div>
      
      {/* Helper text */}
      <div className="text-xs text-base-content/60 mt-1">
        {maxTags && (
          <span className="mr-4">
            {value.length}/{maxTags} tags
          </span>
        )}
        Press Enter, comma, or semicolon to add tags
      </div>
    </div>
  );
};

export default TagsInput;
