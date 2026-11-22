import React, { useState } from 'react';
import { BookOpen, FileText, Search, Plus, Sparkles, Download, Settings, BarChart2, Shield, Bookmark, Hash, Layers } from 'lucide-react';

interface ZettlrNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  citations: string[];
  updatedAt: string;
}

export const ZettlrWorkspaceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [notes, setNotes] = useState<ZettlrNote[]>([
    {
      id: 'z1',
      title: 'Introduction to Zettlr FOSS Methodology',
      content: '# Introduction to Zettlr FOSS Methodology\n\nZettlr is the open-source Markdown editor for researchers, journalists, and authors. It combines the power of plain text markdown with Zettelkasten knowledge management and BibTeX citations [@cite_knuth1984].\n\n## Core Principles\n- **Atomic Notes**: One idea per note.\n- **Bi-directional Links**: Connect concepts using [[Zettelkasten Links]].\n- **Citations**: Seamlessly integrate literature from your .bib library.',
      tags: ['#research', '#zettlr', '#methodology'],
      citations: ['@cite_knuth1984'],
      updatedAt: '2026-11-22'
    },
    {
      id: 'z2',
      title: 'Zettelkasten Knowledge Architecture',
      content: '# Zettelkasten Knowledge Architecture\n\nThe slip-box method enables emergent structures. By tagging notes and creating permanent links between disparate subjects, new insights arise organically.\n\nSee also: [[Introduction to Zettlr FOSS Methodology]]',
      tags: ['#zettelkasten', '#knowledge'],
      citations: [],
      updatedAt: '2026-11-21'
    }
  ]);
  const [activeNoteId, setActiveNoteId] = useState<string>('z1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'stats' | 'citations' | 'export'>('editor');

  if (!isOpen) return null;

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleUpdateContent = (newContent: string) => {
    setNotes(notes.map(n => n.id === activeNoteId ? { ...n, content: newContent, updatedAt: new Date().toISOString().split('T')[0] } : n));
  };

  const handleCreateNote = () => {
    const newNote: ZettlrNote = {
      id: `z-${Date.now()}`,
      title: 'New Research Note',
      content: '# New Research Note\n\nStart writing your academic markdown here...',
      tags: ['#draft'],
      citations: [],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const wordCount = activeNote.content.split(/\s+/).filter(Boolean).length;
  const charCount = activeNote.content.length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
              ⚡
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight flex items-center space-x-2">
                <span>Zettlr FOSS Research Workspace</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono">v3.8 FOSS</span>
              </h2>
              <p className="text-xs text-slate-400">Open-source Markdown editor, Zettelkasten, and Citation Manager</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              📝 Editor
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              📊 Statistics
            </button>
            <button 
              onClick={() => setActiveTab('citations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'citations' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              📚 Citations (.bib)
            </button>
            <button 
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'export' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              💾 Export
            </button>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 ml-4">
              ✕
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: Document Directory */}
          <div className="w-80 border-r border-slate-800 bg-slate-950/60 flex flex-col">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Research Files</span>
              <button onClick={handleCreateNote} className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>New Note</span>
              </button>
            </div>

            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter Zettels..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).map(note => (
                <button
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex flex-col space-y-1 ${activeNoteId === note.id ? 'bg-indigo-600/20 border border-indigo-500/50 text-white' : 'hover:bg-slate-900 text-slate-300 border border-transparent'}`}
                >
                  <div className="font-bold text-xs truncate">{note.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{note.updatedAt}</span>
                    <span className="text-indigo-400">{note.tags[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Area: Dynamic Tab View */}
          <div className="flex-1 flex flex-col bg-slate-900">
            {activeTab === 'editor' && (
              <div className="flex-1 flex flex-col">
                {/* Editor Toolbar */}
                <div className="px-6 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-4">
                    <span>Words: <strong className="text-slate-200">{wordCount}</strong></span>
                    <span>Characters: <strong className="text-slate-200">{charCount}</strong></span>
                    <span>Reading Time: <strong className="text-slate-200">~{readingTime} min</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Markdown Active</span>
                  </div>
                </div>

                {/* Editor Split Pane */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-800 overflow-hidden">
                  <textarea
                    value={activeNote.content}
                    onChange={e => handleUpdateContent(e.target.value)}
                    className="w-full h-full p-6 bg-slate-900 text-slate-100 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                    placeholder="Write Markdown here..."
                  />
                  <div className="w-full h-full p-6 bg-slate-950/40 overflow-y-auto prose prose-invert text-sm">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Live Markdown Preview</div>
                    <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">
                      {activeNote.content}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                <h3 className="text-lg font-bold">Writing Statistics & Analytics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400">Total Vault Words</div>
                    <div className="text-3xl font-extrabold text-indigo-400">1,420</div>
                    <div className="text-xs text-emerald-400">+340 words today</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400">Writing Streak</div>
                    <div className="text-3xl font-extrabold text-amber-400">7 Days</div>
                    <div className="text-xs text-slate-400">Consistent daily output</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400">Readability Score</div>
                    <div className="text-3xl font-extrabold text-emerald-400">Grade 11.4</div>
                    <div className="text-xs text-slate-400">Academic / Professional</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'citations' && (
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">BibTeX Bibliography & Citations</h3>
                  <button className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
                    + Import .bib File
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-indigo-300">@knuth1984</div>
                      <div className="text-xs text-slate-300">Literate Programming. The Computer Journal, 27(2), 97-111.</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300">In-use</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                <h3 className="text-lg font-bold">Export & Publication</h3>
                <p className="text-xs text-slate-400">Export your markdown notes directly to Pandoc PDF, HTML, or Word (.docx).</p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => alert('Exported note as Markdown!')} className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm">
                    📥 Export Markdown (.md)
                  </button>
                  <button onClick={() => alert('Exported bibliography and notes!')} className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm">
                    📄 Export Pandoc PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
