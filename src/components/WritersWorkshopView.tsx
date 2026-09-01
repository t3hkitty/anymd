import React, { useState } from 'react';
import { BookOpen, User, Pin, FileText, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';

export interface LoreEntity {
  id: string;
  name: string;
  role: 'Protagonist' | 'Antagonist' | 'Deuteragonist' | 'Factions/World' | 'Magic/Relic';
  pinned: boolean;
  description: string;
  traits: string[];
}

export interface ChapterSidecar {
  id: string;
  title: string;
  wordCount: number;
  status: 'Draft' | 'Revised' | 'Final';
  summary: string;
  content: string;
}

export const WritersWorkshopView: React.FC = () => {
  const [entities, setEntities] = useState<LoreEntity[]>([
    {
      id: 'e1',
      name: 'Lorik / Meow Master',
      role: 'Protagonist',
      pinned: true,
      description: 'Architect of the KawaiiNeko Flat-File Ecosystem.',
      traits: ['Kawaiian', 'One-handed typing', 'Obsidian/Roam enthusiast']
    },
    {
      id: 'e2',
      name: 'Neko Sovereign AI',
      role: 'Deuteragonist',
      pinned: true,
      description: 'Autonomous co-pilot operating inside port 3050 webhook proxy.',
      traits: ['Zero-slop', 'High-density', 'Cat-lover']
    },
    {
      id: 'e3',
      name: 'The Slop Monolith',
      role: 'Antagonist',
      pinned: false,
      description: 'Bloated database overhead attempting to corrupt Markdown files.',
      traits: ['SQL-bloat', 'Cloud-lockin', 'Slow-queries']
    }
  ]);

  const [chapters, setChapters] = useState<ChapterSidecar[]>([
    {
      id: 'c1',
      title: 'Chapter 1: The Excommunication of the S-Word',
      wordCount: 1420,
      status: 'Final',
      summary: 'The Kawaiian Devs banish legacy terminology and establish the Meow namespace.',
      content: '# Chapter 1\n\nUnder the light of the plump indigo terminal, the refactoring began...'
    },
    {
      id: 'c2',
      title: 'Chapter 2: Flat-File Turtle Foundations',
      wordCount: 2100,
      status: 'Revised',
      summary: 'Establishing Markdown files with YAML frontmatter as the permanent database.',
      content: '# Chapter 2\n\nNo PostgreSQL, no SQLite overhead—just pure human-readable text...'
    },
    {
      id: 'c3',
      title: 'Chapter 3: The 32px Plump Console',
      wordCount: 850,
      status: 'Draft',
      summary: 'Building high-density rounded plumpitude viewports.',
      content: '# Chapter 3\n\nEvery border radius curved softly at 32 pixels...'
    }
  ]);

  const [activeChapterId, setActiveChapterId] = useState<string>('c1');
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityRole, setNewEntityRole] = useState<LoreEntity['role']>('Protagonist');
  const [showAddEntity, setShowAddEntity] = useState(false);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  const handleTogglePin = (id: string) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, pinned: !e.pinned } : e));
  };

  const handleAddEntity = () => {
    if (!newEntityName.trim()) return;
    const newEnt: LoreEntity = {
      id: `e_${Date.now()}`,
      name: newEntityName,
      role: newEntityRole,
      pinned: true,
      description: 'Newly pinned narrative entity.',
      traits: ['Storyteller-AI']
    };
    setEntities(prev => [newEnt, ...prev]);
    setNewEntityName('');
    setShowAddEntity(false);
  };

  const handleAddChapter = () => {
    const newCh: ChapterSidecar = {
      id: `c_${Date.now()}`,
      title: `Chapter ${chapters.length + 1}: Untitled Narrative Loop`,
      wordCount: 0,
      status: 'Draft',
      summary: 'Sidecar chapter draft.',
      content: `# Chapter ${chapters.length + 1}\n\nStart writing narrative here...`
    };
    setChapters(prev => [...prev, newCh]);
    setActiveChapterId(newCh.id);
  };

  const handleUpdateChapterContent = (text: string) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: text, wordCount: words } : c));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 text-slate-100 p-4 font-sans select-none">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 border border-indigo-500/30 p-3 rounded-2xl mb-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500 text-indigo-400 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide flex items-center gap-2">
              Writer's Workshop 📖
              <span className="text-[10px] bg-indigo-950 border border-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                @lorik/storyteller-ai-suite
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Non-linear chapter sidecar editor &amp; character lore entity pinning</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddChapter}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            style={{ boxShadow: '2px 2px 0px #000' }}
          >
            <Plus className="w-4 h-4" /> + New Chapter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow overflow-hidden">
        {/* Left Sidebar: Character / Lore Entity Pinning */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> Lore &amp; Entity Pins
            </span>
            <button
              onClick={() => setShowAddEntity(!showAddEntity)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Pin new entity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showAddEntity && (
            <div className="bg-slate-950 p-2.5 border border-indigo-500/40 rounded-xl flex flex-col gap-2">
              <input
                type="text"
                value={newEntityName}
                onChange={e => setNewEntityName(e.target.value)}
                placeholder="Entity name..."
                className="bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-white focus:outline-none"
              />
              <select
                value={newEntityRole}
                onChange={e => setNewEntityRole(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 focus:outline-none"
              >
                <option value="Protagonist">Protagonist</option>
                <option value="Antagonist">Antagonist</option>
                <option value="Deuteragonist">Deuteragonist</option>
                <option value="Factions/World">Factions/World</option>
                <option value="Magic/Relic">Magic/Relic</option>
              </select>
              <button
                onClick={handleAddEntity}
                className="py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500"
              >
                Pin Entity
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {entities.map(ent => (
              <div
                key={ent.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  ent.pinned
                    ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>{ent.name}</span>
                  </div>
                  <button
                    onClick={() => handleTogglePin(ent.id)}
                    className={`p-0.5 hover:text-amber-400 ${ent.pinned ? 'text-amber-400' : 'text-slate-600'}`}
                  >
                    <Pin className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
                <div className="text-[10px] font-mono text-purple-300 mb-1">Role: {ent.role}</div>
                <p className="text-[11px] text-slate-400 leading-snug">{ent.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {ent.traits.map((t, idx) => (
                    <span key={idx} className="text-[9px] font-mono bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center-Left: Non-Linear Chapter Sidecar List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Non-Linear Sidecars
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{chapters.length} Chapters</span>
          </div>

          <div className="flex flex-col gap-2">
            {chapters.map(ch => {
              const isActive = ch.id === activeChapterId;
              return (
                <div
                  key={ch.id}
                  onClick={() => setActiveChapterId(ch.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs truncate max-w-[170px]">{ch.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      ch.status === 'Final' ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' :
                      ch.status === 'Revised' ? 'bg-indigo-950 border border-indigo-500/40 text-indigo-300' :
                      'bg-amber-950 border border-amber-500/40 text-amber-300'
                    }`}>
                      {ch.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>{ch.wordCount} words</span>
                    <span>MD Sidecar</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Editor Window */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <input
              type="text"
              value={activeChapter.title}
              onChange={e => {
                const title = e.target.value;
                setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, title } : c));
              }}
              className="bg-transparent font-black text-sm text-white focus:outline-none flex-grow"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">{activeChapter.wordCount} words</span>
            </div>
          </div>

          <textarea
            value={activeChapter.content}
            onChange={e => handleUpdateChapterContent(e.target.value)}
            placeholder="Type chapter content in Markdown format..."
            className="w-full flex-grow bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
