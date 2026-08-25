import React, { useState } from 'react';
import { LEGAL_TERMS_SECTIONS } from '../plugins/legalAgreementPlugin';
import {
  X,
  FileText,
  ShieldCheck,
  Globe2,
  Scale,
  Copy,
  Check,
  Info
} from 'lucide-react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTabId, setActiveTabId] = useState<string>('tos');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSection = LEGAL_TERMS_SECTIONS.find(s => s.id === activeTabId) || LEGAL_TERMS_SECTIONS[0];

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentSection.content);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500 text-slate-950 font-bold shadow-lg shadow-indigo-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Standard International Terms of Service (ToS) & Legal Agreements</span>
              </h3>
              <p className="text-xs text-slate-400">US (CCPA/DMCA) &bull; EU/UK (GDPR) &bull; Canada (PIPEDA) &bull; Australia (ACL) &bull; MIT Licensed</p>
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
        <div className="px-6 pt-4 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/40 overflow-x-auto">
          {LEGAL_TERMS_SECTIONS.map((section) => {
            const isActive = activeTabId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTabId(section.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 shrink-0 flex items-center space-x-1.5 ${
                  isActive
                    ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {section.id === 'tos' && <FileText className="w-3.5 h-3.5" />}
                {section.id === 'privacy' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                {section.id === 'dmca' && <Scale className="w-3.5 h-3.5 text-amber-400" />}
                {section.id === 'jurisdictions' && <Globe2 className="w-3.5 h-3.5 text-sky-400" />}
                <span>{section.title.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          
          {/* Active Section Info Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Applicable Jurisdiction:</span>
              <strong className="text-indigo-300 text-xs">{currentSection.jurisdiction}</strong>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[10px] text-slate-500">Effective: {currentSection.lastUpdated}</span>
              <button
                onClick={handleCopyText}
                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center space-x-1 transition-all"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSuccess ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Legal Text Render Box */}
          <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 text-slate-300 text-xs font-sans leading-relaxed space-y-4 shadow-inner">
            {currentSection.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={index} className="font-extrabold text-sm text-slate-100 border-b border-slate-800/80 pb-1.5 pt-2 flex items-center space-x-2">
                    <span>{paragraph.replace('### ', '')}</span>
                  </h4>
                );
              }
              return (
                <p key={index} className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Meow Local-First Privacy Certification Note */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-mono flex items-center space-x-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Zero Server-Side Storage:</strong> This software stores 0 bytes of personal telemetry on remote servers. All assets, keys, and notes are processed locally in your browser.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Standard Country Legal Terms (US/EU/UK/CA/AU/JP) &bull; MIT License
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            I Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
};
