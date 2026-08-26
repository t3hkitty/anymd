import React from 'react';
import { Star } from 'lucide-react';

interface VaultFile {
  name: string;
  snippet: string;
  lastModified: string;
}

interface ListViewProps {
  files: VaultFile[];
  onSelectFile: (file: VaultFile) => void;
  starredFiles: Record<string, boolean>;
  onToggleStar: (filename: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  files,
  onSelectFile,
  starredFiles,
  onToggleStar,
}) => {
  return (
    <div className="p-6 overflow-x-auto font-mono text-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 text-neutral-500">
            <th className="py-2.5 px-4">Name</th>
            <th className="py-2.5 px-4">Snippet</th>
            <th className="py-2.5 px-4 text-right">Modified</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const isStarred = !!starredFiles[file.name];
            return (
              <tr
                key={file.name}
                onClick={() => onSelectFile(file)}
                className="border-b border-neutral-900 hover:bg-neutral-900/40 cursor-pointer text-neutral-300 transition-colors group"
              >
                <td className="py-2.5 px-4 font-bold flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(file.name);
                    }}
                    className="text-neutral-600 hover:text-amber-400 cursor-pointer"
                  >
                    <Star size={10} fill={isStarred ? 'currentColor' : 'none'} className={isStarred ? 'text-amber-400' : ''} />
                  </button>
                  <span className="group-hover:text-sky-300 line-clamp-1">
                    {file.name.replace('.md', '')}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-neutral-500 line-clamp-1 max-w-md">
                  {file.snippet}
                </td>
                <td className="py-2.5 px-4 text-right text-neutral-600">
                  {file.lastModified}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
