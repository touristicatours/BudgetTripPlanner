import { useState, useEffect } from 'react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-warm text-white hover:shadow-lg hover:scale-105 focus:ring-orange-500',
    secondary: 'bg-gradient-sunset text-white hover:shadow-lg hover:scale-105 focus:ring-yellow-500',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 focus:ring-orange-500',
    ghost: 'text-orange-600 hover:bg-orange-100 focus:ring-orange-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Field({ label, error, children, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-400 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-400 resize-vertical ${className}`}
      {...props}
    />
  );
}

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ label, className = '', ...props }) {
  return (
    <label className={`flex items-center space-x-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
        {...props}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-orange-100 text-orange-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Alert({ children, variant = 'info', className = '' }) {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function Divider({ className = '' }) {
  return (
    <div className={`border-t border-gray-200 my-6 ${className}`} />
  );
}

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-orange-200 border-t-orange-600 ${sizes[size]} ${className}`} />
  );
}

// Simple toast notification system
export function showToast(message, type = 'info', duration = 5000) {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  const toastId = `toast-${Date.now()}`;
  toast.id = toastId;
  
  const variants = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.className = `${variants[type]} rounded-lg shadow-lg p-4 max-w-sm flex items-center space-x-3 transform translate-x-full transition-all duration-300`;
  toast.innerHTML = `
    <span class="text-lg">${icons[type]}</span>
    <span class="flex-1">${message}</span>
    <button class="text-white hover:text-gray-200" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);

  // Auto remove after duration
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, duration);
}


