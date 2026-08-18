import React, { useState, useEffect } from 'react';
import {
  loadPreferenceSuffering,
  savePreferenceSuffering,
  loadPersonContacts,
  loadPiplupCameos,
  loadPlushieCubbies,
  type PreferenceSufferingItem,
  type PersonContactSlug,
  type PiplupCameoItem,
  type PlushieItem
} from '../plugins/personaCollectorHubPlugin';
import {
  X,
  Heart,
  AlertOctagon,
  Users,
  Search,
  Sparkles,
  Shirt,
  Gift,
  ExternalLink,
  Plus,
  ShieldAlert,
  Check
} from 'lucide-react';

interface PersonaCollectorHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonaCollectorHubModal: React.FC<PersonaCollectorHubModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'anxiety-calm' | 'pref-suffering' | 'person-slugs' | 'piplup-finder' | 'plushie-cubbies'>('anxiety-calm');

  // 1. Anxiety / Calm Mode State
  const [breathingPhase, setBreathingPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [breathingProgress, setBreathingProgress] = useState<number>(0);
  const [calmTaskInput, setCalmTaskInput] = useState<string>('');
  const [calmSteps, setCalmSteps] = useState<string[]>([]);

  // 2. Preference & Suffering Ledger
  const [prefItems, setPrefItems] = useState<PreferenceSufferingItem[]>([]);
  const [newPrefTitle, setNewPrefTitle] = useState('');
  const [newPrefType, setNewPrefType] = useState<PreferenceSufferingItem['type']>('sensory-trigger');
  const [newPrefDesc, setNewPrefDesc] = useState('');
  const [newPrefMitigation, setNewPrefMitigation] = useState('');

  // 3. Person Slugs & Contacts
  const [contacts, setContacts] = useState<PersonContactSlug[]>([]);

  // 4. Piplup Cameos & Finder
  const [piplupItems, setPiplupItems] = useState<PiplupCameoItem[]>([]);

  // 5. Plushie Cubbies & Wardrobe
  const [plushies, setPlushies] = useState<PlushieItem[]>([]);
  const [selectedPlushieId, setSelectedPlushieId] = useState<string>('plush-1');

  useEffect(() => {
    if (isOpen) {
      setPrefItems(loadPreferenceSuffering());
      setContacts(loadPersonContacts());
      setPiplupItems(loadPiplupCameos());
      setPlushies(loadPlushieCubbies());
    }
  }, [isOpen]);

  // Visual 4-7-8 Breathing Pacer Loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'anxiety-calm') return;
    let sec = 0;
    const interval = setInterval(() => {
      sec = (sec + 1) % 19;
      if (sec < 4) {
        setBreathingPhase('Inhale (4s)');
        setBreathingProgress((sec / 4) * 100);
      } else if (sec < 11) {
        setBreathingPhase('Hold (7s)');
        setBreathingProgress(((sec - 4) / 7) * 100);
      } else {
        setBreathingPhase('Exhale (8s)');
        setBreathingProgress(((sec - 11) / 8) * 100);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleDecomposeCalmTask = () => {
    if (!calmTaskInput.trim()) return;
    const decomposed = [
      `1. Step away from screen & take one deep breath: Inhale 4s, Exhale 8s.`,
      `2. Micro-Touch: Open only the single document/tool required for "${calmTaskInput}".`,
      `3. 90-Second Sprint: Write or complete just 1 atomic unit without evaluating quality.`,
      `4. Permission to pause: Stop immediately if tension spikes, or proceed to the next unit.`
    ];
    setCalmSteps(decomposed);
  };

  const handleAddPrefItem = () => {
    if (!newPrefTitle.trim()) return;
    const newItem: PreferenceSufferingItem = {
      id: `ps-${Date.now()}`,
      type: newPrefType,
      title: newPrefTitle,
      description: newPrefDesc,
      mitigationStrategy: newPrefMitigation,
      intensity: newPrefType === 'sensory-trigger' ? 5 : 2,
      tags: [newPrefType, 'ledger']
    };
    const updated = [newItem, ...prefItems];
    setPrefItems(updated);
    savePreferenceSuffering(updated);
    setNewPrefTitle('');
    setNewPrefDesc('');
    setNewPrefMitigation('');
  };

  const activePlushie = plushies.find(p => p.id === selectedPlushieId) || plushies[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-sky-500 text-white shadow-lg shadow-pink-500/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg flex items-center space-x-2">
                <span>Persona, Feed Engine &amp; Collector Tools</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-mono font-bold">
                  SOVEREIGN SANCTUARY
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Anxiety Reducer &bull; Suffering Ledger &bull; Person Slugs &bull; Piplup Radar &bull; Plushie Cubbies
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('anxiety-calm')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'anxiety-calm'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>🌿 Anxiety Reducer (Calm Mode)</span>
          </button>

          <button
            onClick={() => setActiveTab('pref-suffering')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'pref-suffering'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Preference / Suffering Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('person-slugs')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'person-slugs'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>📇 Person Slugs ([Contact:Name])</span>
          </button>

          <button
            onClick={() => setActiveTab('piplup-finder')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'piplup-finder'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>🐧 Piplup &amp; Cameo Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('plushie-cubbies')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'plushie-cubbies'
                ? 'border-pink-400 text-pink-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-pink-400" />
            <span>🧸 Plushie Cubbies &amp; BAB Wardrobe</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-6">
          
          {/* TAB 1: ANXIETY REDUCER (CALM MODE) */}
          {activeTab === 'anxiety-calm' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* 4-7-8 Breathing Pacer Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/40 to-slate-950 border border-emerald-500/40 flex flex-col items-center justify-center space-y-4 text-center">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                  4-7-8 Visual Parasympathetic Breathing Pacer
                </span>

                <div className="relative w-36 h-36 rounded-full border-4 border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                  <div
                    className="absolute inset-2 rounded-full bg-emerald-500/20 transition-all duration-1000 flex items-center justify-center"
                    style={{ transform: `scale(${0.6 + (breathingProgress / 100) * 0.4})` }}
                  >
                    <span className="text-emerald-200 font-extrabold text-sm text-center px-2">{breathingPhase}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs font-sans max-w-md">
                  Inhale quietly through the nose (4s), hold breath gently (7s), and exhale completely through the mouth (8s).
                </p>
              </div>

              {/* High Friction Task Deconstructor */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-emerald-300 text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Hands-Free Low Friction Task Decomposition</span>
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter an overwhelming high-friction task (e.g. 'File tax receipts and draft invoice')..."
                    value={calmTaskInput}
                    onChange={(e) => setCalmTaskInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                  <button
                    onClick={handleDecomposeCalmTask}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    Decompose
                  </button>
                </div>

                {calmSteps.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2 mt-2">
                    {calmSteps.map((st, i) => (
                      <div key={i} className="text-slate-200 text-xs font-sans flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PREFERENCE & SUFFERING LEDGER */}
          {activeTab === 'pref-suffering' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Creator Form */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-amber-300 text-xs flex items-center space-x-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  <span>Log Hard Likes, Sensory Triggers &amp; Friction Points</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Title / Trigger Name..."
                    value={newPrefTitle}
                    onChange={(e) => setNewPrefTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                  <select
                    value={newPrefType}
                    onChange={(e) => setNewPrefType(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs"
                  >
                    <option value="sensory-trigger">⚡ Sensory Trigger</option>
                    <option value="friction-point">🛑 Friction Point</option>
                    <option value="hard-dislike">🚫 Hard Dislike</option>
                    <option value="hard-like">🌟 Hard Like / Comfort Fuel</option>
                  </select>
                  <button
                    onClick={handleAddPrefItem}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save to Ledger</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Sensory description / why this causes strain..."
                    value={newPrefDesc}
                    onChange={(e) => setNewPrefDesc(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Mitigation Strategy / Environmental fix..."
                    value={newPrefMitigation}
                    onChange={(e) => setNewPrefMitigation(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 text-xs"
                  />
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prefItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border space-y-2 shadow-md ${
                      item.type === 'sensory-trigger' || item.type === 'hard-dislike'
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-emerald-950/20 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.type === 'sensory-trigger' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {item.type.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Intensity: {item.intensity}/5</span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-100">{item.title}</h4>
                    <p className="text-slate-300 text-xs font-sans">{item.description}</p>
                    
                    {item.mitigationStrategy && (
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-emerald-300 font-mono">
                        🛡️ <strong>Mitigation:</strong> {item.mitigationStrategy}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: PERSON SLUGS & CONTACTS */}
          {activeTab === 'person-slugs' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 font-sans">
                <span className="font-bold text-indigo-300 text-xs font-mono flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>RELATIONAL TRACKING VIA [Contact:Name] SLUGS</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Store async communication preferences, sensitive boundaries to respect, and tailored gift-preference mapping linked directly to Obsidian journal entries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-md"
                    style={{ borderTop: `3px solid ${c.color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-300">{c.contactSlug}</span>
                        <h3 className="font-extrabold text-sm text-slate-100">{c.name} ({c.relationship})</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-indigo-300 font-bold font-mono">
                        {c.communicationPreference}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-sans">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Gift className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span><strong>Gifts:</strong> {c.giftPreferences.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-rose-300/90 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span><strong>Avoid:</strong> {c.sensitiveTopicsToAvoid.join(', ')}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                      📝 {c.recentNotes[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PIPLUP & CAMEO RADAR */}
          {activeTab === 'piplup-finder' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-sky-950/30 border border-sky-500/30 space-y-2 font-sans">
                <span className="font-bold text-sky-300 text-xs font-mono flex items-center space-x-1.5">
                  <Search className="w-4 h-4 text-sky-400" />
                  <span>PERSISTENT PIPLUP &amp; DAWN CAMEO RADAR</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Continuous discovery crawler for character art cameos (Piplup, Dawn, Pokémon Sinnoh holos), rare drops, and vintage art doll listings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {piplupItems.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between">
                    <div>
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-36 rounded-xl object-cover border border-slate-800 bg-slate-900 mb-2"
                      />
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40 text-[9px] font-bold uppercase">
                          {p.sourceType}
                        </span>
                        <span className="text-emerald-400 font-bold text-xs">${p.marketPriceUsd.toFixed(2)} USD</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-100 mt-1 line-clamp-1">{p.title}</h4>
                      <p className="text-slate-400 text-[11px] font-sans line-clamp-2 mt-1">{p.loreSnippet}</p>
                    </div>

                    <a
                      href={p.verifiedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold flex items-center justify-center space-x-1"
                    >
                      <span>View Verified Record</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PLUSHIE CUBBIES & WARDROBE TRACKER */}
          {activeTab === 'plushie-cubbies' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-pink-950/30 border border-pink-500/30 space-y-2 font-sans">
                <span className="font-bold text-pink-300 text-xs font-mono flex items-center space-x-1.5">
                  <Shirt className="w-4 h-4 text-pink-400" />
                  <span>PLUSHIE CUBBIES &amp; BUILD-A-BEAR WARDROBE TRACKING</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Digital shelf inventory for physical plush collections (Build-A-Bear, Sanrio, Squishmallows) with scent discs, sound chips, and apparel accessories.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left: Plushie Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold block">Select Plushie Friend:</label>
                  {plushies.map((plush) => (
                    <button
                      key={plush.id}
                      onClick={() => setSelectedPlushieId(plush.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                        selectedPlushieId === plush.id
                          ? 'bg-slate-900 border-pink-500 shadow-md shadow-pink-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={plush.imageUrl}
                        alt={plush.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-100">{plush.name}</h4>
                        <p className="text-[10px] text-slate-400">{plush.cubbyLocation}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right: Active Plushie Wardrobe & Anatomy */}
                {activePlushie && (
                  <div className="md:col-span-2 p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={activePlushie.imageUrl}
                          alt={activePlushie.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md"
                        />
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-500/40 text-[10px] font-bold">
                            {activePlushie.brand}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-100 mt-1">{activePlushie.name}</h3>
                          <p className="text-xs text-slate-400">{activePlushie.speciesOrCharacter}</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold text-xs">${activePlushie.estimatedValueUsd} USD</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Scent Chip:</span>
                        <span className="text-pink-300 font-bold">{activePlushie.scentTag || 'None Installed'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Voice Box:</span>
                        <span className="text-sky-300 font-bold">{activePlushie.soundChip || 'None Installed'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 font-bold block">Equipped Apparel &amp; Outfits ({activePlushie.apparelItems.length}):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activePlushie.apparelItems.map((app) => (
                          <div key={app.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-200 text-xs font-sans">{app.itemName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-950" style={{ backgroundColor: app.color }}>
                              {app.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
