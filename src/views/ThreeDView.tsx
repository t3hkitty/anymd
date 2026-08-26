import React from 'react';

interface VaultFile {
  name: string;
  snippet: string;
  lastModified: string;
}

interface ThreeDViewProps {
  files: VaultFile[];
  onSelectFile: (file: VaultFile) => void;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({
  files,
  onSelectFile,
}) => {
  return (
    <div className="p-12 flex justify-center items-center h-80 overflow-hidden relative font-mono text-xs">
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
                <h4 className="font-bold text-sky-400">{file.name.replace('.md', '')}</h4>
                <p className="text-[10px] text-neutral-400 mt-2 line-clamp-2">{file.snippet}</p>
              </div>
              <span className="text-[8px] text-neutral-600 text-right">{file.lastModified}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
