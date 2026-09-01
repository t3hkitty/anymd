/**
 * Zettelkasten ID: 20260826-1838
 * Project: @lorik/meow-core
 * Role: Tailwind Presets for High-Density Kawaii Brutalism [cite: 300, 333]
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // High-Density Kawaii Brutalist Palette [cite: 8, 15, 107]
        meow: {
          violet: '#2E1A47',      // Primary Deep Purple
          lavender: '#E6E6FA',    // Soft Accent Lavender
          slate: '#1E1E2E',       // Sharp Slate Gray
          cream: '#FFFDF5',       // Anti-Glare Background Cream [cite: 308]
          emerald: '#D1FAE5',     // Soft Pastel Green
          rose: '#FFE4E6'         // Soft Pastel Pink
        }
      },
      borderRadius: {
        none: '0px'               // Strict 0px Border-Radius Limit [cite: 107, 300]
      },
      boxShadow: {
        // Flat, zero-blur brutalist offset shadows [cite: 107, 300]
        brutalist: '4px 4px 0px 0px rgba(30, 30, 46, 1)',
        'brutalist-hover': '2px 2px 0px 0px rgba(30, 30, 46, 1)'
      },
      borderWidth: {
        3: '3px'
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      // Add custom responsive utilities for micro-paddings and scroll borders [cite: 107, 300]
      addUtilities({
        '.brutalist-border': {
          border: '2px solid #1E1E2E'
        },
        '.brutalist-button': {
          border: '2px solid #1E1E2E',
          borderRadius: '0px',
          transition: 'all 0.1s ease',
          '&:active': {
            transform: 'translate(2px, 2px)',
            boxShadow: '0px 0px 0px 0px rgba(30,30,46,1)'
          }
        }
      });
    }
  ]
};
