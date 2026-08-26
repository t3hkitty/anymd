import React from 'react';
import { Star } from 'lucide-react';

interface VaultFile {
  name: string;
  snippet: string;
  lastModified: string;
}

interface SpinesViewProps {
  files: VaultFile[];
  onSelectFile: (file: VaultFile) => void;
  starredFiles: Record<string, boolean>;
}

export const SpinesView: React.FC<SpinesViewProps> = ({
  files,
  onSelectFile,
  starredFiles,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-6 justify-start items-stretch h-80 overflow-y-auto font-mono text-[10px]">
      {files.map((file) => (
        <div
          key={file.name}
          onClick={() => onSelectFile(file)}
          className="w-10 bg-neutral-900 border border-neutral-800 hover:border-sky-400/50 hover:bg-neutral-800/80 rounded-md cursor-pointer flex flex-col justify-between items-center py-4 px-1.5 transition-all duration-200"
          title={file.name}
        >
          <div className="writing-vertical text-neutral-400 font-bold tracking-widest text-center truncate uppercase max-h-48 overflow-hidden select-none">
            {file.name.replace('.md', '').substring(0, 15)}
          </div>
          <Star size={10} className={starredFiles[file.name] ? 'text-amber-400 fill-amber-400' : 'text-neutral-600'} />
        </div>
      ))}
    </div>
  );
};
