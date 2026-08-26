import React, { useState } from 'react';
import { X, FolderOpen, Cloud, HardDrive, AlertTriangle, Sparkles } from 'lucide-react';

interface AddVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVault: (vaultData: {
    id: string;
    name: string;
    category: string;
    storageType: 'local_storage' | 'local_picker' | 'n8n_cloud' | 'lcmd_personal' | 'lcmd_sandbox';
    dirHandle: FileSystemDirectoryHandle | null;
    endpointUrl: string;
  }) => void;
}

export const AddVaultModal: React.FC<AddVaultModalProps> = ({
  isOpen,
  onClose,
  onAddVault,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Books');
  const [storageType, setStorageType] = useState<'local_storage' | 'local_picker' | 'n8n_cloud' | 'lcmd_personal' | 'lcmd_sandbox'>('local_storage');
  
  // Validation targets
  const [selectedDirHandle, setSelectedDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [endpointUrl, setEndpointUrl] = useState('http://localhost:5678/webhook/anymd-action');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectFolder = async () => {
    try {
      setErrorMsg(null);
      const handle = await window.showDirectoryPicker();
      setSelectedDirHandle(handle);
    } catch (err: any) {
      console.warn(err);
      setErrorMsg('Folder selection cancelled or failed.');
    }
  };

  const handleNext = () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a vault name.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleCreate = () => {
    setErrorMsg(null);

    // Storage type validations
    if (storageType === 'local_picker' && !selectedDirHandle) {
      setErrorMsg('Please select a local folder to link this vault.');
      return;
    }

    if (storageType === 'n8n_cloud') {
      const trimmedUrl = endpointUrl.trim();
      if (!trimmedUrl || (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://'))) {
        setErrorMsg('Please enter a valid n8n Webhook HTTP(S) endpoint URL.');
        return;
      }
    }

    const vaultId = 'anymd-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    onAddVault({
      id: vaultId,
      name,
      category,
      storageType,
      dirHandle: selectedDirHandle,
      endpointUrl: storageType === 'n8n_cloud' ? endpointUrl : '',
    });

    // Reset state
    setName('');
    setCategory('Books');
    setStorageType('local_storage');
    setSelectedDirHandle(null);
    setEndpointUrl('http://localhost:5678/webhook/anymd-action');
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono text-xs text-neutral-300">
      <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-sky-400">➕ Create New Vault Workspace</span>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </header>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 flex items-center space-x-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-bold text-sky-400">1. Vault Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrorMsg(null); }}
                  placeholder="e.g. My Coding Notes, Personal Wiki" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-sky-400">2. Primary Focus/Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 outline-none focus:border-sky-500"
                >
                  <option value="Books">📚 Books & Reading</option>
                  <option value="Journal">✍️ Running Journal & Logs</option>
                  <option value="Projects">💻 Coding & Blueprints</option>
                  <option value="TCG">🃏 TCG & Media Collection</option>
                </select>
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                Proceed to Storage Options &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="space-y-4">
                <label className="block font-bold text-sky-400 mb-2">3. Storage & Integration Type</label>
                
                <div className="grid grid-cols-1 gap-3">
                  {/* Local Storage Option */}
                  <div 
                    onClick={() => { setStorageType('local_storage'); setErrorMsg(null); }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      storageType === 'local_storage' 
                        ? 'bg-sky-950/20 border-sky-500/50' 
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <HardDrive size={18} className="text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block text-neutral-200">Local Sandbox (Web Storage)</span>
                      <span className="text-[10px] text-neutral-500">Fast, in-browser storage. Ideal for quick drafts and testing.</span>
                    </div>
                  </div>

                  {/* Local Directory Option */}
                  <div 
                    onClick={() => { setStorageType('local_picker'); setErrorMsg(null); }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      storageType === 'local_picker' 
                        ? 'bg-sky-950/20 border-sky-500/50' 
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <FolderOpen size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block text-neutral-200">Direct Local Folder (Native File System)</span>
                      <span className="text-[10px] text-neutral-500">Read & write directly to your local folders. Requires browser permission.</span>
                    </div>
                  </div>

                  {/* Cloud Webhook Option */}
                  <div 
                    onClick={() => { setStorageType('n8n_cloud'); setErrorMsg(null); }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      storageType === 'n8n_cloud' 
                        ? 'bg-sky-950/20 border-sky-500/50' 
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <Cloud size={18} className="text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block text-neutral-200">n8n Cloud Webhook Relay</span>
                      <span className="text-[10px] text-neutral-500">Sync notes through an active n8n automation webhook.</span>
                    </div>
                  </div>

                  {/* Old LC_MD Personal Option */}
                  <div 
                    onClick={() => { setStorageType('lcmd_personal'); setErrorMsg(null); }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      storageType === 'lcmd_personal' 
                        ? 'bg-sky-950/20 border-sky-500/50' 
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <HardDrive size={18} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block text-neutral-200">Import Old LC_MD Personal Vault</span>
                      <span className="text-[10px] text-neutral-500">Migrate resonance streams from `lc_md_books_personal_v3` local storage.</span>
                    </div>
                  </div>

                  {/* Old LC_MD Sandbox Option */}
                  <div 
                    onClick={() => { setStorageType('lcmd_sandbox'); setErrorMsg(null); }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      storageType === 'lcmd_sandbox' 
                        ? 'bg-sky-950/20 border-sky-500/50' 
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <Sparkles size={18} className="text-pink-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block text-neutral-200">Import Old LC_MD Sandbox Vault</span>
                      <span className="text-[10px] text-neutral-500">Migrate resonance streams from `lc_md_books_sandbox_v3` local storage.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Action Fields based on Storage selection */}
              {storageType === 'local_picker' && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                  <button 
                    onClick={handleSelectFolder}
                    type="button"
                    className="w-full py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    {selectedDirHandle ? `📁 Linked: ${selectedDirHandle.name}` : '📂 Choose Local Directory'}
                  </button>
                  <span className="text-[10px] text-neutral-500 block text-center">Must select a directory to proceed.</span>
                </div>
              )}

              {storageType === 'n8n_cloud' && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                  <span className="block text-neutral-300">n8n Webhook URL</span>
                  <input 
                    type="text"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 text-neutral-200 outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-neutral-500 block">HTTP(S) request listener endpoint must be defined.</span>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  &larr; Back
                </button>
                <button 
                  onClick={handleCreate}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Create Vault
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
