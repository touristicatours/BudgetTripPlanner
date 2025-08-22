"use client";

import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...rest }, ref) => {
    const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<ButtonVariant, string> = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600",
      secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-300",
      ghost: "bg-transparent text-gray-800 hover:bg-gray-100 focus-visible:ring-gray-300",
    };

    return (
      <button 
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`} 
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };


