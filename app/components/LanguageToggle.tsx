"use client"
import React from 'react';
import { Languages } from "lucide-react";

interface LanguageToggleProps {
  currentLang: string;
  onToggleAction: () => void;
  label: string;
}

export const LanguageToggle = ({ currentLang, onToggleAction, label }: LanguageToggleProps) => {
  return (
    <button 
      onClick={onToggleAction}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all font-medium text-sm"
    >
      <Languages className="w-4 h-4" />
      {label}
    </button>
  );
};