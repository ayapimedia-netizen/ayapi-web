"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  className = "",
  placeholder = "Pilih...",
  id,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle animation class timing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      // Small timeout to allow element to render before adding active class (triggering transition)
      timer = setTimeout(() => setAnimate(true), 10);
    } else {
      timer = setTimeout(() => setAnimate(false), 10);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Accessibility: keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" && isOpen) {
      e.preventDefault();
      // Move focus or select next option (simplified for basic keyboard support)
      const currentIndex = options.findIndex((opt) => opt.value === value);
      if (currentIndex < options.length - 1) {
        onChange(options[currentIndex + 1].value);
      }
    } else if (e.key === "ArrowUp" && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      if (currentIndex > 0) {
        onChange(options[currentIndex - 1].value);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      id={id}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-4 py-3 bg-white border rounded-2xl text-xs font-semibold flex items-center justify-between transition-all duration-300 shadow-sm ${
          disabled
            ? "bg-gray-50/50 text-gray-400 border-gray-200 cursor-not-allowed opacity-65"
            : isOpen
            ? "border-brand-red ring-4 ring-brand-red/10 text-gray-700 cursor-pointer hover:border-brand-red/30 focus:outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red"
            : "border-gray-200 text-gray-700 cursor-pointer hover:border-brand-red/30 focus:outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
            isOpen ? "transform rotate-180 text-brand-red" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Options Dropdown Menu */}
      {(isOpen || animate) && (
        <div
          role="listbox"
          className={`absolute z-50 left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-0 transition-all duration-200 origin-top ${
            animate
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left text-xs flex items-center justify-between transition-colors duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-brand-red/5 text-brand-red font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-brand-dark"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-brand-red"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
