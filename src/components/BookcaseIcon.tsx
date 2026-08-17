import React from 'react';

interface BookcaseIconProps {
  className?: string;
}

export const BookcaseIcon: React.FC<BookcaseIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Mahogany Wood Gradient */}
        <linearGradient id="mahogany" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4a1d0f" />
          <stop offset="50%" stopColor="#2c0e06" />
          <stop offset="100%" stopColor="#1a0703" />
        </linearGradient>

        {/* Gold Filigree Gradient */}
        <linearGradient id="goldFiligree" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Magical Warm Shelf Glow */}
        <radialGradient id="shelfGlow" cx="32" cy="32" r="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Magical Ambient Aura */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#shelfGlow)" />

      {/* Main Ornate Grand Bookcase Frame */}
      <path
        d="M 12 14 C 12 8, 52 8, 52 14 L 52 56 L 12 56 Z"
        fill="url(#mahogany)"
        stroke="url(#goldFiligree)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Grand Arch Crown & Rose Filigree Accent */}
      <path
        d="M 10 14 C 20 6, 44 6, 54 14"
        stroke="url(#goldFiligree)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="9" r="2.5" fill="#fbbf24" />
      <path d="M 28 11 C 32 7, 32 7, 36 11" stroke="#f59e0b" strokeWidth="1.5" fill="none" />

      {/* Mahogany Shelves (3 Tiers) */}
      {/* Top Shelf */}
      <line x1="14" y1="26" x2="50" y2="26" stroke="url(#goldFiligree)" strokeWidth="2" strokeLinecap="round" />
      {/* Middle Shelf */}
      <line x1="14" y1="40" x2="50" y2="40" stroke="url(#goldFiligree)" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom Shelf */}
      <line x1="14" y1="53" x2="50" y2="53" stroke="url(#goldFiligree)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Top Tier Books (Ruby, Gold, Sapphire) */}
      <rect x="16" y="16" width="4" height="10" rx="0.8" fill="#ef4444" />
      <rect x="21" y="15" width="5" height="11" rx="0.8" fill="#3b82f6" />
      <rect x="27" y="17" width="4" height="9" rx="0.8" fill="#10b981" />
      <rect x="32" y="14" width="6" height="12" rx="0.8" fill="#f59e0b" stroke="#fbbf24" strokeWidth="0.5" />
      <rect x="39" y="16" width="4" height="10" rx="0.8" fill="#8b5cf6" />
      <rect x="44" y="17" width="5" height="9" rx="0.8" fill="#ec4899" />

      {/* Middle Tier Books (Emerald, Crimson, Amethyst) */}
      <rect x="16" y="29" width="5" height="11" rx="0.8" fill="#059669" />
      <rect x="22" y="30" width="4" height="10" rx="0.8" fill="#dc2626" />
      <rect x="27" y="28" width="6" height="12" rx="0.8" fill="#d97706" stroke="#fbbf24" strokeWidth="0.5" />
      <rect x="34" y="31" width="4" height="9" rx="0.8" fill="#2563eb" />
      <rect x="39" y="29" width="5" height="11" rx="0.8" fill="#7c3aed" />
      <rect x="45" y="30" width="4" height="10" rx="0.8" fill="#e11d48" />

      {/* Bottom Tier Books */}
      <rect x="16" y="43" width="6" height="10" rx="0.8" fill="#b45309" />
      <rect x="23" y="42" width="5" height="11" rx="0.8" fill="#047857" />
      <rect x="29" y="44" width="4" height="9" rx="0.8" fill="#1d4ed8" />
      <rect x="34" y="42" width="6" height="11" rx="0.8" fill="#c026d3" />

      {/* Iconic Rolling Library Ladder (Leaning Right to Left) */}
      {/* Left Rail */}
      <line x1="42" y1="12" x2="33" y2="55" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
      {/* Right Rail */}
      <line x1="47" y1="12" x2="38" y2="55" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
      {/* Ladder Rungs */}
      <line x1="42" y1="19" x2="47" y2="19" stroke="#f59e0b" strokeWidth="1.2" />
      <line x1="40" y1="28" x2="45" y2="28" stroke="#f59e0b" strokeWidth="1.2" />
      <line x1="38" y1="37" x2="43" y2="37" stroke="#f59e0b" strokeWidth="1.2" />
      <line x1="36" y1="46" x2="41" y2="46" stroke="#f59e0b" strokeWidth="1.2" />
      {/* Brass Ladder Wheels */}
      <circle cx="33" cy="55" r="1.5" fill="#f59e0b" />
      <circle cx="38" cy="55" r="1.5" fill="#f59e0b" />

      {/* Sparkle Glow Dust */}
      <path d="M 12 20 L 14 20 M 13 19 L 13 21" stroke="#fef08a" strokeWidth="1" />
      <path d="M 50 34 L 52 34 M 51 33 L 51 35" stroke="#fef08a" strokeWidth="1" />
    </svg>
  );
};
