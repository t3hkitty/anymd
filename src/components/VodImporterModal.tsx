import React, { useState, useEffect } from 'react';
import type { Book } from '../types/resonance';
import type { CloudAccount } from '../types/cloudAccounts';
import {
  convertVodToVaultItem,
  detectPlatformAndThumbnail,
  type VodPlatform,
  type VodMetadataInput
} from '../plugins/vodImporterPlugin';
import {
  X,
  Tv,
  Play,
  Sparkles,
  Link as LinkIcon,
  Clock,
  Video,
  ListOrdered,
  Image as ImageIcon,
  CheckCircle2,
  Cloud,
  FolderSync
} from 'lucide-react';

interface VodImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudAccounts?: CloudAccount[];
  onImportVod: (book: Book) => void;
}

export const VodImporterModal: React.FC<VodImporterModalProps> = ({
  isOpen,
  onClose,
  cloudAccounts = [],
  onImportVod,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [platform, setPlatform] = useState<VodPlatform>('youtube');
  const [durationFormatted, setDurationFormatted] = useState('01:30:00');
  const [resolution, setResolution] = useState('1080p60');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [rawTimestamps, setRawTimestamps] = useState(
    '00:00 - Introduction & Stream Roadmap\n15:30 - Core Architecture Breakdown\n48:10 - Live Coding Session & Refactor\n01:15:00 - Viewer Q&A and Synthesis'
  );
  const [tagsInput, setTagsInput] = useState('stream, tutorial, code-review');
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-detect platform and thumbnail when URL changes
  useEffect(() => {
    if (videoUrl.trim()) {
      const detected = detectPlatformAndThumbnail(videoUrl);
      setPlatform(detected.platform);
      if (detected.thumbnailUrl && !thumbnailUrl) {
        setThumbnailUrl(detected.thumbnailUrl);
      }
      if (detected.suggestedCreator && !creator) {
        setCreator(detected.suggestedCreator);
      }
      if (!title) {
        if (detected.platform === 'twitch') {
          setTitle(`Twitch Break: ${detected.suggestedCreator || 'undiisclosed'} (${detected.videoId || 'VOD'})`);
          setTagsInput('tcg-break, card-opening, pokemon, live-break, twitch');
        } else if (detected.platform === 'youtube') {
          setTitle('YouTube VOD Stream Archive');
        }
      }
    }
  }, [videoUrl]);

  if (!isOpen) return null;

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim() || !title.trim()) return;

    const input: VodMetadataInput = {
      url: videoUrl.trim(),
      title: title.trim(),
      creator: creator.trim() || 'Anonymous Streamer',
      platform,
      durationFormatted,
      resolution,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      description: description.trim(),
      rawTimestampsText: rawTimestamps,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    };

    const book = convertVodToVaultItem(input);
    onImportVod(book);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const torboxAccounts = cloudAccounts.filter(a => a.presetId === 'torbox' || a.serverUrl.includes('torbox.app'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-red-950/80 text-red-400 border border-red-500/40">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
                <span>VOD &amp; Video Stream Importer</span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono font-bold">
                  MEOW MEDIA
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Catalog YouTube, Twitch, Kick, Vimeo &amp; TorBox streams with timestamped chapters.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleImportSubmit} className="p-6 overflow-y-auto space-y-4 font-mono text-xs flex-1">
          
          {/* URL Input */}
          <div className="space-y-1">
            <label className="block text-slate-300 font-bold flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-red-400" />
                <span>Stream / VOD Video URL:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">YouTube, Twitch, Kick, TorBox, direct MP4/M3U8</span>
            </label>
            <input
              type="text"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://twitch.tv/videos/..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Quick Presets for TorBox Streams if available */}
          {torboxAccounts.length > 0 && (
            <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] text-slate-300">Connected TorBox Debrid Stream Bridge:</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPlatform('torbox');
                  if (!videoUrl) setVideoUrl('https://api.torbox.app/v1/api/torrents/requestdl');
                  if (!title) setTitle('TorBox Debrid Stream Archive');
                }}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold hover:bg-cyan-500/30 flex items-center space-x-1"
              >
                <FolderSync className="w-3 h-3" />
                <span>Apply TorBox Stream Template</span>
              </button>
            </div>
          )}

          {/* Title & Creator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">VOD Title:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Work Livestream & Book Analysis"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">Streamer / Channel:</label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="e.g. Primeagen, Lex Fridman, Meow Creator"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Platform, Duration & Resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">Platform:</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as VodPlatform)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="youtube">📺 YouTube</option>
                <option value="twitch">🟣 Twitch VOD / Clip</option>
                <option value="kick">🟢 Kick Stream</option>
                <option value="vimeo">🔵 Vimeo</option>
                <option value="torbox">⚡ TorBox Debrid Stream</option>
                <option value="direct_stream">🌐 Direct HLS / MP4 Stream</option>
                <option value="local_mp4">💾 Local Recording (MP4/MKV)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-bold flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Duration (HH:MM:SS):</span>
              </label>
              <input
                type="text"
                value={durationFormatted}
                onChange={(e) => setDurationFormatted(e.target.value)}
                placeholder="01:30:00"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-bold flex items-center space-x-1">
                <Video className="w-3.5 h-3.5 text-sky-400" />
                <span>Resolution / Quality:</span>
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="1080p60">1080p 60fps Full HD</option>
                <option value="4K UHD">4K UHD (2160p)</option>
                <option value="1440p">1440p 2K Quad HD</option>
                <option value="720p60">720p 60fps HD</option>
                <option value="Audio Only">🎙️ Audio Only Stream</option>
              </select>
            </div>
          </div>

          {/* Thumbnail Preview & URL */}
          <div className="space-y-1">
            <label className="block text-slate-300 font-bold flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cover / Thumbnail Image URL:</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://img.youtube.com/... or custom cover URL"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
              />
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
              )}
            </div>
          </div>

          {/* Chapters & Timestamps Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold flex items-center space-x-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spatial Chapters &amp; Timestamps (1 per line):</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setRawTimestamps('00:00 - Stream Kickoff & Welcome\n05:30 - Sealed Box Inspection & Shrinkwrap Check\n15:00 - Pack Opening & Hit Showcase\n45:00 - Chase Card Toploader & Sleeving\n01:10:00 - Break Recap & Orders Packaged');
                    setTagsInput('tcg-break, card-opening, pokemon, sports-cards, live-break');
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-lg font-bold"
                >
                  🎴 TCG Break Preset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRawTimestamps('00:00 - Stream Start & Intro\n15:30 - Deep Dive Discussion\n45:00 - Live Gameplay & Highlights\n01:30:00 - Chat Q&A & Outro');
                  }}
                  className="text-[10px] text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded-lg font-bold"
                >
                  📺 Standard Stream
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={rawTimestamps}
              onChange={(e) => setRawTimestamps(e.target.value)}
              placeholder="00:00 - Introduction&#10;15:00 - Chapter 1 Analysis&#10;01:20:00 - Conclusion"
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-red-500 leading-relaxed"
            />
          </div>

          {/* Description & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">Tags (comma separated):</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">VOD Notes &amp; Summary:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key takeaways and takeaways..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Footer & Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generates meow <code>.companion.md</code> with timestamped resonance streams</span>
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-red-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Imported into Vault!</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Import VOD to Vault</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
