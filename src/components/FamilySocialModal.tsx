import React, { useState } from 'react';
import type { FamilyFriend, FamilyActivityItem } from '../plugins/familySocialPlugin';
import { getSavedFamilyFriends, saveFamilyFriends, INITIAL_FAMILY_FEED } from '../plugins/familySocialPlugin';
import { X, Users, UserPlus } from 'lucide-react';

interface FamilySocialModalProps {
  isOpen: boolean;
  activeThemeId: string;
  onClose: () => void;
  onSwitchTheme: (themeId: string) => void;
}

export const FamilySocialModal: React.FC<FamilySocialModalProps> = ({
  isOpen,
  activeThemeId,
  onClose,
  onSwitchTheme,
}) => {
  const [friends, setFriends] = useState<FamilyFriend[]>(getSavedFamilyFriends);
  const [feed, setFeed] = useState<FamilyActivityItem[]>(INITIAL_FAMILY_FEED);
  const [activeTab, setActiveTab] = useState<'feed' | 'family'>('feed');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [newFriendRelation, setNewFriendRelation] = useState<'Wife' | 'Husband' | 'Sibling' | 'Parent' | 'Child' | 'Friend'>('Wife');
  const [newFriendPokemon, setNewFriendPokemon] = useState('🐧 Piplup');

  if (!isOpen) return null;

  const handleToggleFollow = (friendId: string) => {
    const updated = friends.map(f => f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f);
    setFriends(updated);
    saveFamilyFriends(updated);
  };

  const handleAddReaction = (activityId: string, emoji: string) => {
    setFeed(prev => prev.map(act => {
      if (act.id === activityId) {
        const existingRx = act.reactions.find(r => r.emoji === emoji);
        let newReactions = [...act.reactions];
        if (existingRx) {
          newReactions = newReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
        } else {
          newReactions.push({ emoji, count: 1, reactedBy: ['You'] });
        }
        return { ...act, reactions: newReactions };
      }
      return act;
    }));
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim() || !newFriendEmail.trim()) return;

    const newF: FamilyFriend = {
      id: `friend-${Date.now()}`,
      name: newFriendName,
      email: newFriendEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      relationship: newFriendRelation,
      favoritePokemon: newFriendPokemon,
      themePreference: newFriendPokemon.includes('Piplup') ? 'piplup-dawn' : 'midnight',
      isFollowing: true,
      isFriend: true,
      currentlyReading: 'Meow Companion Vault',
      lastActive: 'Just now'
    };

    const updated = [newF, ...friends];
    setFriends(updated);
    saveFamilyFriends(updated);
    setNewFriendName('');
    setNewFriendEmail('');
    setIsAddingFriend(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Users className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Family Social Feed & Friending</h3>
              <p className="text-xs text-slate-400">Connect with Family Members &bull; Piplup & Dawn Reader Theme &bull; Activity Stream</p>
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
          
          {/* Piplup & Dawn Reader Theme Highlight Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-400/60 flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🐧
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-sky-200 flex items-center space-x-2">
                  <span>Piplup & Dawn Theme Mode</span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] uppercase">
                    ✨ Dawn Contest Ribbon
                  </span>
                </h4>
                <p className="text-xs text-slate-300">
                  Sinnoh Sapphire Ocean & Ice Pearl Theme designed for Piplup & Dawn lovers!
                </p>
              </div>
            </div>

            <button
              onClick={() => onSwitchTheme('piplup-dawn')}
              className={`px-4 py-2 rounded-2xl font-bold text-xs shadow-md transition-all shrink-0 border ${
                activeThemeId === 'piplup-dawn'
                  ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-sky-400/20'
                  : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400'
              }`}
            >
              {activeThemeId === 'piplup-dawn' ? '🐧 Piplup Theme Active' : 'Activate Piplup Theme 🐧'}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'feed'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                📰 Family Activity Feed ({feed.length})
              </button>

              <button
                onClick={() => setActiveTab('family')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'family'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                👥 Family Friends ({friends.length})
              </button>
            </div>

            <button
              onClick={() => setIsAddingFriend(!isAddingFriend)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-300 font-bold flex items-center space-x-1 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Family Friend</span>
            </button>
          </div>

          {/* Add Family Friend Form */}
          {isAddingFriend && (
            <form onSubmit={handleAddFriend} className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/60 space-y-3 font-mono text-xs animate-fadeIn">
              <h4 className="font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Invite / Connect Family Member</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  placeholder="Family Member Name (e.g. Wife, Brother)"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  required
                />
                <input
                  type="email"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  placeholder="Google Email (e.g. wife.piplup@gmail.com)"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={newFriendRelation}
                  onChange={(e) => setNewFriendRelation(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sky-300 font-bold"
                >
                  <option value="Wife">Wife</option>
                  <option value="Husband">Husband</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                </select>

                <input
                  type="text"
                  value={newFriendPokemon}
                  onChange={(e) => setNewFriendPokemon(e.target.value)}
                  placeholder="Favorite Pokemon (e.g. 🐧 Piplup)"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Connect Family Member
                </button>
              </div>
            </form>
          )}

          {/* Activity Feed Tab */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {feed.map((act) => (
                <div
                  key={act.id}
                  className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={act.friendAvatar}
                        alt={act.friendName}
                        className="w-10 h-10 rounded-full border border-sky-400 object-cover"
                      />
                      <div>
                        <span className="font-bold text-sm text-slate-100 block">{act.friendName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{act.timestamp} &bull; {act.bookTitle}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold">
                      {act.action.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                    {act.content}
                  </p>

                  <div className="flex items-center space-x-2 pt-1 font-mono text-xs">
                    <span className="text-[11px] text-slate-400 font-bold">Reactions:</span>
                    {act.reactions.map((rx, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddReaction(act.id, rx.emoji)}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1 transition-all"
                      >
                        <span>{rx.emoji}</span>
                        <span className="text-amber-400 text-[11px]">{rx.count}</span>
                      </button>
                    ))}
                    {['🐧', '💦', '✨', '🎀', '🔥', '👑'].map((emo) => (
                      <button
                        key={emo}
                        onClick={() => handleAddReaction(act.id, emo)}
                        className="p-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title={`React with ${emo}`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Family Friends Tab */}
          {activeTab === 'family' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {friends.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={f.avatar}
                        alt={f.name}
                        className="w-12 h-12 rounded-full border border-sky-400 object-cover"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-100">{f.name}</h4>
                        <span className="text-[11px] text-sky-400 font-mono block font-bold">{f.relationship} &bull; {f.favoritePokemon || '🐧 Piplup'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(f.id)}
                      className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                        f.isFollowing
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-indigo-600 text-white shadow-md'
                      }`}
                    >
                      {f.isFollowing ? 'Following ✓' : '+ Follow'}
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono space-y-1">
                    <span className="text-slate-500 block">Currently Reading:</span>
                    <span className="text-amber-300 font-bold block truncate">{f.currentlyReading}</span>
                    <span className="text-slate-400 text-[10px] block">Theme: {f.themePreference}</span>
                  </div>

                  {f.themePreference === 'piplup-dawn' && (
                    <button
                      onClick={() => onSwitchTheme('piplup-dawn')}
                      className="w-full py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 font-bold text-xs flex items-center justify-center space-x-1 transition-all"
                    >
                      <span>🐧 Match {f.name}'s Piplup Theme</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Connected to Midphase Family Server
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
