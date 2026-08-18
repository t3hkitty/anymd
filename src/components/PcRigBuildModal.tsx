import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { PcRigBuildCollection } from '../plugins/pcRigBuildPlugin';
import { SAMPLE_PC_RIG_BUILDS, convertPcRigBuildsToVaultBooks, generatePcPartPickerList } from '../plugins/pcRigBuildPlugin';
import { X, Cpu, Sparkles, Check, Copy, Zap, Layers } from 'lucide-react';

interface PcRigBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoGenerateVaultItems: (newBooks: Book[]) => void;
}

export const PcRigBuildModal: React.FC<PcRigBuildModalProps> = ({
  isOpen,
  onClose,
  onAutoGenerateVaultItems,
}) => {
  const [rigs] = useState<PcRigBuildCollection[]>(SAMPLE_PC_RIG_BUILDS);
  const [selectedRigId, setSelectedRigId] = useState<string>(SAMPLE_PC_RIG_BUILDS[0].id);
  const [copiedList, setCopiedList] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  if (!isOpen) return null;

  const activeRig = rigs.find(r => r.id === selectedRigId) || rigs[0];
  const partsListText = generatePcPartPickerList(activeRig);

  const handleCopyPartsList = () => {
    navigator.clipboard.writeText(partsListText);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2000);
  };

  const handleGenerateSidecars = () => {
    const books = convertPcRigBuildsToVaultBooks([activeRig]);
    onAutoGenerateVaultItems(books);
    setGeneratedSuccess(true);

    setTimeout(() => {
      setGeneratedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">PC Rig Builds & Newegg List Vault Importer</h3>
              <p className="text-xs text-slate-400">Custom Workstation Setups &bull; PCPartPicker Compatibility &bull; Vault Sidecar Collections</p>
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* Rig Tabs Selector */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {rigs.map(rig => (
              <button
                key={rig.id}
                onClick={() => setSelectedRigId(rig.id)}
                className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all shrink-0 flex items-center space-x-2 border ${
                  rig.id === selectedRigId
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{rig.rigTitle}</span>
              </button>
            ))}
          </div>

          {/* Active Rig Summary Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-xl">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                {activeRig.buildPurpose}
              </span>
              <h4 className="font-extrabold text-white text-base leading-tight">{activeRig.rigTitle}</h4>
              <p className="text-slate-300 text-[11px] font-sans">
                {activeRig.components.length} Components &bull; Est. Wattage: <strong className="text-amber-300">{activeRig.estimatedWattage}W</strong>
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-indigo-500/40 text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Estimated Cost:</span>
              <span className="text-base font-extrabold text-indigo-300">${activeRig.totalCostUsd.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Components Parts Breakdown List */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Component Parts Breakdown ({activeRig.components.length})</span>
              </h4>

              <button
                onClick={handleCopyPartsList}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center space-x-1 border border-slate-700"
              >
                {copiedList ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedList ? 'Copied PCPartPicker List!' : 'Copy Newegg / Parts List'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeRig.components.map((comp, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-slate-800 text-[10px] font-bold">
                        {comp.category}
                      </span>
                      <span className="font-bold text-emerald-300 text-xs">${comp.priceUsd} USD</span>
                    </div>
                    <h5 className="font-bold text-slate-100 text-xs mt-1.5">{comp.partName}</h5>
                    <p className="text-[10px] text-slate-400">{comp.specsSnippet}</p>
                  </div>

                  {comp.wattage > 0 && (
                    <div className="flex items-center justify-end text-[10px] text-amber-400 font-bold pt-1 border-t border-slate-900">
                      <Zap className="w-3 h-3 mr-0.5" />
                      <span>{comp.wattage}W</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Newegg & PCPartPicker Sidecar Importer
          </span>
          <button
            onClick={handleGenerateSidecars}
            className={`px-5 py-2 rounded-xl font-mono text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all ${
              generatedSuccess
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {generatedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>PC Rig Sidecar Generated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>⚡ Auto-Generate PC Rig Vault Sidecar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
