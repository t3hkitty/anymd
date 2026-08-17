import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { BulkEditOperation } from '../types/readerPlugins';
import { executeBulkEdits } from '../plugins/bulkEditsPlugin';
import { X, Layers, CheckSquare, Square, Zap, Tag, Bookmark } from 'lucide-react';

interface BulkEditModalProps {
  isOpen: boolean;
  books: Book[];
  relLinkRoot: string;
  onClose: () => void;
  onApplyBulkEdits: (updatedBooks: Book[]) => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  books,
  relLinkRoot,
  onClose,
  onApplyBulkEdits,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(books.map(b => b.id));
  const [addTags, setAddTags] = useState('favorite, 2026-reads');
  const [readingStatusValue, setReadingStatusValue] = useState('reading');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [newRelLinkRoot, setNewRelLinkRoot] = useState(relLinkRoot);

  if (!isOpen) return null;

  const toggleSelectBook = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === books.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(books.map(b => b.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    const operation: BulkEditOperation = {
      targetBookIds: selectedIds,
      addTags: addTags.split(',').map(t => t.trim()).filter(Boolean),
      setStatus: readingStatusValue || undefined,
      newRelLinkRoot: newRelLinkRoot !== relLinkRoot ? newRelLinkRoot : undefined,
      findText: findText || undefined,
      replaceText: replaceText || undefined,
    };

    const updated = executeBulkEdits(books, operation);
    onApplyBulkEdits(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Bulk Pre- & Post-Edits Processor</h3>
              <p className="text-xs text-slate-400">Batch Update YAML Frontmatter, Tags, & Sidecars Across Books</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Target Books Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Target Books ({selectedIds.length}/{books.length} Selected)
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-mono text-amber-400 hover:underline"
              >
                {selectedIds.length === books.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
              {books.map((b) => {
                const isSel = selectedIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() => toggleSelectBook(b.id)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer text-xs ${
                      isSel ? 'bg-indigo-950/60 border-indigo-500/50 text-slate-100' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold truncate">{b.title} ({b.author})</span>
                    {isSel ? <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bulk Transformations Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Bulk Add Tags (Comma Separated)</span>
              </label>
              <input
                type="text"
                value={addTags}
                onChange={(e) => setAddTags(e.target.value)}
                placeholder="favorite, scifi, 2026-reads"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reading Status</span>
              </label>
              <select
                value={readingStatusValue}
                onChange={(e) => setReadingStatusValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="to-read">To Read</option>
                <option value="reading">Currently Reading</option>
                <option value="completed">Completed</option>
                <option value="DNF">DNF (Did Not Finish)</option>
              </select>
            </div>
          </div>

          {/* Relative Link Root Bulk Update */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Bulk Update Relative Link Root (`rel_link_root`)
            </label>
            <input
              type="text"
              value={newRelLinkRoot}
              onChange={(e) => setNewRelLinkRoot(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Find & Replace in Sidecars */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bulk Find & Replace in Companion Sidecars
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find text in sidecars..."
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedIds.length === 0}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg disabled:opacity-40 flex items-center space-x-1.5 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Execute Bulk Edits across {selectedIds.length} Books</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
