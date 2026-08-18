import React, { useState } from 'react';
import type { CurationMonetizationConfig } from '../plugins/monetizationPlugin';
import { getSavedMonetizationConfig, saveMonetizationConfig } from '../plugins/monetizationPlugin';
import { getDefaultSidecarPrice, setDefaultSidecarPrice } from '../plugins/sidecarPricingPlugin';
import { X, DollarSign, Sparkles, Check, ShieldCheck, Tag, ShoppingBag, Coins } from 'lucide-react';

interface MonetizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateDefaultPrice?: (newPrice: number) => void;
}

export const MonetizationSettingsModal: React.FC<MonetizationSettingsModalProps> = ({
  isOpen,
  onClose,
  onUpdateDefaultPrice
}) => {
  const [settings, setSettings] = useState<CurationMonetizationConfig>(getSavedMonetizationConfig);
  const [defaultSidecarPrice, setLocalDefaultPrice] = useState<number>(getDefaultSidecarPrice);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMonetizationConfig(settings);
    setDefaultSidecarPrice(defaultSidecarPrice);
    if (onUpdateDefaultPrice) {
      onUpdateDefaultPrice(defaultSidecarPrice);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Curation Monetization &amp; Sidecar Pricing Settings</h3>
              <p className="text-xs text-slate-400">Default Digital Sidecar Valuation &bull; Storefronts &bull; Affiliate Links</p>
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          
          {/* 1. Default New Sidecar / Digital File Price Setting */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/50 via-slate-950 to-indigo-950/50 border border-amber-500/60 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-300 text-sm">Default Digital Sidecar Price Setting</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs">
                Active: ${(defaultSidecarPrice).toFixed(2)} USD
              </span>
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed">
              Sets the baseline replacement value for newly generated sidecars and digital files (default: <strong>$0.01 / one cent</strong>). If you wipe the vault and re-add sample books, they will be automatically regenerated with this active default price.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
              <span className="text-[11px] text-slate-400">Quick Presets:</span>
              {[
                { label: '1¢ (Default)', val: 0.01 },
                { label: '5¢ ($0.05)', val: 0.05 },
                { label: '10¢ ($0.10)', val: 0.10 },
                { label: '25¢ ($0.25)', val: 0.25 },
                { label: '$1.00', val: 1.00 },
                { label: '$5.00', val: 5.00 }
              ].map(preset => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setLocalDefaultPrice(preset.val)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    defaultSidecarPrice === preset.val
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <label className="text-[11px] text-slate-400 font-sans">Custom Default Price ($ USD):</label>
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  value={defaultSidecarPrice}
                  onChange={(e) => setLocalDefaultPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-bold font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Banner Toggle */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/60 flex items-center justify-between gap-4 font-mono text-xs shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-emerald-300 text-sm">Monetize Shared Curation &amp; Reading Lists</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                Automatically attaches your custom affiliate tags to shared library links, OPDS feeds &amp; Google Sheets exports.
              </p>
            </div>

            <button
              onClick={() => setSettings({ ...settings, isMonetizationEnabled: !settings.isMonetizationEnabled })}
              className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 shadow-md ${
                settings.isMonetizationEnabled
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {settings.isMonetizationEnabled ? '🟢 Enabled' : '🔴 Disabled'}
            </button>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Book & Curation Affiliate Tags */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Tag className="w-4 h-4" />
                <span>Book &amp; Curation Affiliate Tags</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Amazon Associate Tag (tag=):</label>
                  <input
                    type="text"
                    value={settings.amazonAssociateTag}
                    onChange={(e) => setSettings({ ...settings, amazonAssociateTag: e.target.value })}
                    placeholder="e.g. artkitty-20"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Newegg Publisher / Affiliate ID:</label>
                  <input
                    type="text"
                    value={settings.neweggAffiliateId}
                    onChange={(e) => setSettings({ ...settings, neweggAffiliateId: e.target.value })}
                    placeholder="e.g. newegg-artkitty-20"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">B&amp;H Photo &amp; Video Affiliate ID:</label>
                  <input
                    type="text"
                    value={settings.bhPhotoAffiliateId}
                    onChange={(e) => setSettings({ ...settings, bhPhotoAffiliateId: e.target.value })}
                    placeholder="e.g. bh-artkitty-2026"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sky-300"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Micro Center Store / Campaign Tag:</label>
                  <input
                    type="text"
                    value={settings.microCenterTag}
                    onChange={(e) => setSettings({ ...settings, microCenterTag: e.target.value })}
                    placeholder="e.g. mc-artkitty-vault"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300"
                  />
                </div>
              </div>
            </div>

            {/* Creator Merch & Storefront Accounts */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Artist Merch &amp; Storefront Accounts</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Redbubble Store URL:</label>
                  <input
                    type="text"
                    value={settings.redbubbleStoreUrl}
                    onChange={(e) => setSettings({ ...settings, redbubbleStoreUrl: e.target.value })}
                    placeholder="https://www.redbubble.com/people/artkitty/shop"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-300"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">INPRNT Gallery URL:</label>
                  <input
                    type="text"
                    value={settings.inprntStoreUrl}
                    onChange={(e) => setSettings({ ...settings, inprntStoreUrl: e.target.value })}
                    placeholder="https://www.inprnt.com/gallery/artkitty/"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Etsy Shop URL:</label>
                  <input
                    type="text"
                    value={settings.etsyStoreUrl}
                    onChange={(e) => setSettings({ ...settings, etsyStoreUrl: e.target.value })}
                    placeholder="https://www.etsy.com/shop/ArtKittyStudio"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Settings &amp; Default Price Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>💾 Save Pricing &amp; Monetization Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between font-sans">
          <span className="text-xs text-slate-400 font-mono">
            Default Sidecar Valuation: ${(defaultSidecarPrice).toFixed(2)} USD &bull; Sovereign Self-Hosted Monetization
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
