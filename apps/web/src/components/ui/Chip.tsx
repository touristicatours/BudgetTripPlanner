"use client";
import * as React from "react";

type ChipProps = {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function Chip({ children, active = false, onClick, className = "" }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm transition-all border ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      } ${className}`}
    >
      {children}
    </button>
  );
}


