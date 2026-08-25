import React, { useState } from 'react';
import { X, Send, ShieldCheck, Mail, Code2 } from 'lucide-react';

interface CommunityShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileContent: string;
  onShareSuccess: () => void;
}

export const CommunityShareModal: React.FC<CommunityShareModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileContent,
  onShareSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [certifyNoCopyright, setCertifyNoCopyright] = useState(false);
  const [certifyNoNsfw, setCertifyNoNsfw] = useState(false);
  const [certifyNoMalicious, setCertifyNoMalicious] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  if (!isOpen) return null;

  const canSubmit =
    email.includes('@') &&
    certifyNoCopyright &&
    certifyNoNsfw &&
    certifyNoMalicious;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('submitting');
    // Simulate server side ingest with moderation check
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onShareSuccess();
        onClose();
        setStatus('idle');
        setEmail('');
        setGithub('');
        setCertifyNoCopyright(false);
        setCertifyNoNsfw(false);
        setCertifyNoMalicious(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 font-mono text-xs">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <header className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
          <span className="font-bold text-neutral-100 flex items-center space-x-1.5">
            <ShieldCheck className="text-emerald-400" size={16} />
            <span>Community Hub Publisher</span>
          </span>
          <button onClick={onClose} className="p-1 text-neutral-500 hover:text-neutral-300">
            <X size={16} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block mb-1">Target Note</span>
            <div className="bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-300 select-all font-mono">
              {fileName}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-neutral-400">Contributor Email (for moderation alerts)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="moderator-notices@domain.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 pl-8 text-neutral-200 outline-none focus:border-sky-500/50"
                />
                <Mail size={12} className="absolute left-2.5 top-2.5 text-neutral-600" />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-neutral-400">GitHub Handle (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="github-username"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 pl-8 text-neutral-200 outline-none focus:border-sky-500/50"
                />
                <Code2 size={12} className="absolute left-2.5 top-2.5 text-neutral-600" />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-neutral-800/60 pt-4">
            <label className="flex items-start space-x-2 text-[11px] text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={certifyNoCopyright}
                onChange={(e) => setCertifyNoCopyright(e.target.checked)}
                className="mt-0.5 rounded border-neutral-800 bg-neutral-950 text-sky-500"
              />
              <span>I certify this note contains NO copyrighted or pirated material.</span>
            </label>

            <label className="flex items-start space-x-2 text-[11px] text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={certifyNoNsfw}
                onChange={(e) => setCertifyNoNsfw(e.target.checked)}
                className="mt-0.5 rounded border-neutral-800 bg-neutral-950 text-sky-500"
              />
              <span>I certify this note contains NO NSFW or explicit content.</span>
            </label>

            <label className="flex items-start space-x-2 text-[11px] text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={certifyNoMalicious}
                onChange={(e) => setCertifyNoMalicious(e.target.checked)}
                className="mt-0.5 rounded border-neutral-800 bg-neutral-950 text-sky-500"
              />
              <span>I certify this note contains NO malicious code or links.</span>
            </label>
          </div>

          {status === 'success' ? (
            <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-center font-bold">
              🎉 Shared Successfully! Sent to moderation queue.
            </div>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit || status === 'submitting'}
              className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                canSubmit && status !== 'submitting'
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
              }`}
            >
              <span>{status === 'submitting' ? 'Publishing...' : 'Publish to Community Hub'}</span>
              <Send size={12} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
