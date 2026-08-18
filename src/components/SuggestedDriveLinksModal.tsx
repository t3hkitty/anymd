import React, { useState, useRef } from 'react';
import type { Book } from '../types/resonance';
import type { SuggestedDriveLinkMatch } from '../plugins/backgroundDriveIdleScannerPlugin';
import {
  generateStagingTempMarkdown,
  downloadStagingTempMarkdown
} from '../plugins/zettelkastenSerialPlugin';
import {
  X,
  Sparkles,
  Cloud,
  Check,
  HardDrive,
  CheckCircle2,
  Settings,
  Download,
  Copy,
  FileText,
  FolderOpen,
  XCircle
} from 'lucide-react';

interface SuggestedDriveLinksModalProps {
  isOpen: boolean;
  suggestions: SuggestedDriveLinkMatch[];
  books: Book[];
  onClose: () => void;
  onApproveLink: (suggestion: SuggestedDriveLinkMatch) => void;
  onApproveAll: () => void;
  onDismiss: (suggestionId: string) => void;
  onDismissAll?: () => void;
  onOpenCloudSettings: () => void;
}

export const SuggestedDriveLinksModal: React.FC<SuggestedDriveLinksModalProps> = ({
  isOpen,
  suggestions,
  books,
  onClose,
  onApproveLink,
  onApproveAll,
  onDismiss,
  onDismissAll,
  onOpenCloudSettings
}) => {
  const [copiedStaged, setCopiedStaged] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  if (!isOpen) return null;

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  const handleCopyStagedMarkdown = () => {
    const md = generateStagingTempMarkdown(suggestions, books);
    navigator.clipboard.writeText(md);
    setCopiedStaged(true);
    setTimeout(() => setCopiedStaged(false), 2000);
  };

  const handleDownloadStagedFile = () => {
    downloadStagingTempMarkdown(suggestions, books);
  };

  const handlePickCustomFile = (sug: SuggestedDriveLinkMatch, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'epub';
    const validFormat: 'epub' | 'pdf' | 'mobi' | 'azw3' | 'md' = ['epub', 'pdf', 'mobi', 'azw3', 'md'].includes(fileExt)
      ? (fileExt as any)
      : 'epub';

    const customSuggestion: SuggestedDriveLinkMatch = {
      ...sug,
      matchedFilename: file.name,
      matchedPath: `Local File: /${file.name}`,
      fileSizeBytes: file.size,
      format: validFormat,
      confidenceScore: 100,
      accountName: 'Local Computer'
    };

    onApproveLink(customSuggestion);
    alert(`✓ Linked custom selected file "${file.name}" to vault note "${sug.bookTitle}"!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight tracking-tight flex items-center space-x-2">
                <span>Auto-Discovered Real-File Suggestions</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                  {pendingSuggestions.length} PENDING MATCHES
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold hidden sm:inline">
                  ZETTELKASTEN SERIAL LINKED
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Approve match, choose your own local file, or reject unwanted file suggestions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {pendingSuggestions.length > 0 && (
              <>
                <button
                  onClick={onApproveAll}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                  title="Approve & Link all pending suggested files to sidecars"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept All ({pendingSuggestions.length})</span>
                </button>

                {onDismissAll && (
                  <button
                    onClick={onDismissAll}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all flex items-center space-x-1.5"
                    title="Reject and clear all pending suggestions"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject All</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4">
          
          {/* Controls Bar: Staging Download & Settings */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3 font-sans">
            <div>
              <span className="font-bold text-slate-200 text-xs flex items-center space-x-1.5 font-mono">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Zettelkasten Staging &amp; Temp MD Generator</span>
              </span>
              <p className="text-slate-400 text-xs mt-0.5">
                Staged real files are indexed with unique timestamp serials (<code>ZK: YYYYMMDDHHmmss</code>) and wikilink references.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyStagedMarkdown}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono flex items-center space-x-1.5 transition-all"
                title="Copy Staged Temp Markdown to Clipboard"
              >
                {copiedStaged ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStaged ? 'Copied Staging MD!' : 'Copy Staged MD'}</span>
              </button>

              <button
                onClick={handleDownloadStagedFile}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono flex items-center space-x-1.5 shadow-md transition-all"
                title="Download _staged_idle_scan_matches.temp.md file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .temp.md File</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenCloudSettings();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold font-mono flex items-center space-x-1.5 transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Scan Folders</span>
              </button>
            </div>
          </div>

          {/* Pending Suggestions Table */}
          {pendingSuggestions.length > 0 ? (
            <div className="border border-slate-800 rounded-2xl overflow-x-auto bg-slate-950 shadow-inner">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800 font-mono">
                  <tr>
                    <th className="p-3">Zettelkasten Serial</th>
                    <th className="p-3">Target Vault Note</th>
                    <th className="p-3">Discovered Real File</th>
                    <th className="p-3">Storage Provider</th>
                    <th className="p-3 text-center">Confidence</th>
                    <th className="p-3 text-center min-w-[240px]">Actions (Accept / Pick / Reject)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {pendingSuggestions.map((sug) => (
                    <tr key={sug.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                          ZK: {sug.zettelkastenUid || '20260818...'}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-slate-100 max-w-[180px] truncate" title={sug.bookTitle}>
                        {sug.bookTitle}
                      </td>

                      <td className="p-3 text-amber-300 max-w-[200px]">
                        <span className="flex items-center space-x-1">
                          <HardDrive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate font-bold">{sug.matchedFilename}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {(sug.fileSizeBytes / 1024 / 1024).toFixed(2)} MB &bull; {sug.format.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3 text-slate-300 max-w-[160px]">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300 text-[10px] flex items-center space-x-1 w-fit">
                          <Cloud className="w-3 h-3 text-sky-400" />
                          <span>{sug.accountName}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 truncate" title={sug.matchedPath}>
                          {sug.matchedPath}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          {sug.confidenceScore}% Match
                        </span>
                      </td>

                      {/* Action Buttons: Accept | Pick Other File | Reject */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          
                          {/* 1. Accept Discovered File */}
                          <button
                            onClick={() => onApproveLink(sug)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1 transition-all"
                            title="Accept & link auto-discovered file to vault note"
                          >
                            <Check className="w-3 h-3" />
                            <span>Accept</span>
                          </button>

                          {/* 2. Choose / Pick Custom Local File */}
                          <input
                            type="file"
                            accept=".epub,.pdf,.cbz,.zip,.mobi,.azw3,.md,.txt"
                            style={{ display: 'none' }}
                            ref={(el) => { fileInputRefs.current[sug.id] = el; }}
                            onChange={(e) => handlePickCustomFile(sug, e)}
                          />

                          <button
                            onClick={() => fileInputRefs.current[sug.id]?.click()}
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1 transition-all"
                            title="Choose another file from your computer or attached drives"
                          >
                            <FolderOpen className="w-3 h-3" />
                            <span>Pick File</span>
                          </button>

                          {/* 3. Reject / Dismiss Match */}
                          <button
                            onClick={() => onDismiss(sug.id)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/90 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center space-x-1 transition-all"
                            title="Reject / Dismiss this file suggestion"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-200">No Pending File Suggestions</h4>
              <p className="text-xs text-slate-400 font-sans">
                All discovered files across your attached cloud accounts have been resolved or linked.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Zettelkasten Serial Linking &bull; Staging Temp MD &bull; 0 Cloud Ingress
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-sans"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
