import React, { useState } from 'react';
import type { UserProfile } from '../plugins/profileManagementPlugin';
import {
  getSavedProfiles,
  getActiveProfile,
  setActiveProfileId,
  registerNewUser,
  updateExistingProfile,
  getMeowInviteCode,
  setMeowInviteCode
} from '../plugins/profileManagementPlugin';
import {
  X,
  User,
  Key,
  Check,
  ShieldCheck,
  Edit3,
  Users,
  UserPlus,
  AlertCircle
} from 'lucide-react';

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileChanged?: (profile: UserProfile) => void;
}

const EMOJI_AVATARS = ['🐱', '🐧', '🐉', '⚔️', '🎨', '💻', '📚', '✨', '🦊', '🌸', '👑', '🚀'];

const AVAILABLE_GENRES = [
  'LitRPG & Cultivation',
  'Danmei / SVSSS',
  'Cozy Fantasy',
  'TCG Grails',
  'PC Rig Builds',
  'Sci-Fi & Cyberpunk',
  'Romance & High Fantasy',
  'Graphic Novels & Manga',
  'Homelab & Self-Hosting',
  'Fine Art & Watercolor'
];

export const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({
  isOpen,
  onClose,
  onProfileChanged
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'switch' | 'register'>('current');
  const [profiles, setProfiles] = useState<UserProfile[]>(getSavedProfiles);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(getActiveProfile);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(currentProfile.displayName);
  const [editAvatar, setEditAvatar] = useState(currentProfile.avatarEmoji);
  const [editBio, setEditBio] = useState(currentProfile.bio);
  const [editGenres, setEditGenres] = useState<string[]>(currentProfile.favoriteGenres);
  const [editStoreUrl, setEditStoreUrl] = useState(currentProfile.customLinks?.storeUrl || '');
  const [editAffiliateTag, setEditAffiliateTag] = useState(currentProfile.customLinks?.affiliateTag || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Registration State (with invite code 'meow')
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regAvatar, setRegAvatar] = useState('🐱');
  const [regBio, setRegBio] = useState('');
  const [regRole, setRegRole] = useState<UserProfile['role']>('Family Member');
  const [regGenres, setRegGenres] = useState<string[]>(['LitRPG & Cultivation', 'Cozy Fantasy']);
  const [regInviteCode, setRegInviteCode] = useState('');
  const [masterInviteCode, setMasterInviteCode] = useState(getMeowInviteCode);
  const [customInviteInput, setCustomInviteInput] = useState(getMeowInviteCode);
  const [inviteUpdatedMsg, setInviteUpdatedMsg] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleGenre = (genre: string, isEdit: boolean) => {
    if (isEdit) {
      if (editGenres.includes(genre)) {
        setEditGenres(editGenres.filter(g => g !== genre));
      } else {
        setEditGenres([...editGenres, genre]);
      }
    } else {
      if (regGenres.includes(genre)) {
        setRegGenres(regGenres.filter(g => g !== genre));
      } else {
        setRegGenres([...regGenres, genre]);
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentProfile,
      displayName: editDisplayName.trim() || currentProfile.username,
      avatarEmoji: editAvatar,
      bio: editBio.trim(),
      favoriteGenres: editGenres,
      customLinks: {
        storeUrl: editStoreUrl.trim() || undefined,
        affiliateTag: editAffiliateTag.trim() || undefined
      }
    };

    updateExistingProfile(updated);
    setCurrentProfile(updated);
    const refreshed = getSavedProfiles();
    setProfiles(refreshed);
    setIsEditing(false);
    setSavedSuccess(true);
    if (onProfileChanged) onProfileChanged(updated);

    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSwitchUser = (profile: UserProfile) => {
    setActiveProfileId(profile.id);
    setCurrentProfile(profile);
    setEditDisplayName(profile.displayName);
    setEditAvatar(profile.avatarEmoji);
    setEditBio(profile.bio);
    setEditGenres(profile.favoriteGenres);
    setEditStoreUrl(profile.customLinks?.storeUrl || '');
    setEditAffiliateTag(profile.customLinks?.affiliateTag || '');
    setActiveTab('current');
    if (onProfileChanged) onProfileChanged(profile);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const result = registerNewUser(
      regUsername,
      regDisplayName,
      regAvatar,
      regBio,
      regRole,
      regGenres,
      regInviteCode
    );

    if (!result.success) {
      setRegError(result.message);
      return;
    }

    if (result.profile) {
      setRegSuccess(result.message);
      const refreshed = getSavedProfiles();
      setProfiles(refreshed);
      handleSwitchUser(result.profile);

      // Reset form
      setRegUsername('');
      setRegDisplayName('');
      setRegBio('');
      setRegInviteCode('');

      setTimeout(() => {
        setRegSuccess(null);
        setActiveTab('current');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 text-lg">
              {currentProfile.avatarEmoji || '🐱'}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Profile Management & Meow Accounts</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  Invite: {masterInviteCode}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Manage Active User &bull; Switch Accounts &bull; Register with Invite Code '{masterInviteCode}'</p>
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
        <div className="px-6 pt-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'current'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Active Profile (@{currentProfile.username})</span>
          </button>

          <button
            onClick={() => setActiveTab('switch')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'switch'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch Profile ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'register'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Register (Code: {masterInviteCode})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* TAB 1: CURRENT ACTIVE PROFILE */}
          {activeTab === 'current' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Profile Card Header */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-amber-500/50 flex items-center justify-center text-3xl shadow-md">
                    {currentProfile.avatarEmoji}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-white text-base">{currentProfile.displayName}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                        @{currentProfile.username}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400/90 font-mono">{currentProfile.role}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Member since {currentProfile.joinedDate} &bull; Validated via invite code <code className="text-amber-300">'{currentProfile.inviteCodeUsed || 'meow'}'</code></p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all self-end sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              {/* Edit Profile Form */}
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs animate-fadeIn">
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Edit Profile Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Display Name:</label>
                      <input
                        type="text"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Choose Avatar Emoji:</label>
                      <div className="flex items-center space-x-1 overflow-x-auto p-1 bg-slate-900 rounded-xl border border-slate-800">
                        {EMOJI_AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setEditAvatar(emoji)}
                            className={`p-1.5 rounded-lg text-base transition-all ${
                              editAvatar === emoji ? 'bg-amber-500/30 border border-amber-500/50 scale-110' : 'hover:bg-slate-800'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Bio & Curation Focus:</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-sans"
                    />
                  </div>

                  {/* Favorite Genres Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 block font-bold">Favorite Genres & Interests:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_GENRES.map((genre) => {
                        const isSelected = editGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => handleToggleGenre(genre, true)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Storefront / Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Portfolio / Storefront URL:</label>
                      <input
                        type="url"
                        value={editStoreUrl}
                        onChange={(e) => setEditStoreUrl(e.target.value)}
                        placeholder="https://meow.artkitty.net or Redbubble"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Primary Affiliate / Associate Tag:</label>
                      <input
                        type="text"
                        value={editAffiliateTag}
                        onChange={(e) => setEditAffiliateTag(e.target.value)}
                        placeholder="e.g. artkitty-20"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
                  
                  {/* Bio */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold block uppercase">About / Bio:</span>
                    <p className="text-slate-200 font-sans text-xs leading-relaxed">{currentProfile.bio || 'No bio specified.'}</p>
                  </div>

                  {/* Favorite Genres */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    <span className="text-[11px] text-slate-400 font-bold block uppercase">Favorite Genres & Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentProfile.favoriteGenres.map((g) => (
                        <span key={g} className="px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 border border-slate-800 text-[11px] font-bold">
                          ★ {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security & SSL Fingerprint */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-bold text-[11px]">Meow Local Authentication Fingerprint:</span>
                    </div>
                    <code className="text-[10px] text-slate-300 block truncate">{currentProfile.sslFingerprint || 'Generated on Local Meow Node'}</code>
                  </div>
                </div>
              )}

              {savedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: SWITCH PROFILE */}
          {activeTab === 'switch' && (
            <div className="space-y-4 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Registered Meow Accounts ({profiles.length})</span>
                </h4>
                <span className="text-[11px] text-slate-500">Click to switch active account</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map((p) => {
                  const isActive = p.id === currentProfile.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSwitchUser(p)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isActive
                          ? 'bg-sky-950/40 border-sky-400/80 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
                            {p.avatarEmoji}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-100 text-xs">{p.displayName}</h5>
                            <span className="text-[10px] text-sky-300 font-bold">@{p.username}</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">{p.bio}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-500">
                        <span>Role: {p.role}</span>
                        <span>Invite: '{p.inviteCodeUsed || 'meow'}'</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER NEW USER (WITH INVITE CODE 'meow') */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="p-5 rounded-3xl bg-slate-950 border border-emerald-500/50 space-y-4 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Register Meow Account (Invite Code Required)</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Required Code: '{masterInviteCode}'
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-[11px] font-sans">
                Registration on this self-hosted meow node is invite-only. Enter the master invite code <strong>'{masterInviteCode}'</strong> to create your local profile.
              </div>

              {/* Invite Code Input Field */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2">
                <label className="text-[11px] text-amber-300 font-bold block flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Secret Meow Invite Code:</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={regInviteCode}
                    onChange={(e) => setRegInviteCode(e.target.value)}
                    placeholder={`Enter invite code (e.g. ${masterInviteCode})`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-bold tracking-wider"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setRegInviteCode(masterInviteCode)}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold shrink-0"
                  >
                    Auto-Fill '{masterInviteCode}'
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Username (handle):</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. guest_kitty"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Display Name:</label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="e.g. Guest Reader & Curator"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Avatar Emoji:</label>
                  <div className="flex items-center space-x-1 overflow-x-auto p-1 bg-slate-900 rounded-xl border border-slate-800">
                    {EMOJI_AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setRegAvatar(emoji)}
                        className={`p-1.5 rounded-lg text-base transition-all ${
                          regAvatar === emoji ? 'bg-emerald-500/30 border border-emerald-500/50 scale-110' : 'hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Account Role:</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserProfile['role'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-bold"
                  >
                    <option value="Family Member">Family Member</option>
                    <option value="Curator & Artist">Curator & Artist</option>
                    <option value="Guest Reader">Guest Reader</option>
                    <option value="Admin / Vault Owner">Admin / Vault Owner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Bio:</label>
                <input
                  type="text"
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="e.g. Reader, gamer, and digital art collector"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              {/* Favorite Genres Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 block font-bold">Interests / Genres:</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_GENRES.map((genre) => {
                    const isSelected = regGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleToggleGenre(genre, false)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {regError && (
                <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Self-Config Invite Code Setting for Admin */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                    <Key className="w-3.5 h-3.5" />
                    <span>Node Admin: Customize / Rotate Secret Invite Code:</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Saved in Local Config</span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customInviteInput}
                    onChange={(e) => setCustomInviteInput(e.target.value)}
                    placeholder="Enter custom invite code (e.g. meow)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMeowInviteCode(customInviteInput);
                      setMasterInviteCode(customInviteInput);
                      setInviteUpdatedMsg(true);
                      setTimeout(() => setInviteUpdatedMsg(false), 2000);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold"
                  >
                    {inviteUpdatedMsg ? '✓ Updated!' : 'Save New Code'}
                  </button>
                </div>
              </div>

              {/* Terms of Service & Privacy Agreement Acknowledgment */}
              <div className="flex items-center space-x-2 pt-2 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  id="agree-tos"
                  defaultChecked
                  required
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="agree-tos" className="cursor-pointer">
                  I agree to the <span className="text-indigo-300 underline font-bold">Terms of Service</span> &amp; <span className="text-emerald-300 underline font-bold">Privacy Policy</span> (Local-First Zero-Data Guarantee).
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md transition-all flex items-center space-x-1.5 text-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Verify Code & Register Account</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Active: <strong className="text-amber-300">@{currentProfile.username}</strong> ({currentProfile.displayName})
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
