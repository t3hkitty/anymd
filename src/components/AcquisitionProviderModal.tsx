import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { generateAllAcquisitionLinks } from '../plugins/acquisitionPlugins';
import { commitAcquisitionDeepLinksToSidecar } from '../utils/deepLinkGenerator';
import { X, ShoppingBag, ExternalLink, Check, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

interface AcquisitionProviderModalProps {
  isOpen: boolean;
  book: Book;
  onClose: () => void;
  onUpdateBookSidecar: (bookId: string, updatedSidecarMd: string) => void;
}

export const AcquisitionProviderModal: React.FC<AcquisitionProviderModalProps> = ({
  isOpen,
  book,
  onClose,
  onUpdateBookSidecar,
}) => {
  const [committed, setCommitted] = useState(false);
  const [isKuEnabled, setIsKuEnabled] = useState(book.sidecarMarkdown.includes('kindle_unlimited: true'));
  const [borrowedDate, setBorrowedDate] = useState('2020-11-08');

  if (!isOpen) return null;

  const links = generateAllAcquisitionLinks(book.title, book.author);

  const handleToggleKU = () => {
    const nextKu = !isKuEnabled;
    setIsKuEnabled(nextKu);

    let updatedMarkdown = book.sidecarMarkdown;
    if (nextKu) {
      if (!updatedMarkdown.includes('kindle_unlimited:')) {
        updatedMarkdown = updatedMarkdown.replace(
          /---\n/,
          `---\nkindle_unlimited: true\nborrowed_date: "${borrowedDate}"\n`
        );
      }
      if (!updatedMarkdown.includes('#kindle-unlimited')) {
        updatedMarkdown += `\n- **[Kindle Unlimited]** *Borrowed with Kindle Unlimited on ${borrowedDate}*\n`;
      }
    }

    onUpdateBookSidecar(book.id, updatedMarkdown);
  };

  const handleCommitLinks = () => {
    const updatedSidecar = commitAcquisitionDeepLinksToSidecar(book.sidecarMarkdown, links);
    onUpdateBookSidecar(book.id, updatedSidecar);
    setCommitted(true);
    setTimeout(() => {
      setCommitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Content Acquisition & Deep-Link Sourcing</h3>
              <p className="text-xs text-slate-400">eBay &bull; Newegg &bull; Facebook Marketplace &bull; Nextdoor &bull; Kindle &bull; Libby &bull; Gutenberg</p>
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
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h4 className="font-bold text-sm text-slate-100">{book.title}</h4>
            <p className="text-xs text-slate-400 font-mono">Author: {book.author}</p>
          </div>

          {/* Meow 100% Non-Monetized Shield Guarantee */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 space-y-1">
            <div className="flex items-center space-x-2 font-bold font-mono text-[11px] text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Zero-Affiliate & Non-Monetized Guarantee</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Library Companion MD contains <strong>ZERO monetary links, tracking parameters, or affiliate codes</strong>. All generated store links are direct canonical URLs. Developers can enable their own custom plugin (<code>custom-monetizer-plugin</code>) in Plugin Manager if they wish to attach custom referral codes!
            </p>
          </div>

          {/* Kindle Unlimited (KU) Enable Sourcing Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📚</span>
                <div>
                  <h4 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider font-mono">
                    Kindle Unlimited (KU) Sourcing & Sync
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Borrowed with Kindle Unlimited on {borrowedDate}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleKU}
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 ${
                  isKuEnabled
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isKuEnabled ? <Check className="w-4 h-4 text-slate-950" /> : <BookOpen className="w-4 h-4 text-amber-400" />}
                <span>{isKuEnabled ? 'KU Active & Synced' : 'Enable KU Sourcing'}</span>
              </button>
            </div>

            {isKuEnabled && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Borrowed Date:</span>
                  <input
                    type="text"
                    value={borrowedDate}
                    onChange={(e) => setBorrowedDate(e.target.value)}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 text-xs focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-emerald-400">
                  ✅ Added <code>kindle_unlimited: true</code> & <code>#kindle-unlimited</code> tag to YAML frontmatter sidecar!
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Discovered Acquisition Deep-Links ({links.length})
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <span className="text-xl">{link.icon}</span>
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs text-slate-200 truncate group-hover:text-amber-300">
                        {link.providerName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{link.label}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">Sidecar Frontmatter: kindle_unlimited</span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={handleCommitLinks}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all"
            >
              {committed ? <Check className="w-4 h-4 text-slate-950" /> : <Sparkles className="w-4 h-4" />}
              <span>{committed ? 'Committed to .md!' : 'Commit Deep-Links to .md Sidecar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
