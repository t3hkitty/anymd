import React, { useState } from 'react';
import { parseYamlFrontmatter } from '../utils/yamlFrontmatterParser';
import { X, Code2, Save, FileCode, Check, Copy, RefreshCw } from 'lucide-react';

interface CoderMarkdownEditorModalProps {
  isOpen: boolean;
  markdownContent: string;
  bookTitle: string;
  onClose: () => void;
  onSaveMarkdown: (newMarkdown: string) => void;
}

export const CoderMarkdownEditorModal: React.FC<CoderMarkdownEditorModalProps> = ({
  isOpen,
  markdownContent,
  bookTitle,
  onClose,
  onSaveMarkdown,
}) => {
  const [code, setCode] = useState(markdownContent);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { metadata, body } = parseYamlFrontmatter(code);
  const lineCount = code.split('\n').length;

  const handleSave = () => {
    onSaveMarkdown(code);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-mono shadow-lg shadow-indigo-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Direct Markdown Coder Editor</span>
                <span className="bg-indigo-500/20 text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded-md">
                  {bookTitle}.companion.md
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Raw Code Editing &bull; Live YAML Frontmatter Engine &bull; {lineCount} lines</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all"
              title="Copy Raw Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split Code Editor + Live YAML Inspector */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-950">
          
          {/* Left 8 Cols: Raw Code Editor with Line Numbers */}
          <div className="lg:col-span-8 flex h-full border-r border-slate-800 overflow-hidden relative">
            {/* Line Numbers */}
            <div className="py-4 px-3 bg-slate-950 text-slate-600 font-mono text-xs select-none border-r border-slate-900 text-right space-y-1">
              {Array.from({ length: lineCount }).map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>

            {/* Textarea Code Input */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-none"
            />
          </div>

          {/* Right 4 Cols: Live YAML Frontmatter & Metadata Inspector */}
          <div className="lg:col-span-4 p-5 space-y-4 overflow-y-auto bg-slate-900/60 border-l border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                YAML Metadata Inspector
              </span>
              <FileCode className="w-4 h-4 text-slate-500" />
            </div>

            <p className="text-[11px] text-slate-400">
              Every key-value entry in the <code className="text-amber-300 font-mono">---</code> frontmatter is parsed as custom metadata:
            </p>

            <div className="space-y-2">
              {Object.keys(metadata).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No YAML frontmatter detected.</p>
              ) : (
                Object.entries(metadata).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5 font-mono text-xs">
                    <span className="text-amber-400 font-bold">{k}:</span>
                    <p className="text-emerald-300 text-[11px] break-all">
                      {Array.isArray(v) ? `[${v.join(', ')}]` : String(v)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Markdown Body Length
              </span>
              <p className="text-xs text-slate-300 font-mono mt-1">{body.length} characters</p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Coder Direct Sync Active</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Commit Changes to .md</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
