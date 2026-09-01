import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';
import { Gift, MessageSquare, Copy, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';

interface Contact {
  name: string;
  slug: string;
  birthday: string; // "MM-DD"
  likes: string[];
  dislikes: string[];
}

export const CrmBirthdayWidget: React.FC = () => {
  // Local active call-sign & today's date
  const todayMMDD = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }).replace('/', '-'); // "08-22"
  
  // Mock local NPC registry parsed from your Markdown vault
  const [contacts, setContacts] = useState<Contact[]>([
    {
      name: "Henry",
      slug: "[NPC:henry_t]",
      birthday: todayMMDD, // Matches today for instant testing!
      likes: ["Retro Synths", "Dark Roast Coffee", "Meow Tech"],
      dislikes: ["Slick Corporate Ads", "Bloated Electron Apps"]
    },
    {
      name: "Sarah Connor",
      slug: "[NPC:ally]",
      birthday: "11-10",
      likes: ["Heavy Metal", "Guerilla Tactics", "TDR Commits"],
      dislikes: ["AI Overlords", "Unsecured Cloud Backups"]
    }
  ]);

  const [activeBirthdayBoy, setActiveBirthdayBoy] = useState<Contact | null>(contacts[0]);
  const [selectedTone, setSelectedTone] = useState<'cozy' | 'cheesy' | 'mcconaughey' | 'sarcastic'>('cozy');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [customGiftUrl, setCustomGiftUrl] = useState<string>('https://www.starbucks.com/gift/');

  // Check if Monetization Plugin is active in localStorage
  const isMonetizerActive = localStorage.getItem('anymd_plugin_monetizer_enabled') === 'true';
  const affiliateID = localStorage.getItem('anymd_monetizer_amazon_tag') || 'YOUR_AFFILIATE_ID';

  // 1. Generate Message Tone Dictionary
  const messageTones = {
    cozy: (name: string) => `Happy Birthday, ${name}! 🎉 Sending you the warmest, most grounded vibes today. I hope you take some beautiful, uninterrupted offline time to breathe, relax, and just be. You're a rare and incredible human, and I'm so lucky to have you in my orbit. Let's grab a fresh brew soon! ☕✨`,
    
    cheesy: (name: string) => `OH HECKIN YES! 🎂 Happy Birthday, ${name}! The calendar telemetry indicates you have completed another orbit around our local solar star! Let's crank up the energy, throw on some cheesy synth-pop anthems, and blast the confetti! You are absolutely crushing it! 🚀🌈🎉`,
    
    mcconaughey: (name: string) => `Alright, alright, alright... look who's taking it from the top today! Happy Birthday, ${name}, you absolute legend! Get yourself some clean clothes, take a deep breath of that fresh morning air, and grab today by the horns. You're rocking this life pile, baby. Heckin yesss! 😎🎸`,
    
    sarcastic: (name: string) => `🤖 'Analyzing age metrics... Error: System indicates you are officially one year older. Don't panic! Your biological hardware is still performing within acceptable parameters. Please take 2mg of patience and sip some water to stay cool while I attempt to calculate how much laundry you accumulated today. Happy Birthday anyway, human!'`
  };

  // Update generated text when context shifts
  useEffect(() => {
    if (activeBirthdayBoy) {
      setGeneratedMessage(messageTones[selectedTone](activeBirthdayBoy.name));
    }
  }, [activeBirthdayBoy, selectedTone]);

  // Generate URL with optional Monetizer Plugin Hooks
  const getGiftUrl = () => {
    if (isMonetizerActive) {
      // If the user's Monetizer Plugin is active, append their custom affiliate parameters securely
      return `${customGiftUrl}?tag=${affiliateID}&utm_source=anymd_crm_birthday&cm_mmc=AFC-C8Junction`;
    }
    // Pure, clean, ad-free vanilla URL by default
    return customGiftUrl;
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <WidgetPanel 
      title="🎂 CRM 'On This Day' Birthdays" 
      badge="🎁 MEOW RELATIONSHIPS"
      className="border-4 border-black shadow-[4px_4px_0_#000] bg-white p-3 rounded-none max-w-md"
    >
      <div className="flex flex-col gap-3">
        
        {/* ACTIVE BIRTHDAY DISPLAY */}
        {activeBirthdayBoy ? (
          <div className="bg-yellow-100 border-2 border-black p-3 relative">
            <span className="absolute top-2 right-2 text-2xl animate-bounce">🎈</span>
            <div className="text-xs bg-yellow-400 border border-black font-black uppercase tracking-wider px-1.5 py-0.5 w-max mb-1">
              Happening Today ({todayMMDD})
            </div>
            <h3 className="text-lg font-black text-black">{activeBirthdayBoy.name} <span className="text-xs text-gray-500 font-mono">{activeBirthdayBoy.slug}</span></h3>
            <div className="mt-1 text-[11px] leading-snug text-gray-700">
              <span className="font-bold">Interests:</span> {activeBirthdayBoy.likes.join(', ')}
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 border-2 border-black p-4 text-center text-xs font-bold text-gray-600">
            🍃 No birthdays detected in your local NPC vaults today. Let's keep it calm!
          </div>
        )}

        {activeBirthdayBoy && (
          <>
            {/* TONE SELECTOR & MSG GENERATOR */}
            <div className="border-2 border-black p-2 bg-blue-50">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase text-gray-600 flex items-center gap-1">
                  <MessageSquare size={13} /> Select Message Tone:
                </label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value as any)}
                  className="border border-black text-xs font-bold p-1 bg-white focus:outline-none shadow-[1px_1px_0_#000]"
                >
                  <option value="cozy">🌸 Cozy & Grounded</option>
                  <option value="cheesy">⚡ Cheesy Hype</option>
                  <option value="mcconaughey">😎 McConaughey Vibes</option>
                  <option value="sarcastic">🤖 Sarcastic AI Buddy</option>
                </select>
              </div>

              <textarea
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="w-full h-28 border-2 border-black p-2 text-xs font-bold font-mono bg-white focus:outline-none shadow-[inner_2px_2px_0_rgba(0,0,0,0.05)] resize-none"
              />

              <button
                onClick={handleCopyMessage}
                className="mt-2 w-full bg-blue-200 border-2 border-black p-2 font-black text-xs uppercase flex justify-center items-center gap-1.5 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none transition-transform"
              >
                <Copy size={13} /> {copied ? "✔ COPIED TO CLIPBOARD!" : "Copy Birthday Message"}
              </button>
            </div>

            {/* DIGITAL GIFT SUGGESTIONS */}
            <div className="border-2 border-black p-2.5 bg-pink-50 flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-gray-600 flex items-center gap-1">
                <Gift size={13} /> Suggested Digital Gifts:
              </label>

              {/* COMMERICAL OFFER INTEGRATED GENTLY */}
              <div className="bg-white border border-black p-2 flex flex-col gap-1.5 shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-black">🎁 Starbucks Digital E-Gift Card</h4>
                    <p className="text-[10px] text-gray-500 leading-tight">Instant warmth delivered directly to their email inbox.</p>
                  </div>
                  {isMonetizerActive ? (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-400 text-[8px] font-black uppercase px-1 rounded-sm">
                      Affiliate Active
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 border border-gray-400 text-[8px] font-black uppercase px-1 rounded-sm">
                      FOSS Zero-Ad
                    </span>
                  )}
                </div>
                
                <a
                  href={getGiftUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-200 hover:bg-emerald-300 border-2 border-black p-1.5 text-center font-black text-[10px] uppercase flex justify-center items-center gap-1 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none"
                >
                  Send Gift Card Link <ExternalLink size={11} />
                </a>
              </div>

              {/* ZERO-COST / FOSS DIGITAL ALTERNATIVES */}
              <div className="bg-purple-100 border border-black p-2 flex flex-col gap-1.5">
                <h4 className="text-xs font-black text-purple-950 flex items-center gap-1">🎨 FOSS Zero-Cost Creative Gifts:</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => alert("🎨 Opening custom HTML5 drawing pad to sketch a celebratory glitter gel pen card...")}
                    className="bg-white hover:bg-gray-50 border border-black p-1 text-[9px] font-black uppercase text-purple-900 shadow-[1px_1px_0_#000]"
                  >
                    ✨ Glitter Doodle
                  </button>
                  <button
                    onClick={() => alert("🎵 Loading custom local music indexer to compile a nostalgic, cheesy 90s MP3 playlist...")}
                    className="bg-white hover:bg-gray-50 border border-black p-1 text-[9px] font-black uppercase text-purple-900 shadow-[1px_1px_0_#000]"
                  >
                    🎸 Mix Playlist
                  </button>
                </div>
              </div>

            </div>

            {/* AD-FREE MONETIZER INFO BANNER */}
            <div className="bg-gray-100 border-2 border-black p-2 text-[10px] text-gray-600 font-bold leading-normal flex gap-1.5 items-start">
              <Sparkles size={24} className="text-yellow-500 shrink-0 mt-0.5" />
              <p>
                <strong>Ecosystem Integrity Guarantee:</strong> anymddb does not serve ads or collect fees. If you wish to support development or enable automated commercial gifting APIs, toggle and activate the <strong>Monetizer Plugin</strong> inside settings.
              </p>
            </div>
          </>
        )}

      </div>
    </WidgetPanel>
  );
};