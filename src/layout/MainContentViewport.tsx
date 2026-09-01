import React from 'react';
import { Star, FileText } from 'lucide-react';
import type { ViewLayoutType } from './ViewSwitcherBar';

interface VaultFile {
  name: string;
  snippet: string;
  lastModified: string;
}

interface MainContentViewportProps {
  layout: ViewLayoutType;
  files: VaultFile[];
  onSelectFile: (file: VaultFile) => void;
  starredFiles: Record<string, boolean>;
  onToggleStar: (filename: string) => void;
  selectedFileNames?: string[];
  onToggleSelectFile?: (filename: string) => void;
  onToggleSelectAll?: () => void;
}

export const MainContentViewport: React.FC<MainContentViewportProps> = ({
  layout,
  files,
  onSelectFile,
  starredFiles,
  onToggleStar,
  selectedFileNames = [],
  onToggleSelectFile,
  onToggleSelectAll,
}) => {
  if (files.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 font-mono text-xs">
        <pre className="mb-4 text-neutral-600">
{`   /\\_/\\
  ( -.- )
   > ~ <
 Empty Vault`}
        </pre>
        <span>No markdown files found. Add samples or select a directory!</span>
      </div>
    );
  }

  const renderCard = (file: VaultFile) => {
    const isStarred = !!starredFiles[file.name];
    const isSelected = selectedFileNames.includes(file.name);
    return (
      <div
        key={file.name}
        onClick={() => onSelectFile(file)}
        className={`group relative bg-neutral-900 border ${
          isSelected ? 'border-indigo-500 bg-indigo-950/20' : 'border-neutral-800 hover:border-neutral-700'
        } p-4 rounded-lg flex flex-col justify-between h-36 cursor-pointer transition-all duration-200`}
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onClick={(e) => e.stopPropagation()}
                onChange={() => onToggleSelectFile && onToggleSelectFile(file.name)}
                className="accent-indigo-500 w-4 h-4 rounded cursor-pointer shrink-0"
              />
              <h3 className="font-bold font-mono text-xs text-neutral-200 group-hover:text-sky-300 transition-colors line-clamp-1">
                {file.name.replace('.md', '')}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(file.name);
              }}
              className="text-neutral-500 hover:text-amber-400 transition-colors shrink-0"
            >
              <Star size={12} fill={isStarred ? 'currentColor' : 'none'} className={isStarred ? 'text-amber-400' : ''} />
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 font-mono mt-2 line-clamp-3">
            {file.snippet || 'No preview available.'}
          </p>
        </div>
        <div className="text-[9px] text-neutral-600 font-mono text-right mt-1">
          {file.lastModified}
        </div>
      </div>
    );
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {files.map(renderCard)}
    </div>
  );

  const renderList = () => {
    const isAllSelected = files.length > 0 && selectedFileNames.length === files.length;
    return (
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500">
              <th className="py-2.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-4">Name</th>
              <th className="py-2.5 px-4">Snippet</th>
              <th className="py-2.5 px-4 text-right">Modified</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const isStarred = !!starredFiles[file.name];
              const isSelected = selectedFileNames.includes(file.name);
              return (
                <tr
                  key={file.name}
                  onClick={() => onSelectFile(file)}
                  className={`border-b border-neutral-900 ${
                    isSelected ? 'bg-indigo-950/30' : 'hover:bg-neutral-900/40'
                  } cursor-pointer text-neutral-300 transition-colors group`}
                >
                  <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectFile && onToggleSelectFile(file.name)}
                      className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-4 font-bold flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(file.name);
                      }}
                      className="text-neutral-600 hover:text-amber-400"
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

  const render3D = () => (
    <div className="p-12 flex justify-center items-center h-80 overflow-hidden relative">
      <div className="relative w-72 h-44">
        {files.slice(0, 5).map((file, idx) => {
          const depth = idx * 12;
          const scale = 1 - idx * 0.05;
          const opacity = 1 - idx * 0.2;
          return (
            <div
              key={file.name}
              onClick={() => onSelectFile(file)}
              style={{
                transform: `translate3d(${depth}px, -${depth}px, 0) scale(${scale})`,
                zIndex: 10 - idx,
                opacity: opacity,
              }}
              className="absolute inset-0 bg-neutral-900 border border-neutral-800 hover:border-sky-500/50 p-4 rounded-xl flex flex-col justify-between shadow-2xl cursor-pointer transition-all duration-300"
            >
              <div>
                <h4 className="font-bold font-mono text-xs text-sky-400">{file.name.replace('.md', '')}</h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-2 line-clamp-2">{file.snippet}</p>
              </div>
              <span className="text-[8px] text-neutral-600 font-mono text-right">{file.lastModified}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSpines = () => (
    <div className="flex flex-wrap gap-2 p-6 justify-start items-stretch h-80 overflow-y-auto">
      {files.map((file) => (
        <div
          key={file.name}
          onClick={() => onSelectFile(file)}
          className="w-10 bg-neutral-900 border border-neutral-800 hover:border-sky-400/50 hover:bg-neutral-800/80 rounded-md cursor-pointer flex flex-col justify-between items-center py-4 px-1.5 transition-all duration-200"
          title={file.name}
        >
          <div className="writing-vertical text-neutral-400 font-mono text-[10px] font-bold tracking-widest text-center truncate uppercase max-h-48 overflow-hidden select-none">
            {file.name.replace('.md', '').substring(0, 15)}
          </div>
          <Star size={10} className={starredFiles[file.name] ? 'text-amber-400 fill-amber-400' : 'text-neutral-600'} />
        </div>
      ))}
    </div>
  );

  const renderHangers = () => (
    <div className="p-6 flex flex-col space-y-3">
      {files.map((file) => (
        <div
          key={file.name}
          onClick={() => onSelectFile(file)}
          className="flex items-center space-x-4 bg-neutral-900/30 hover:bg-neutral-900/80 border-l-2 border-sky-500 p-2.5 rounded-r-lg cursor-pointer transition-all duration-200"
        >
          <div className="font-mono text-neutral-600 text-xs">
            [HANGER] ===
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className="font-mono text-xs text-neutral-200 font-bold hover:text-sky-300">
              {file.name}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {file.lastModified}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  switch (layout) {
    case 'Grid':
      return renderGrid();
    case 'List':
      return renderList();
    case '3D':
      return render3D();
    case 'Spines':
      return renderSpines();
    case 'Hangers':
      return renderHangers();
    default:
      return renderGrid();
  }
};
