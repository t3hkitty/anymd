import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { MediaItem } from '../types/mediaTypes';
import type { WebDAVConfig } from '../types/plugins';
import { generateStandaloneShowcaseHtml, publishHtmlToWebDAV } from '../plugins/htmlPublisherPlugin';
import { X, Globe, Download, Upload, Copy, Check, Code2 } from 'lucide-react';

interface HtmlPublishModalProps {
  isOpen: boolean;
  books: Book[];
  mediaItems: MediaItem[];
  webdavConfig: WebDAVConfig;
  onClose: () => void;
}

export const HtmlPublishModal: React.FC<HtmlPublishModalProps> = ({
  isOpen,
  books,
  mediaItems,
  webdavConfig,
  onClose,
}) => {
  const [siteTitle, setSiteTitle] = useState('Meow Grand Library & TCG Vault');
  const [remoteFilename, setRemoteFilename] = useState('library_showcase.html');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ success: boolean; publicUrl: string; error?: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const htmlContent = generateStandaloneShowcaseHtml(books, mediaItems, siteTitle);

  // Download Standalone Static HTML File
  const handleDownloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = remoteFilename || 'library_showcase.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Publish directly to Self-Hosted WebDAV Server
  const handlePublishWebDAV = async () => {
    setIsPublishing(true);
    setPublishStatus(null);

    const res = await publishHtmlToWebDAV(htmlContent, webdavConfig, remoteFilename);
    setIsPublishing(false);
    setPublishStatus(res);
  };

  const publicShareUrl = publishStatus?.publicUrl || `${webdavConfig.serverUrl}${remoteFilename}`;
  const iframeEmbedCode = `<iframe src="${publicShareUrl}" width="100%" height="800" frameborder="0" style="border-radius:16px; border:1px solid #334155;"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(iframeEmbedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">HTML Showcase & Self-Hosted Publisher</h3>
              <p className="text-xs text-slate-400">Single-File HTML &bull; Self-Hosted WebDAV Upload &bull; Embed Codes & Share Links</p>
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-mono text-xs">
          
          {/* Site Title & Output Filename Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Showcase Site Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Target HTML Filename</label>
              <input
                type="text"
                value={remoteFilename}
                onChange={(e) => setRemoteFilename(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Option 1: Download Standalone HTML */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center space-x-1.5 text-xs">
                <Download className="w-4 h-4 text-amber-400" />
                <span>1. Download Standalone Static HTML File</span>
              </span>
              <button
                onClick={handleDownloadHtml}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {remoteFilename}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Downloads a 100% self-contained static HTML page containing your books, TCG cards, market valuations, and provenance links. You can host this file anywhere or double-click to view in any browser!
            </p>
          </div>

          {/* Option 2: Self-Hosted WebDAV Publisher */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 flex items-center space-x-1.5 text-xs">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>2. Publish to Self-Hosted WebDAV / Web Server</span>
              </span>

              <button
                onClick={handlePublishWebDAV}
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1 transition-all disabled:opacity-50"
              >
                {isPublishing ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload to Server</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Target Server: <code className="text-amber-300">{webdavConfig.serverUrl || 'Not configured in Cloud Accounts'}</code>
            </p>

            {publishStatus && (
              <div className={`p-3 rounded-xl border text-xs font-mono ${
                publishStatus.success ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}>
                {publishStatus.success ? (
                  <div className="space-y-1">
                    <p className="font-bold">✓ Successfully published to self-hosted server!</p>
                    <a href={publishStatus.publicUrl} target="_blank" rel="noopener noreferrer" className="underline block truncate text-amber-300">
                      {publishStatus.publicUrl}
                    </a>
                  </div>
                ) : (
                  <p>❌ Upload failed: {publishStatus.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Option 3: Public Share Link & Embed Code */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 flex items-center space-x-1.5 text-xs">
              <Code2 className="w-4 h-4 text-sky-400" />
              <span>3. Public Share Link & Embed Code</span>
            </span>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Public Shareable Link URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={publicShareUrl}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-sky-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shrink-0 flex items-center space-x-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">HTML &lt;iframe&gt; Embed Code</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={iframeEmbedCode}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-mono text-purple-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyEmbed}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shrink-0 flex items-center space-x-1"
                  >
                    {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmbed ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">HTML Publisher Engine v3.8</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
