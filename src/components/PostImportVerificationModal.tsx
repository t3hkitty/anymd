import React, { useState } from 'react';
import type { ImportedBookItem } from '../types/importer';
import type { Book } from '../types/resonance';
import { buildCompanionSidecarHeader } from '../utils/pathResolver';
import { X, CheckCircle2, ShieldCheck, CheckSquare, Square, ShoppingBag } from 'lucide-react';

interface PostImportVerificationModalProps {
  isOpen: boolean;
  importedItems: ImportedBookItem[];
  relLinkRoot: string;
  onClose: () => void;
  onConfirmVerification: (newBooks: Book[]) => void;
}

export const PostImportVerificationModal: React.FC<PostImportVerificationModalProps> = ({
  isOpen,
  importedItems,
  relLinkRoot,
  onClose,
  onConfirmVerification,
}) => {
  const [items, setItems] = useState<ImportedBookItem[]>(importedItems);
  const [targetRelRoot, setTargetRelRoot] = useState(relLinkRoot);

  if (!isOpen) return null;

  const toggleSelectItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  };

  const handleEditItem = (id: string, field: 'title' | 'author', val: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const selectedCount = items.filter(i => i.selected).length;

  const handleCommitVerified = () => {
    const selectedItems = items.filter(i => i.selected);

    const verifiedBooks: Book[] = selectedItems.map((item, idx) => {
      const sidecarHeader = buildCompanionSidecarHeader(item.title, item.author, targetRelRoot, {
        imported_from_list: 'true',
        isbn: item.isbn || '',
        rating: item.rating || 0,
        tags: item.tags
      });

      let mdBody = sidecarHeader + `## Reader Resonance Stream\n`;

      if (item.acquisitionLinks && item.acquisitionLinks.length > 0) {
        mdBody += `\n## 🛒 Content Acquisition Deep-Links\n`;
        item.acquisitionLinks.forEach(l => {
          mdBody += `- ${l.icon} **${l.providerName}:** [${l.label}](${l.url})\n`;
        });
      }

      return {
        id: `imported-${idx}-${Date.now()}`,
        title: item.title,
        author: item.author,
        coverColor: '#6366f1',
        totalChapters: 2,
        currentChapterIndex: 0,
        currentParagraphIndex: 0,
        resonanceStream: [],
        sidecarMarkdown: mdBody,
        chapters: [
          {
            title: 'Chapter 1: Sovereign Workspace',
            cfiBase: `epubcfi(/6/${(idx + 1) * 4}[imp0${idx + 1}]!`,
            paragraphs: [
              `Verified reading list entry for ${item.title} by ${item.author}.`,
              `Sovereign relative link root configured to ${targetRelRoot}.`
            ]
          }
        ]
      };
    });

    onConfirmVerification(verifiedBooks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Interactive Post-Import Verification Table</h3>
              <p className="text-xs text-slate-400">Audit Parsed Entries, Verify Paths, & Auto-Attach Acquisition Deep-Links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Verification Table */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          
          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-amber-400">Relative Link Root (`rel_link_root`):</span>
              <input
                type="text"
                value={targetRelRoot}
                onChange={(e) => setTargetRelRoot(e.target.value)}
                className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono text-xs focus:outline-none"
              />
            </div>

            <span className="text-emerald-400 font-mono font-bold">
              {selectedCount} of {items.length} Books Verified & Selected
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Parsed Book Audit Table
            </label>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">Verify</th>
                    <th className="p-3">Book Title</th>
                    <th className="p-3">Author</th>
                    <th className="p-3 text-center">Confidence</th>
                    <th className="p-3 text-center">Acquisition Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {items.map((item) => (
                    <tr key={item.id} className={item.selected ? 'bg-slate-900/40' : 'opacity-50 bg-slate-950'}>
                      <td className="p-3 text-center">
                        <button onClick={() => toggleSelectItem(item.id)}>
                          {item.selected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                        </button>
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleEditItem(item.id, 'title', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 font-bold text-slate-200 text-xs focus:outline-none"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          value={item.author}
                          onChange={(e) => handleEditItem(item.id, 'author', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-slate-400 text-xs focus:outline-none"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                          {item.confidenceScore}%
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="inline-flex items-center space-x-1 text-[11px] text-amber-400 font-mono">
                          <ShoppingBag className="w-3 h-3" />
                          <span>{item.acquisitionLinks?.length || 0} Links Auto-Attached</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            disabled={selectedCount === 0}
            onClick={handleCommitVerified}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg disabled:opacity-40 flex items-center space-x-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify & Commit {selectedCount} Verified Books to Library</span>
          </button>
        </div>

      </div>
    </div>
  );
};
