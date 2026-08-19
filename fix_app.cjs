const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Imports
content = content.replace(
  "import { BookcaseIcon } from './components/BookcaseIcon';",
  "import { BookcaseIcon } from './components/BookcaseIcon';\nimport { DynamicAtmosphericBackground, WidgetPanel } from '@lorik/shared-kawaii-ui';"
);

// 2. Add Paintbrush icon
content = content.replace(
  "Lock, Share2, Import",
  "Lock, Share2, Import, Paintbrush"
);

// 3. Add THEME_SET_KEY
content = content.replace(
  "const HAS_SEEN_ONBOARDING_KEY = 'lc_md_has_seen_onboarding_v3';",
  "const HAS_SEEN_ONBOARDING_KEY = 'lc_md_has_seen_onboarding_v3';\nconst THEME_SET_KEY = 'blackbox_theme_style_set_v1';"
);

// 4. Add state
content = content.replace(
  "const [vaultMode, setVaultMode] = useState<VaultMode>(getSavedVaultMode);",
  `const [themeStyleSet, setThemeStyleSetState] = useState(() => {
    return localStorage.getItem(THEME_SET_KEY) || 'classic';
  });
  const handleSelectThemeStyleSet = (newTheme: string) => {
    setThemeStyleSetState(newTheme);
    localStorage.setItem(THEME_SET_KEY, newTheme);
  };
  const [vaultMode, setVaultMode] = useState<VaultMode>(getSavedVaultMode);`
);

// 5. Inject background
content = content.replace(
  '<div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">',
  '<div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950 relative">\n      <DynamicAtmosphericBackground activeC4Scene="all" themeStyleSet={themeStyleSet} />'
);

// 6. Make header transparent
content = content.replace(
  '<div className="w-full bg-slate-950 border-b border-slate-800/90 px-6 py-2.5 flex items-center justify-between shadow-xl sticky top-0 z-50 flex-wrap gap-2 backdrop-blur-md">',
  '<div className="w-full bg-slate-950/70 border-b border-slate-800/90 px-6 py-2.5 flex items-center justify-between shadow-xl sticky top-0 z-50 flex-wrap gap-2 backdrop-blur-md">'
);

// 7. Inject theme picker
content = content.replace(
  '<div className="flex items-center space-x-2 flex-wrap gap-y-2">',
  `<div className="flex items-center space-x-2 flex-wrap gap-y-2">
          
          <div className="flex items-center space-x-2 mr-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-md">
            <Paintbrush className="w-4 h-4 text-amber-400 ml-2" />
            <select
              value={themeStyleSet}
              onChange={(e) => handleSelectThemeStyleSet(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none pr-2 cursor-pointer"
            >
              <option value="classic">Classic / Glassmorphism</option>
              <option value="cute">🌸 Kawaii Pastel</option>
              <option value="silly">🤪 Silly Chaos</option>
            </select>
          </div>`
);

// 8. Wrap Library Grid in WidgetPanel
content = content.replace(
  '<div className="h-[calc(100vh-120px)] max-w-6xl mx-auto">',
  '<WidgetPanel title="Library Collection" icon={<BookcaseIcon className="w-4 h-4"/>}>\n              <div className="h-[calc(100vh-180px)] max-w-6xl mx-auto overflow-y-auto">'
);
content = content.replace(
  /onOpenInspector=\{\(b\) => \{\n\s*setInspectingBook\(b\);\n\s*setIsBookInspectorOpen\(true\);\n\s*\}\}\n\s*\/>\n\s*<\/div>/,
  `onOpenInspector={(b) => {
                  setInspectingBook(b);
                  setIsBookInspectorOpen(true);
                }}
              />
            </div>
            </WidgetPanel>`
);

fs.writeFileSync('src/App.tsx', content);
