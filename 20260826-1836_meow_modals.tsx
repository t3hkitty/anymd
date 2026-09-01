/**
 * Zettelkasten ID: 20260826-1836
 * Project: @lorik/meow-core
 * Role: High-Density FAQ & Changelog Modals with Esc / Click-Outside Triggers [cite: 615]
 */

import React, { useEffect, useRef } from 'react';

interface MeowModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MeowModal: React.FC<MeowModalProps> = ({ isOpen, onClose, title, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Esc-Key Trigger for instant modal closure [cite: 615]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Click-Outside Trigger [cite: 615]
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono">
      <div 
        ref={containerRef}
        className="w-full max-w-lg bg-[#FFFDF5] border-4 border-slate-900 p-4 shadow-[6px_6px_0_0_#1e1e2e] relative"
      >
        {/* Header bar */}
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-4">
          <h3 className="text-md font-black tracking-wider uppercase text-slate-900">🐾 {title}</h3>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-rose-200 border-2 border-slate-900 font-bold hover:bg-rose-300 active:translate-y-0.5"
            title="Close [Esc]"
          >
            ✕
          </button>
        </div>
        
        {/* Modal content body */}
        <div className="text-xs leading-relaxed text-slate-800 max-h-[60vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
