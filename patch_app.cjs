const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('VaultWebhookGeneratorWidget')) {
  content = content.replace(
    "import { LibraryGridPluginView } from './components/LibraryGridPluginView';",
    "import { LibraryGridPluginView } from './components/LibraryGridPluginView';\nimport { VaultWebhookGeneratorWidget } from './components/VaultWebhookGeneratorWidget';"
  );
}

// Just match the start of the Library View WidgetPanel
const libStart = `<WidgetPanel title="Library Collection" icon={<BookcaseIcon className="w-4 h-4"/>}>`;
const replacement = `<div className="flex flex-col gap-6 h-full">
            <div className="flex-none max-w-xl mx-auto w-full">
              <VaultWebhookGeneratorWidget />
            </div>
            <div className="flex-1 min-h-0">
              <WidgetPanel title="Library Collection" icon={<BookcaseIcon className="w-4 h-4"/>}>`;

if (content.includes(libStart)) {
  content = content.replace(libStart, replacement);
  // Also need to close the two extra divs after the WidgetPanel closes
  
  const libEnd = `</WidgetPanel>
        )}

        {activeView === 'split' && (`;
        
  const endReplacement = `</WidgetPanel>
            </div>
          </div>
        )}

        {activeView === 'split' && (`;
  
  content = content.replace(libEnd, endReplacement);
  
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched App.tsx for webhook widget!");
} else {
  console.log("Could not find library view block to patch.");
}
