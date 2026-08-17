import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { MetadataSearchResult, SelectiveMetadataSelection } from '../types/plugins';
import { searchOpenLibraryMetadata, mergeSelectedMetadata } from '../plugins/selectiveMetadataEditorPlugin';
import { X, Search, Sparkles, Check, RefreshCw } from 'lucide-react';

interface SelectiveMetadataModalProps {
  isOpen: boolean;
  currentBook: Book;
  onClose: () => void;
  onApplyMetadata: (updatedBook: Partial<Book>) => void;
}

export const SelectiveMetadataModal: React.FC<SelectiveMetadataModalProps> = ({
  isOpen,
  currentBook,
  onClose,
  onApplyMetadata,
}) => {
  const [query, setQuery] = useState(currentBook.title);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MetadataSearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<MetadataSearchResult | null>(null);

  const [selectionMap, setSelectionMap] = useState<SelectiveMetadataSelection>({
    title: true,
    author: true,
    publishYear: true,
    publisher: true,
    isbn: true,
    summary: true,
    tags: true,
    coverUrl: true,
    description: true,
    genres: true,
  });

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    const results = await searchOpenLibraryMetadata(query);
    setSearchResults(results);
    if (results.length > 0) {
      setSelectedResult(results[0]);
    }
    setIsSearching(false);
  };

  const toggleField = (field: keyof SelectiveMetadataSelection) => {
    setSelectionMap(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleApply = () => {
    if (!selectedResult) return;
    const merged = mergeSelectedMetadata(currentBook, selectedResult, selectionMap);
    onApplyMetadata(merged);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Single-Entry Selective Metadata Editor</h3>
              <p className="text-xs text-slate-400">Scrape Open Library & Selectively Merge Specific Metadata Fields</p>
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
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Open Library by Title, Author, or ISBN..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center space-x-1.5"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </form>

          {/* Search Results & Merge Field Selection */}
          {searchResults.length > 0 && selectedResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Results List */}
              <div className="lg:col-span-5 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Search Matches ({searchResults.length})
                </span>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((res, idx) => {
                    const isSel = selectedResult.title === res.title && selectedResult.author === res.author;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedResult(res)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSel
                            ? 'bg-amber-500/10 border-amber-500/60 text-slate-100'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <h4 className="font-bold text-xs">{res.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">By {res.author} ({res.publishYear || 'N/A'})</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field-by-Field Merge Selector */}
              <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  Select Fields to Merge into Sidecar
                </span>

                <div className="space-y-2 text-xs">
                  {/* Title Field */}
                  <div
                    onClick={() => toggleField('title')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-300">Title:</span>
                      <span className="ml-2 text-slate-400">{selectedResult.title}</span>
                    </div>
                    {selectionMap.title ? <Check className="w-4 h-4 text-amber-400" /> : <div className="w-4 h-4 border border-slate-600 rounded" />}
                  </div>

                  {/* Author Field */}
                  <div
                    onClick={() => toggleField('author')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-300">Author:</span>
                      <span className="ml-2 text-slate-400">{selectedResult.author}</span>
                    </div>
                    {selectionMap.author ? <Check className="w-4 h-4 text-amber-400" /> : <div className="w-4 h-4 border border-slate-600 rounded" />}
                  </div>

                  {/* Publish Year */}
                  <div
                    onClick={() => toggleField('publishYear')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-300">Year:</span>
                      <span className="ml-2 text-slate-400">{selectedResult.publishYear || 'N/A'}</span>
                    </div>
                    {selectionMap.publishYear ? <Check className="w-4 h-4 text-amber-400" /> : <div className="w-4 h-4 border border-slate-600 rounded" />}
                  </div>

                  {/* Publisher */}
                  <div
                    onClick={() => toggleField('publisher')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-300">Publisher:</span>
                      <span className="ml-2 text-slate-400">{selectedResult.publisher || 'N/A'}</span>
                    </div>
                    {selectionMap.publisher ? <Check className="w-4 h-4 text-amber-400" /> : <div className="w-4 h-4 border border-slate-600 rounded" />}
                  </div>

                  {/* ISBN */}
                  <div
                    onClick={() => toggleField('isbn')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-300">ISBN:</span>
                      <span className="ml-2 text-slate-400">{selectedResult.isbn || 'N/A'}</span>
                    </div>
                    {selectionMap.isbn ? <Check className="w-4 h-4 text-amber-400" /> : <div className="w-4 h-4 border border-slate-600 rounded" />}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedResult}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg disabled:opacity-40"
          >
            Merge Selected Fields into Sidecar
          </button>
        </div>

      </div>
    </div>
  );
};
