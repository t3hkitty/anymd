import React, { useState, useEffect } from 'react';
import type { MediaItem } from '../types/mediaTypes';
import { SAMPLE_MEDIA_ITEMS } from '../data/sampleMediaItems';
import { Coins, Zap } from 'lucide-react';

const MEDIA_ITEMS_STORAGE_KEY = 'lc_md_physical_media_v3';

function loadCurrentMediaItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(MEDIA_ITEMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load media items for valuation widget:', err);
  }
  return SAMPLE_MEDIA_ITEMS;
}

export type CurrencyMode = 
  | 'GBP' 
  | 'BTC' 
  | 'USD' 
  | 'EUR' 
  | 'JPY' 
  | 'INR' // Sovereign Republic of India Currency
  | 'SIMOLEONS' // The Sims Simoleons (§)
  | 'HYRULE_RUPEES' // Legend of Zelda Green Rupees
  | 'DOGE' // Dogecoin (Much Wow)
  | 'NFT_APES' // Bored Ape Yacht Club Floor NFTs
  | 'V_BUCKS' // Fortnite V-Bucks
  | 'ROBUX' // Roblox Robux
  | 'BELLS' // Animal Crossing Tom Nook Debt Bells
  | 'BOTTLE_CAPS' // Fallout Wasteland Nuka-Cola Bottle Caps
  | 'POKEDOLLARS' // Pokemon Red/Blue/Sinnoh Pokédollars
  | 'WOW_GOLD' // World of Warcraft Gold
  | 'RS_GP' // Old School RuneScape Gold
  | 'DOUBLOONS';

interface CollectionValueStartleWidgetProps {
  customItems?: MediaItem[];
}

export const CollectionValueStartleWidget: React.FC<CollectionValueStartleWidgetProps> = ({ customItems }) => {
  const [currency, setCurrency] = useState<CurrencyMode>('GBP');
  const [isStartled, setIsStartled] = useState(false);

  const items = customItems || loadCurrentMediaItems();

  // Total USD Base Valuation
  const totalUsdValuation = items.reduce((acc, item) => {
    if (item.tcgInfo) {
      return acc + (item.tcgInfo.currentValuation || 0);
    }
    return acc + 250; // Default baseline value for physical books/paintings
  }, 0);

  // Conversion rates & formatting rules
  const exchangeRates: Record<CurrencyMode, { symbol: string; rate: number; label: string; format: (val: number) => string }> = {
    GBP: {
      symbol: '£',
      rate: 0.80,
      label: 'British Pounds Sterling',
      format: (v) => `£ ${v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GBP`
    },
    BTC: {
      symbol: '₿',
      rate: 1 / 85000,
      label: 'Bitcoin (Satoshis / BTC)',
      format: (v) => `₿ ${v.toFixed(4)} BTC`
    },
    USD: {
      symbol: '$',
      rate: 1.0,
      label: 'US Dollars',
      format: (v) => `$ ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    },
    EUR: {
      symbol: '€',
      rate: 0.92,
      label: 'Euros',
      format: (v) => `€ ${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
    },
    JPY: {
      symbol: '¥',
      rate: 155,
      label: 'Japanese Yen',
      format: (v) => `¥ ${Math.round(v).toLocaleString('ja-JP')} JPY`
    },
    INR: {
      symbol: '₹',
      rate: 83.5,
      label: 'Indian Rupees (Official Currency of India ₹)',
      format: (v) => `₹ ${Math.round(v).toLocaleString('en-IN')} INR`
    },
    SIMOLEONS: {
      symbol: '§',
      rate: 10,
      label: 'Simoleons (The Sims § / Motherlode)',
      format: (v) => `§ ${Math.round(v).toLocaleString()} Simoleons`
    },
    HYRULE_RUPEES: {
      symbol: '💎',
      rate: 20, // 20 Green Rupees per USD
      label: 'Hyrule Green Rupees (Zelda)',
      format: (v) => `💎 ${Math.round(v).toLocaleString()} Hyrule Rupees`
    },
    DOGE: {
      symbol: '🐕',
      rate: 9.85,
      label: 'Dogecoin (Much Wow! Such Value!)',
      format: (v) => `🐕 ${Math.round(v).toLocaleString()} DOGE`
    },
    NFT_APES: {
      symbol: '🐒',
      rate: 1 / 34000, // $34k BAYC floor
      label: 'Bored Ape Floor NFTs (BAYC / Ethereum)',
      format: (v) => `🐒 ${(v).toFixed(3)} Ape NFTs`
    },
    V_BUCKS: {
      symbol: '🎟️',
      rate: 110, // ~110 V-Bucks per USD
      label: 'Fortnite V-Bucks',
      format: (v) => `🎟️ ${Math.round(v).toLocaleString()} V-Bucks`
    },
    ROBUX: {
      symbol: '🪙',
      rate: 80, // ~80 Robux per USD
      label: 'Roblox Robux',
      format: (v) => `🪙 ${Math.round(v).toLocaleString()} Robux`
    },
    BELLS: {
      symbol: '🔔',
      rate: 100, // 100 Animal Crossing Bells per USD
      label: 'Animal Crossing Bells (Tom Nook Mortgage Debt)',
      format: (v) => `🔔 ${Math.round(v).toLocaleString()} Bells`
    },
    BOTTLE_CAPS: {
      symbol: '🍾',
      rate: 45, // 45 Caps per USD
      label: 'Nuka-Cola Bottle Caps (Fallout Wasteland)',
      format: (v) => `🍾 ${Math.round(v).toLocaleString()} Caps`
    },
    POKEDOLLARS: {
      symbol: '⚡',
      rate: 150, // 150 Pokédollars per USD
      label: 'Pokédollars (Sinnoh / Kanto League)',
      format: (v) => `⚡ ${Math.round(v).toLocaleString()} Pokédollars`
    },
    WOW_GOLD: {
      symbol: '💰',
      rate: 15000,
      label: 'World of Warcraft Gold',
      format: (v) => `💰 ${Math.round(v).toLocaleString()} WoW Gold`
    },
    RS_GP: {
      symbol: '🦀',
      rate: 4500000,
      label: 'Old School RuneScape GP',
      format: (v) => `🦀 ${(v / 1000000).toFixed(1)}M RS GP`
    },
    DOUBLOONS: {
      symbol: '🏴‍☠️',
      rate: 0.005,
      label: 'Spanish Gold Doubloons',
      format: (v) => `🏴‍☠️ ${v.toFixed(1)} Doubloons`
    }
  };

  const activeConfig = exchangeRates[currency];
  const convertedValue = totalUsdValuation * activeConfig.rate;

  const ALL_CURRENCIES: CurrencyMode[] = [
    'GBP', 'USD', 'EUR', 'JPY', 'INR',
    'HYRULE_RUPEES', 'DOGE', 'NFT_APES', 'V_BUCKS', 'ROBUX',
    'BELLS', 'BOTTLE_CAPS', 'POKEDOLLARS', 'WOW_GOLD', 'RS_GP', 'BTC', 'DOUBLOONS'
  ];

  // Startle Randomizer Handler
  const handleStartleCurrency = () => {
    const nextCurrencies = ALL_CURRENCIES.filter(c => c !== currency);
    const randomNext = nextCurrencies[Math.floor(Math.random() * nextCurrencies.length)];
    setCurrency(randomNext);
    setIsStartled(true);
    setTimeout(() => setIsStartled(false), 600);
  };

  // Periodic random currency jitter (every 20 seconds) to startle viewers!
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNext = ALL_CURRENCIES[Math.floor(Math.random() * ALL_CURRENCIES.length)];
      setCurrency(randomNext);
      setIsStartled(true);
      setTimeout(() => setIsStartled(false), 500);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {/* Valuation Badge Button */}
      <button
        onClick={handleStartleCurrency}
        className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-extrabold flex items-center space-x-2 transition-all shadow-md transform ${
          isStartled
            ? 'scale-110 bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/50 shadow-amber-400/50'
            : currency === 'WOW_GOLD' || currency === 'RS_GP'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            : currency === 'DOGE' || currency === 'NFT_APES' || currency === 'V_BUCKS' || currency === 'ROBUX'
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
            : currency === 'HYRULE_RUPEES' || currency === 'BELLS' || currency === 'POKEDOLLARS' || currency === 'BOTTLE_CAPS'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            : currency === 'JPY' || currency === 'INR'
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
            : currency === 'BTC'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
        }`}
        title={`Click to flip currency! Currently showing ${activeConfig.label}. Total Vault Value: $${totalUsdValuation.toLocaleString()} USD`}
      >
        <Coins className={`w-3.5 h-3.5 ${currency === 'BTC' || currency === 'WOW_GOLD' || currency === 'DOGE' ? 'text-amber-400' : 'text-emerald-400'} ${isStartled ? 'animate-bounce' : ''}`} />
        
        <div className="flex flex-col text-left leading-none">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Vault Valuation</span>
          <span className="text-xs font-extrabold font-mono tracking-tight">
            {activeConfig.format(convertedValue)}
          </span>
        </div>

        <Zap className="w-3 h-3 text-amber-400 opacity-80" />
      </button>

      {/* Manual Currency Switcher Quick Filter Pills */}
      <div className="hidden lg:flex items-center space-x-1 text-[10px] font-mono bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-[340px]">
        {(['INR', 'HYRULE_RUPEES', 'DOGE', 'NFT_APES', 'V_BUCKS', 'BELLS', 'WOW_GOLD', 'RS_GP'] as CurrencyMode[]).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`px-1.5 py-0.5 rounded-lg transition-all whitespace-nowrap ${
              currency === c
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {c === 'INR' ? '₹ INR' : c === 'HYRULE_RUPEES' ? '💎 Zelda' : c === 'DOGE' ? '🐕 Doge' : c === 'NFT_APES' ? '🐒 NFT' : c === 'V_BUCKS' ? '🎟️ V-Bucks' : c === 'BELLS' ? '🔔 Bells' : c === 'WOW_GOLD' ? '💰 WoW' : '🦀 RS'}
          </button>
        ))}
      </div>
    </div>
  );
};
