import React from 'react';

interface VaultFile {
  name: string;
  snippet: string;
  lastModified: string;
}

interface HangersViewProps {
  files: VaultFile[];
  onSelectFile: (file: VaultFile) => void;
}

export const HangersView: React.FC<HangersViewProps> = ({
  files,
  onSelectFile,
}) => {
  return (
    <div className="p-6 flex flex-col space-y-3 font-mono text-xs">
      {files.map((file) => (
        <div
          key={file.name}
          onClick={() => onSelectFile(file)}
          className="flex items-center space-x-4 bg-neutral-900/30 hover:bg-neutral-900/80 border-l-2 border-sky-500 p-2.5 rounded-r-lg cursor-pointer transition-all duration-200"
        >
          <div className="text-neutral-600">
            [HANGER] ===
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-neutral-200 font-bold hover:text-sky-300">
              {file.name}
            </span>
            <span className="text-[10px] text-neutral-500">
              {file.lastModified}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
