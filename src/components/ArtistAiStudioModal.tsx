import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { AiDisclosureType, LocalAiGenerationResult } from '../plugins/localAiMetadataPlugin';
import {
  generateLocalArtMetadata,
  generateLocalStoryMetadata,
  convertAiResultToVaultBook,
  checkLocalBrowserAiAvailability
} from '../plugins/localAiMetadataPlugin';
import {
  X,
  Sparkles,
  Palette,
  BookOpen,
  Copy,
  Check,
  Cpu,
  ShieldCheck,
  Tag,
  ShoppingBag
} from 'lucide-react';

interface ArtistAiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoGenerateVaultItem?: (newBook: Book) => void;
}

export const ArtistAiStudioModal: React.FC<ArtistAiStudioModalProps> = ({
  isOpen,
  onClose,
  onAutoGenerateVaultItem
}) => {
  const [activeTab, setActiveTab] = useState<'art' | 'story'>('art');
  
  // Art form state
  const [artTitle, setArtTitle] = useState('Celestial Dragon & Emerald Nebula');
  const [artMedium, setArtMedium] = useState('Digital Painting (4K)');
  const [artKeywords, setArtKeywords] = useState('dragon, emerald, nebula, cosmic, fantasy, glow, deep-space, stars');
  const [artDisclosure, setArtDisclosure] = useState<AiDisclosureType>('100_percent_human');

  // Story form state
  const [storyTitle, setStoryTitle] = useState('The Rune Carpenter of Fair Quest');
  const [storyAuthor, setStoryAuthor] = useState('Kit Falbo');
  const [storyGenre, setStoryGenre] = useState('LitRPG / Progression Fantasy');
  const [storySynopsis, setStorySynopsis] = useState('A high school chess prodigy applies grandmaster opening strategies to VR carpentry, crafting legendary runes that disrupt the imperial economy.');
  const [storyDisclosure, setStoryDisclosure] = useState<AiDisclosureType>('100_percent_human');

  // Results state
  const [result, setResult] = useState<LocalAiGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const localAiStatus = checkLocalBrowserAiAvailability();

  const handleGenerateArt = () => {
    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      const res = generateLocalArtMetadata({
        title: artTitle,
        medium: artMedium,
        subjectKeywords: artKeywords,
        disclosureType: artDisclosure
      });
      setResult(res);
      setIsGenerating(false);
    }, 600);
  };

  const handleGenerateStory = () => {
    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      const res = generateLocalStoryMetadata({
        title: storyTitle,
        author: storyAuthor,
        genre: storyGenre,
        synopsis: storySynopsis,
        disclosureType: storyDisclosure
      });
      setResult(res);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToVault = () => {
    if (!result) return;
    const newBook = convertAiResultToVaultBook(result, activeTab === 'art');
    if (onAutoGenerateVaultItem) {
      onAutoGenerateVaultItem(newBook);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white font-bold shadow-lg shadow-pink-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Local AI Creator Studio</h3>
              <p className="text-xs text-slate-400">
                100% On-Device AI Tagging &bull; Redbubble (50 Tags), Etsy (13 Tags), INPRNT, Royal Road &bull; Ethical Disclosures
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

        {/* Engine Security Banner */}
        <div className="px-6 py-2.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-emerald-300">
              Zero Server Ingress &bull; {localAiStatus.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Your art, writing, and prompts never leave your device</span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs">
          <button
            onClick={() => { setActiveTab('art'); setResult(null); }}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'art'
                ? 'border-pink-500 text-pink-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>🎨 Visual Art &amp; Print Storefronts</span>
          </button>

          <button
            onClick={() => { setActiveTab('story'); setResult(null); }}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'story'
                ? 'border-purple-500 text-purple-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>📖 Stories, Webnovels &amp; Royal Road</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* TAB 1: ARTWORK GENERATOR */}
          {activeTab === 'art' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Inputs */}
              <div className="lg:col-span-5 space-y-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Artwork Title:</label>
                    <input
                      type="text"
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="e.g. Celestial Dragon"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-pink-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Medium &amp; Format:</label>
                    <input
                      type="text"
                      value={artMedium}
                      onChange={(e) => setArtMedium(e.target.value)}
                      placeholder="e.g. Digital Painting (4K)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Visual Keywords / Subjects:</label>
                    <textarea
                      rows={3}
                      value={artKeywords}
                      onChange={(e) => setArtKeywords(e.target.value)}
                      placeholder="e.g. dragon, nebula, cosmic, fantasy, glow"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Ethical Provenance Disclosure:</label>
                    <select
                      value={artDisclosure}
                      onChange={(e) => setArtDisclosure(e.target.value as AiDisclosureType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold"
                    >
                      <option value="100_percent_human">🎨 100% Hand-Crafted Human Art (Zero AI)</option>
                      <option value="human_with_ai_tagging_assistance">✨ Human Art &bull; Local AI Tagging Assistance</option>
                      <option value="ai_assisted_content">🤝 Human-AI Collaborative Workflow</option>
                      <option value="fully_ai_generated">🤖 Fully AI Generated (Platform Compliant)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateArt}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-extrabold shadow-lg shadow-pink-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    <Cpu className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? 'Analyzing with Local Neural Engine...' : '⚡ Generate 50 Tags & Description'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: AI Output Studio */}
              <div className="lg:col-span-7 space-y-4">
                {result ? (
                  <div className="space-y-4 animate-fadeIn font-mono text-xs">
                    
                    {/* Redbubble 50 Tags Card */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-pink-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-pink-400 flex items-center space-x-1.5">
                          <Tag className="w-4 h-4" />
                          <span>Redbubble Unified Tag String ({result.redbubbleTags.length} Tags)</span>
                        </span>
                        <button
                          onClick={() => handleCopyText(result.redbubbleTags.join(', '), 'redbubble')}
                          className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-bold flex items-center space-x-1 transition-colors"
                        >
                          {copiedKey === 'redbubble' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'redbubble' ? 'Copied!' : 'Copy for Redbubble'}</span>
                        </button>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 max-h-24 overflow-y-auto leading-relaxed">
                        {result.redbubbleTags.join(', ')}
                      </div>
                    </div>

                    {/* Etsy 13 Tags Card */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 flex items-center space-x-1.5">
                          <ShoppingBag className="w-4 h-4" />
                          <span>Etsy 13 High-Intent Tags</span>
                        </span>
                        <button
                          onClick={() => handleCopyText(result.etsyTags.join(', '), 'etsy')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center space-x-1 transition-colors"
                        >
                          {copiedKey === 'etsy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'etsy' ? 'Copied!' : 'Copy for Etsy'}</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.etsyTags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Storefront Description & Disclosure */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">Formatted Storefront Description &amp; Disclosure</span>
                        <button
                          onClick={() => handleCopyText(result.description, 'desc')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center space-x-1 transition-colors"
                        >
                          {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'desc' ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-sans whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {result.description}
                      </div>
                    </div>

                    {/* Save to Meow Vault Button */}
                    <button
                      onClick={handleSaveToVault}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
                    >
                      {savedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      <span>{savedSuccess ? 'Sidecar Saved to Grand Bookcase!' : '💾 Ingest as Meow .companion.md Sidecar'}</span>
                    </button>

                  </div>
                ) : (
                  <div className="h-full min-h-[300px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-3 font-mono text-xs text-slate-500">
                    <Palette className="w-10 h-10 text-slate-600" />
                    <p>Enter title, medium and keywords on the left and click Generate.</p>
                    <p className="text-[11px] text-slate-600">Generates 50 Redbubble tags, 13 Etsy tags, and store blurb in &lt;1 second 100% locally.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: STORY & WEBNOVEL GENERATOR */}
          {activeTab === 'story' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Inputs */}
              <div className="lg:col-span-5 space-y-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-purple-300 font-bold">Fiction &amp; Tropes</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                      🔗 StoryCraft AI Linked
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Story / Webnovel Title:</label>
                    <input
                      type="text"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      placeholder="e.g. The Rune Carpenter"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-purple-300 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Author Name:</label>
                      <input
                        type="text"
                        value={storyAuthor}
                        onChange={(e) => setStoryAuthor(e.target.value)}
                        placeholder="e.g. Kit Falbo"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Genre / Subgenre:</label>
                      <input
                        type="text"
                        value={storyGenre}
                        onChange={(e) => setStoryGenre(e.target.value)}
                        placeholder="LitRPG / Danmei"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Synopsis / Hook:</label>
                    <textarea
                      rows={4}
                      value={storySynopsis}
                      onChange={(e) => setStorySynopsis(e.target.value)}
                      placeholder="Paste your chapter synopsis or hook blurb..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Ethical Author Disclosure:</label>
                    <select
                      value={storyDisclosure}
                      onChange={(e) => setStoryDisclosure(e.target.value as AiDisclosureType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold"
                    >
                      <option value="100_percent_human">✍️ 100% Human Authored Prose (Zero GenAI)</option>
                      <option value="human_with_ai_tagging_assistance">✨ Human Authored &bull; Local AI Tagging Assistance</option>
                      <option value="ai_assisted_content">🤝 Human-AI Collaborative Storytelling</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateStory}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 hover:from-purple-400 hover:to-sky-400 text-white font-extrabold shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    <Cpu className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? 'Synthesizing Story Tropes...' : '⚡ Generate Royal Road & AO3 Tags'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: AI Output Studio */}
              <div className="lg:col-span-7 space-y-4">
                {result ? (
                  <div className="space-y-4 animate-fadeIn font-mono text-xs">
                    
                    {/* Story Tags Card */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-400 flex items-center space-x-1.5">
                          <Tag className="w-4 h-4" />
                          <span>Royal Road &amp; Webnovel Tag Cloud ({result.royalRoadTags?.length || 0} Tags)</span>
                        </span>
                        <button
                          onClick={() => handleCopyText(result.royalRoadTags?.join(', ') || '', 'rr_tags')}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold flex items-center space-x-1 transition-colors"
                        >
                          {copiedKey === 'rr_tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'rr_tags' ? 'Copied!' : 'Copy All Tags'}</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                        {result.royalRoadTags?.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Blurb & Ethical Disclosure */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">Blurb, Taxonomy &amp; Transparency Statement</span>
                        <button
                          onClick={() => handleCopyText(result.description, 'story_desc')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center space-x-1 transition-colors"
                        >
                          {copiedKey === 'story_desc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'story_desc' ? 'Copied!' : 'Copy Blurb'}</span>
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-sans whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {result.description}
                      </div>
                    </div>

                    {/* Save to Meow Vault Button */}
                    <button
                      onClick={handleSaveToVault}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
                    >
                      {savedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      <span>{savedSuccess ? 'Story Sidecar Saved to Vault!' : '💾 Ingest as Meow .companion.md Sidecar'}</span>
                    </button>

                  </div>
                ) : (
                  <div className="h-full min-h-[300px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-3 font-mono text-xs text-slate-500">
                    <BookOpen className="w-10 h-10 text-slate-600" />
                    <p>Enter title, author, genre and synopsis on the left and click Generate.</p>
                    <p className="text-[11px] text-slate-600">Extracts tropes, builds tag clouds for Royal Road / AO3, and formats blurb disclosures.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between font-sans">
          <span className="text-xs text-slate-400 font-mono">
            Meow Creator AI Studio &bull; 100% Local Browser Engine &bull; Redbubble &amp; Webnovels
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
