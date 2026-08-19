const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(
  "import { LibraryGridPluginView } from './components/LibraryGridPluginView';",
  "import { LibraryGridPluginView } from './components/LibraryGridPluginView';\nimport { VaultWebhookGeneratorWidget } from './components/VaultWebhookGeneratorWidget';"
);

const libStart = `<WidgetPanel title="Library Collection" icon={<BookcaseIcon className="w-4 h-4"/>}>`;
const libReplacement = `<div className="flex flex-col gap-6 h-full">
            <div className="flex-none max-w-xl mx-auto w-full">
              <VaultWebhookGeneratorWidget />
            </div>
            <div className="flex-1 min-h-0">
              <WidgetPanel title="Library Collection" icon={<BookcaseIcon className="w-4 h-4"/>}>`;

c = c.replace(libStart, libReplacement);

const libEnd = `</WidgetPanel>
          )}`;
const endReplacement = `</WidgetPanel>
            </div>
          </div>
          )}`;

c = c.replace(libEnd, endReplacement);

fs.writeFileSync('src/App.tsx', c);
