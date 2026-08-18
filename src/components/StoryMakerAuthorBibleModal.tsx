import React, { useState, useEffect } from 'react';
import {
  loadInspoLedger,
  saveInspoLedger,
  loadCharacterSlugs,
  compileProseSlugs,
  STRUCTURAL_DRAFTING_PROMPTS,
  DEFAULT_CYA_FORKS,
  type InspoEntry,
  type CharacterSlugDefinition,
  type CYABranchingFork
} from '../plugins/storyMakerAuthorBiblePlugin';
import {
  X,
  Sparkles,
  BookOpen,
  Users,
  Feather,
  Plus,
  Check,
  Compass,
  ArrowRight,
  GitBranch,
  Eye
} from 'lucide-react';

interface StoryMakerAuthorBibleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryMakerAuthorBibleModal: React.FC<StoryMakerAuthorBibleModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'character-slugs' | 'inspo-ledger' | 'lore-bridge' | 'structural-drafting'>('character-slugs');
  
  // 1. Inspo Ledger State
  const [inspoEntries, setInspoEntries] = useState<InspoEntry[]>([]);
  const [newInspoTitle, setNewInspoTitle] = useState('');
  const [newInspoThought, setNewInspoThought] = useState('');
  const [newInspoCategory, setNewInspoCategory] = useState<'anomaly' | 'sensory-fragment' | 'world-rule' | 'dialogue-spark' | 'scene-beat'>('anomaly');
  const [newInspoTags, setNewInspoTags] = useState('friction, sensory, world-rule');

  // 2. Character Slugs State
  const [characterSlugs, setCharacterSlugs] = useState<CharacterSlugDefinition[]>([]);
  const [rawDraftSnippet, setRawDraftSnippet] = useState<string>(
    'The cold rain poured outside the pavilion. [MC] stood rigid, fighting his [MC:flaw], while [ML] looked up with [ML:eyes]. Knowing [ML:secret], [MC] took out [MC:weapon] and hesitated.'
  );
  const [detailPassActive, setDetailPassActive] = useState<boolean>(true);
  const [compiledProse, setCompiledProse] = useState<string>('');

  // 3. Lore Bridge & CYA Forks
  const [cyaForks] = useState<CYABranchingFork[]>(DEFAULT_CYA_FORKS);
  const [selectedThematicOption, setSelectedThematicOption] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInspoEntries(loadInspoLedger());
      const loadedSlugs = loadCharacterSlugs();
      setCharacterSlugs(loadedSlugs);
      setCompiledProse(compileProseSlugs(rawDraftSnippet, loadedSlugs, detailPassActive));
    }
  }, [isOpen, detailPassActive]);

  if (!isOpen) return null;

  const handleCreateInspo = () => {
    if (!newInspoTitle.trim() || !newInspoThought.trim()) return;
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    const zettelSerial = `${dateStr}-${timeStr}`;

    const newEntry: InspoEntry = {
      id: `insp-${Date.now()}`,
      zettelSerial,
      title: newInspoTitle,
      rawThought: newInspoThought,
      tags: newInspoTags.split(',').map(t => t.trim()).filter(Boolean),
      category: newInspoCategory,
      conflictHook: 'Ingested raw anomaly ready to be absorbed by World Bible.',
      createdAt: d.toISOString().split('T')[0]
    };
    const updated = [newEntry, ...inspoEntries];
    setInspoEntries(updated);
    saveInspoLedger(updated);
    setNewInspoTitle('');
    setNewInspoThought('');
  };

  const handleUpdateDraft = (text: string, detailPass = detailPassActive) => {
    setRawDraftSnippet(text);
    setCompiledProse(compileProseSlugs(text, characterSlugs, detailPass));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-600 to-amber-500 text-white shadow-lg shadow-purple-500/20">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg flex items-center space-x-2">
                <span>Story Maker &amp; Author Bible</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                  CREATIVE FORGE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Inspo Ledger (YYYYMMDD-HHMM) &bull; Dynamic Slugs ([MC], [ML:eyes]) &bull; Lore Bridge &amp; 3-Fork CYA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('character-slugs')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'character-slugs'
                ? 'border-purple-400 text-purple-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>🎭 Character Slugs ([MC], [ML])</span>
          </button>

          <button
            onClick={() => setActiveTab('inspo-ledger')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'inspo-ledger'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>💡 Inspo Ledger (Brain-Dumps)</span>
          </button>

          <button
            onClick={() => setActiveTab('lore-bridge')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'lore-bridge'
                ? 'border-rose-400 text-rose-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-rose-400" />
            <span>🌉 Lore Bridge &amp; 3 CYA Forks</span>
          </button>

          <button
            onClick={() => setActiveTab('structural-drafting')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'structural-drafting'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>🧭 Non-Prose Interrogative Director</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-6">
          
          {/* TAB 1: CHARACTER ROLE SLUGS & PROSE INJECTOR */}
          {activeTab === 'character-slugs' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Slugs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {characterSlugs.map((char) => (
                  <div
                    key={char.roleSlug}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-md"
                    style={{ borderTop: `3px solid ${char.color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{char.avatarEmoji}</span>
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-slate-950" style={{ backgroundColor: char.color }}>
                            {char.roleSlug}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-100 mt-1">{char.characterName}</h4>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans">{char.roleTitle}</p>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] space-y-1">
                      <span className="text-slate-500 font-bold uppercase block">Characteristic Slugs:</span>
                      {Object.entries(char.characteristics).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-slate-300">
                          <code className="text-amber-300">[{char.roleSlug.replace(/[[\]]/g, '')}:{key}]</code>
                          <span className="text-slate-400 truncate max-w-[140px]" title={val}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Slug Prose Compiler Studio */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="font-bold text-xs text-purple-300 flex items-center space-x-1.5">
                    <Feather className="w-4 h-4 text-purple-400" />
                    <span>Dynamic Slug Compiler &bull; Momentum Preservation</span>
                  </span>

                  {/* Momentum Preservation Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const next = !detailPassActive;
                        setDetailPassActive(next);
                        handleUpdateDraft(rawDraftSnippet, next);
                      }}
                      className={`px-3 py-1 rounded-xl border text-[11px] font-bold transition-all flex items-center space-x-1.5 ${
                        detailPassActive
                          ? 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-md shadow-purple-500/10'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{detailPassActive ? 'Detail Pass: Compiled' : 'Momentum Mode: Slugs Active'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-slate-400 font-bold">Author Slug Draft:</label>
                      <div className="flex items-center space-x-1">
                        {['[MC]', '[ML]', '[MC:eyes]', '[ML:secret]', '[MC:weapon]'].map((slug) => (
                          <button
                            key={slug}
                            onClick={() => handleUpdateDraft(rawDraftSnippet + ` ${slug}`)}
                            className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 text-[9px] hover:bg-purple-900"
                          >
                            +{slug}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={5}
                      value={rawDraftSnippet}
                      onChange={(e) => handleUpdateDraft(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-emerald-400 font-bold block mb-1">
                      {detailPassActive ? 'Compiled Lore-Refined Prose:' : 'Momentum View (Slugs Preserved):'}
                    </label>
                    <div className="w-full p-3 rounded-2xl bg-slate-900/60 border border-emerald-500/40 text-emerald-100 text-xs font-serif leading-relaxed h-[115px] overflow-y-auto">
                      {compiledProse}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INSPO LEDGER */}
          {activeTab === 'inspo-ledger' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <span className="font-bold text-amber-300 text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Author Bible (Inspo Ledger) &bull; Instant YYYYMMDD-HHMM Ingestion</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Friction Point / Sensory Spark Title..."
                    value={newInspoTitle}
                    onChange={(e) => setNewInspoTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                  />
                  <select
                    value={newInspoCategory}
                    onChange={(e) => setNewInspoCategory(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs"
                  >
                    <option value="anomaly">Real-World Anomaly</option>
                    <option value="sensory-fragment">Sensory Fragment</option>
                    <option value="world-rule">Hard World Rule</option>
                    <option value="dialogue-spark">Dialogue Spark</option>
                    <option value="scene-beat">Scene Beat</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)..."
                    value={newInspoTags}
                    onChange={(e) => setNewInspoTags(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                  />
                </div>

                <textarea
                  rows={3}
                  placeholder="Pour raw voice or text friction points without self-censorship. Slugs like [MC] are auto-indexed..."
                  value={newInspoThought}
                  onChange={(e) => setNewInspoThought(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                />

                <button
                  onClick={handleCreateInspo}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ingest Anomaly into Inspo Ledger</span>
                </button>
              </div>

              {/* Inspo Entries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inspoEntries.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">ZK Tag: {item.zettelSerial}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] text-slate-400 uppercase font-bold">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-xs">{item.title}</h4>
                    <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{item.rawThought}</p>
                    {item.conflictHook && (
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-purple-300 font-mono">
                        ⚡ <strong>Conflict Hook:</strong> {item.conflictHook}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LORE BRIDGE & 3 CYA THEMATIC FORKS */}
          {activeTab === 'lore-bridge' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-2 font-sans">
                <span className="font-bold text-rose-300 text-xs font-mono flex items-center space-x-1.5">
                  <GitBranch className="w-4 h-4 text-rose-400" />
                  <span>LORE BRIDGE &amp; 3 THEMATIC CYA NARRATIVE FORKS</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Cross-reference raw Inspo anomalies with active World Bible logic. Narrative decision points branch into exactly three distinct thematic vectors.
                </p>
              </div>

              {cyaForks.map((fork) => (
                <div key={fork.id} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100">{fork.sceneTitle}</h3>
                    <p className="text-slate-400 text-xs mt-1 font-sans">{fork.dilemmaPrompt}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {fork.thematicOptions.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedThematicOption(opt.label)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 flex flex-col justify-between ${
                          selectedThematicOption === opt.label
                            ? 'bg-rose-950/40 border-rose-400 ring-1 ring-rose-400'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-rose-300 block">{opt.label}</span>
                          <p className="text-slate-300 text-xs font-sans leading-relaxed">{opt.description}</p>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-amber-300 font-mono">
                          <strong>Impact:</strong> {opt.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: NON-PROSE INTERROGATIVE DIRECTOR */}
          {activeTab === 'structural-drafting' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 font-sans">
                <span className="font-bold text-emerald-300 text-xs font-mono flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>NON-PROSE STRUCTURAL INTERROGATIVE DIRECTOR</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Prohibits generic AI prose paragraphs. Guides you with structural questions and atomic paragraph checklists (Goblin Tools style).
                </p>
              </div>

              <div className="space-y-4">
                {STRUCTURAL_DRAFTING_PROMPTS.map((prompt) => (
                  <div key={prompt.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-bold">
                        {prompt.category.replace('-', ' ')}
                      </span>
                      <button
                        onClick={() => {
                          handleUpdateDraft(rawDraftSnippet + `\n\n/* Structural Question: ${prompt.question} */\n`);
                          setActiveTab('character-slugs');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 text-[10px] font-bold flex items-center space-x-1"
                      >
                        <span>Insert into Draft</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-100">{prompt.question}</h4>
                    <p className="text-slate-400 text-xs font-sans">{prompt.guidance}</p>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-amber-300 font-bold uppercase block">Atomic Paragraph Checklist:</span>
                      {prompt.atomicChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
