import React from 'react';

interface AnymdIconProps {
  className?: string;
}

export const AnymdIcon: React.FC<AnymdIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="anymdBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a164d"/>
          <stop offset="100%" stopColor="#120a26"/>
        </linearGradient>
        <linearGradient id="anymdBeanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f472b6"/>
          <stop offset="100%" stopColor="#c084fc"/>
        </linearGradient>
        <linearGradient id="anymdCellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b1f66"/>
          <stop offset="100%" stopColor="#241142"/>
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="116" height="116" rx="34" fill="url(#anymdBgGrad)" stroke="#a855f7" strokeWidth="4"/>
      <rect x="18" y="18" width="42" height="42" rx="14" fill="url(#anymdCellGrad)" stroke="#7e22ce" strokeWidth="3"/>
      <rect x="68" y="18" width="42" height="42" rx="14" fill="url(#anymdCellGrad)" stroke="#7e22ce" strokeWidth="3"/>
      <rect x="18" y="68" width="42" height="42" rx="14" fill="url(#anymdCellGrad)" stroke="#7e22ce" strokeWidth="3"/>
      <rect x="68" y="68" width="42" height="42" rx="14" fill="url(#anymdCellGrad)" stroke="#7e22ce" strokeWidth="3"/>
      <path d="M 46 82 C 40 70, 52 56, 64 62 C 76 56, 88 70, 82 82 C 78 90, 50 90, 46 82 Z" fill="url(#anymdBeanGrad)" stroke="#fdf4ff" strokeWidth="3"/>
      <ellipse cx="40" cy="50" rx="8" ry="11" transform="rotate(-20 40 50)" fill="url(#anymdBeanGrad)" stroke="#fdf4ff" strokeWidth="2.5"/>
      <ellipse cx="56" cy="40" rx="8.5" ry="12" fill="url(#anymdBeanGrad)" stroke="#fdf4ff" strokeWidth="2.5"/>
      <ellipse cx="72" cy="40" rx="8.5" ry="12" fill="url(#anymdBeanGrad)" stroke="#fdf4ff" strokeWidth="2.5"/>
      <ellipse cx="88" cy="50" rx="8" ry="11" transform="rotate(20 88 50)" fill="url(#anymdBeanGrad)" stroke="#fdf4ff" strokeWidth="2.5"/>
      <ellipse cx="64" cy="70" rx="8" ry="4" fill="#ffffff" opacity="0.6"/>
      <ellipse cx="56" cy="36" rx="3.5" ry="5" fill="#ffffff" opacity="0.7"/>
      <ellipse cx="72" cy="36" rx="3.5" ry="5" fill="#ffffff" opacity="0.7"/>
      <ellipse cx="40" cy="46" rx="3" ry="4.5" transform="rotate(-20 40 46)" fill="#ffffff" opacity="0.7"/>
      <ellipse cx="88" cy="46" rx="3" ry="4.5" transform="rotate(20 88 46)" fill="#ffffff" opacity="0.7"/>
    </svg>
  );
};
