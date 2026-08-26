import React from 'react';
import { Star } from 'lucide-react';

interface VaultFile {
  name: string;
  snippet: string;
  lastModified: string;
}

interface GridViewProps {
  files: VaultFile[];
  onSelectFile: (file: VaultFile) => void;
  starredFiles: Record<string, boolean>;
  onToggleStar: (filename: string) => void;
}

export const GridView: React.FC<GridViewProps> = ({
  files,
  onSelectFile,
  starredFiles,
  onToggleStar,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 font-mono text-xs">
      {files.map((file) => {
        const isStarred = !!starredFiles[file.name];
        return (
          <div
            key={file.name}
            onClick={() => onSelectFile(file)}
            className="group relative bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 rounded-lg flex flex-col justify-between h-36 cursor-pointer transition-all duration-200"
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-neutral-200 group-hover:text-sky-300 transition-colors line-clamp-1">
                  {file.name.replace('.md', '')}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(file.name);
                  }}
                  className="text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Star size={12} fill={isStarred ? 'currentColor' : 'none'} className={isStarred ? 'text-amber-400' : ''} />
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-2 line-clamp-3">
                {file.snippet || 'No preview available.'}
              </p>
            </div>
            <div className="text-[9px] text-neutral-600 text-right mt-1">
              {file.lastModified}
            </div>
          </div>
        );
      })}
    </div>
  );
};
