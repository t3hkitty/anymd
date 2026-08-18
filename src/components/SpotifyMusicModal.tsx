import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { SpotifyTrackOrAlbum } from '../plugins/spotifyMusicPlugin';
import {
  SAMPLE_SPOTIFY_COLLECTION,
  linkSpotifyAlbumToVaultBook
} from '../plugins/spotifyMusicPlugin';
import {
  X,
  Disc3,
  Sparkles,
  ExternalLink,
  Plus,
  Check,
  Music2,
  BookOpen,
  BarChart3
} from 'lucide-react';

interface SpotifyMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkAlbum: (newBook: Book) => void;
}

export const SpotifyMusicModal: React.FC<SpotifyMusicModalProps> = ({
  isOpen,
  onClose,
  onLinkAlbum
}) => {
  const [collection, setCollection] = useState<SpotifyTrackOrAlbum[]>(SAMPLE_SPOTIFY_COLLECTION);
  const [activeTab, setActiveTab] = useState<'catalog' | 'link_new'>('catalog');
  const [linkedSuccess, setLinkedSuccess] = useState<string | null>(null);

  // New Album State
  const [newTitle, setNewTitle] = useState('Get Lucky');
  const [newArtist, setNewArtist] = useState('Daft Punk feat. Pharrell Williams');
  const [newAlbum, setNewAlbum] = useState('Random Access Memories');
  const [newYear, setNewYear] = useState(2013);
  const [newSpotifyUrl, setNewSpotifyUrl] = useState('https://open.spotify.com/track/69kOkLUCkxIZYexIgSG8rq');
  const [newFormat, setNewFormat] = useState<SpotifyTrackOrAlbum['physicalFormat']>('Vinyl LP (180g)');
  const [newValue, setNewValue] = useState(38.00);
  const [newMood, setNewMood] = useState('Euphoric Summer Disco Funk');
  const [newGenres, setNewGenres] = useState('Disco, Funk, French House');
  const [newPlayCount, setNewPlayCount] = useState(24);
  const [newListenMins, setNewListenMins] = useState(115);

  if (!isOpen) return null;

  const handleSendToLibrary = (item: SpotifyTrackOrAlbum) => {
    const book = linkSpotifyAlbumToVaultBook(item);
    onLinkAlbum(book);
    setLinkedSuccess(item.id);
    setTimeout(() => {
      setLinkedSuccess(null);
      onClose();
    }, 1200);
  };

  const handleCreateAndSendToLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: SpotifyTrackOrAlbum = {
      id: `sp-${Date.now()}`,
      zettelkastenUid: `${Date.now()}`.slice(0, 14),
      title: newTitle,
      artist: newArtist,
      album: newAlbum,
      releaseYear: newYear,
      spotifyUri: `spotify:track:${Date.now()}`,
      spotifyUrl: newSpotifyUrl,
      physicalFormat: newFormat,
      estimatedValueUsd: newValue,
      acousticMood: newMood,
      genres: newGenres.split(',').map(g => g.trim()),
      playbackStats: {
        playCount: newPlayCount,
        totalListeningMinutes: newListenMins,
        lastPlayedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        skipRatePercent: 0,
        audioBitrate: '24-bit/96kHz Lossless Master',
        peakResonanceTrack: newTitle,
        scrobbleSource: 'Black Box Scrobble Sync'
      },
      resonanceNotes: [
        {
          timestamp: '00:45',
          trackName: newTitle,
          note: `Linked to Black Box vault with playback stats (${newPlayCount} plays): ${newMood}`,
          category: 'Soundstage'
        }
      ]
    };

    setCollection(prev => [newItem, ...prev]);
    const book = linkSpotifyAlbumToVaultBook(newItem);
    onLinkAlbum(book);
    setLinkedSuccess(newItem.id);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10">
              <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight tracking-tight flex items-center space-x-2">
                <span>Black Box Music Linking &bull; Spotify &amp; Vinyl Vault</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  PLAYBACK STATS &bull; SIDECAR GENERATION
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Generate rich companion markdown sidecars with play counts, listening hours, and Zettelkasten serial links.
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
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'catalog'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Music Collection &amp; Albums ({collection.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('link_new')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'link_new'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Link New Spotify / Vinyl Record</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4">
          
          {/* TAB 1: MUSIC COLLECTION */}
          {activeTab === 'catalog' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {collection.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-500/30 text-emerald-300">
                          <Disc3 className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          ${item.estimatedValueUsd.toFixed(2)} USD
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-100 leading-tight">{item.album}</h4>
                        <p className="text-xs text-emerald-400 font-bold mt-0.5">{item.artist}</p>
                        <p className="text-[11px] text-slate-400 mt-1">Track: <em>{item.title}</em> ({item.releaseYear})</p>
                      </div>

                      {/* Playback Stats Bar */}
                      {item.playbackStats && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                            <span className="flex items-center space-x-1">
                              <BarChart3 className="w-3 h-3 text-emerald-400" />
                              <span>Playback Stats</span>
                            </span>
                            <span className="text-emerald-400">{item.playbackStats.playCount} Plays</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Time: {(item.playbackStats.totalListeningMinutes / 60).toFixed(1)} hrs</span>
                            <span className="truncate max-w-[110px]">{item.playbackStats.audioBitrate || 'Lossless'}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 text-[10px] text-slate-400 pt-1">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 block w-fit">
                          📦 {item.physicalFormat}
                        </span>
                        <span className="text-amber-300 block truncate">✨ {item.acousticMood}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <a
                          href={item.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-emerald-400 flex items-center space-x-1 text-[11px]"
                        >
                          <span>Spotify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <span className="text-[10px] text-slate-500 font-mono">
                          ZK: {item.zettelkastenUid.slice(0, 8)}...
                        </span>
                      </div>

                      {/* SEND TO LIBRARY BUTTON WITH PLAYBACK STATS */}
                      <button
                        onClick={() => handleSendToLibrary(item)}
                        className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                        title="Send to Grand Bookcase & Generate Companion Sidecar with Playback Stats"
                      >
                        {linkedSuccess === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Added to Library!</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>📚 Send to Library (+ Playback Stats)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LINK NEW RECORD FORM */}
          {activeTab === 'link_new' && (
            <form onSubmit={handleCreateAndSendToLibrary} className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 animate-fadeIn font-mono">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 font-sans">
                <span className="font-bold text-emerald-300 flex items-center space-x-1.5 text-xs font-mono">
                  <Disc3 className="w-4 h-4 text-emerald-400" />
                  <span>Black Box Linking — Send to Library with Playback Telemetry</span>
                </span>
                <p className="text-slate-300 text-xs">
                  Generate a Sovereign Black Box companion sidecar note for your music collection with Zettelkasten serial linking, listening time, and acoustic telemetry.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Album Title:</label>
                  <input
                    type="text"
                    value={newAlbum}
                    onChange={(e) => setNewAlbum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Artist / Band:</label>
                  <input
                    type="text"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 font-bold text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Featured Track:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Release Year:</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value, 10) || 2026)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Physical Format:</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="Vinyl LP (180g)">Vinyl LP (180g Audiophile)</option>
                    <option value="Vinyl 45RPM">Vinyl 45RPM Single</option>
                    <option value="Lossless FLAC">Lossless FLAC (24-bit/96kHz)</option>
                    <option value="Audio CD (Jewel Case)">Audio CD (Jewel Case)</option>
                    <option value="Cassette Tape">Cassette Tape</option>
                    <option value="Digital Master">Digital Master / Spotify Stream</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Estimated Value ($ USD):</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs"
                    required
                  />
                </div>
              </div>

              {/* Playback Stats Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <label className="text-[11px] text-emerald-400 font-bold block mb-1 flex items-center space-x-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Recorded Play Count:</span>
                  </label>
                  <input
                    type="number"
                    value={newPlayCount}
                    onChange={(e) => setNewPlayCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-emerald-400 font-bold block mb-1 flex items-center space-x-1">
                    <span>Total Listening Time (Minutes):</span>
                  </label>
                  <input
                    type="number"
                    value={newListenMins}
                    onChange={(e) => setNewListenMins(parseInt(e.target.value, 10) || 5)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-bold text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Spotify URL / Link:</label>
                  <input
                    type="text"
                    value={newSpotifyUrl}
                    onChange={(e) => setNewSpotifyUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Genres (Comma separated):</label>
                  <input
                    type="text"
                    value={newGenres}
                    onChange={(e) => setNewGenres(e.target.value)}
                    placeholder="Electronic, Synth-Funk, Disco"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Acoustic Mood / Atmosphere:</label>
                  <input
                    type="text"
                    value={newMood}
                    onChange={(e) => setNewMood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>📚 Send to Library (+ Generate Sidecar with Playback Stats)</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Black Box Linking &bull; Playback Telemetry &bull; Sidecar Generation
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-sans"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
