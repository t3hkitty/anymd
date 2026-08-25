import React, { useState, useRef } from 'react';
import type { Book } from '../types/resonance';
import type { InsuranceItemClaim } from '../plugins/homeInsuranceScannerPlugin';
import { scanRoomPhotoForInsuranceItems, convertInsuranceItemsToVaultBooks, generateInsuranceCsvReport } from '../plugins/homeInsuranceScannerPlugin';
import { X, ShieldCheck, Camera, Sparkles, Check, Download, Home, Layers } from 'lucide-react';

interface HomeInsuranceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoGenerateVaultItems: (newBooks: Book[]) => void;
}

export const HomeInsuranceScannerModal: React.FC<HomeInsuranceScannerModalProps> = ({
  isOpen,
  onClose,
  onAutoGenerateVaultItems,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [items, setItems] = useState<InsuranceItemClaim[] | null>(null);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const totalReplacementValuation = items ? items.reduce((acc, i) => acc + i.replacementCostUsd, 0) : 0;
  const csvReport = items ? generateInsuranceCsvReport(items) : '';

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      handleSimulateScan(file.name);
    }
  };

  const handleSimulateScan = (fileName?: string) => {
    setIsScanning(true);
    setItems(null);

    setTimeout(() => {
      const scanned = scanRoomPhotoForInsuranceItems(fileName || 'master_room_vault_photo.jpg');
      setItems(scanned);
      setIsScanning(false);
    }, 1200);
  };

  const handleExportCsv = () => {
    if (!csvReport) return;
    const blob = new Blob([csvReport], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Home_Insurance_Asset_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  const handleGenerateSidecars = () => {
    if (!items) return;
    const books = convertInsuranceItemsToVaultBooks(items);
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
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Home Insurance Bulk Asset Scanner & Claim Report Generator</h3>
              <p className="text-xs text-slate-400">Bulk Room & Cabinet Photo Segmenter &bull; Total Replacement Valuation &bull; Insurance CSV Exporter</p>
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
          
          {/* Zero Keys & Meowty Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/60 flex items-center justify-between gap-4 font-mono text-xs shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-emerald-300 text-sm">Meow Home Insurance Inventory Protection</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                Scan room photos to inventory all valuable items for insurance claim policies without sharing personal home photos with third-party servers.
              </p>
            </div>

            {items && (
              <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-emerald-500/40 text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Replacement Value:</span>
                <span className="text-sm font-extrabold text-emerald-300">${totalReplacementValuation.toLocaleString()} USD</span>
              </div>
            )}
          </div>

          {/* Photo Drop Area */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoFileChange}
            accept="image/*"
            className="hidden"
          />

          {!items && !isScanning && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-10 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all group"
            >
              {photoUrl ? (
                <div className="flex flex-col items-center space-y-2">
                  <img src={photoUrl} alt="Room photo" className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg" />
                  <p className="font-bold text-xs text-emerald-300">📷 {photoName}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-1 font-mono">
                    <p className="text-sm font-bold text-slate-200">
                      Click to Upload or Drag Photo of Room, Display Cabinet, Wardrobe or Vault Shelf
                    </p>
                    <p className="text-xs text-slate-400">
                      Segments room photos into individual high-value items, serial numbers &amp; replacement cost claims
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Scanning Spinner */}
          {isScanning && (
            <div className="p-12 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4 font-mono text-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                <Camera className="w-6 h-6 animate-spin" />
              </div>
              <p className="font-bold text-slate-200">Segmenting Room Photo & Inventorying Items...</p>
              <p className="text-[11px] text-slate-400">Detecting Items &bull; Serial Number Extraction &bull; Insurance Replacement Cost Estimation</p>
            </div>
          )}

          {/* Scanned Items Grid */}
          {items && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Inventoried Insurance Items ({items.length} Found)</span>
                </h4>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportCsv}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1 transition-all shadow-sm"
                  >
                    {copiedCsv ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{copiedCsv ? 'CSV Exported!' : 'Export Insurance CSV'}</span>
                  </button>

                  <button
                    onClick={() => handleSimulateScan()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Scan Another Room
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <h5 className="font-bold text-slate-100">{item.itemName}</h5>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold shrink-0 ml-2">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Location: <strong className="text-slate-200">{item.roomLocation}</strong></p>
                      {item.serialNumber && (
                        <p className="text-[11px] text-slate-400">Serial/Cert #: <code className="text-amber-300">{item.serialNumber}</code></p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">Replacement Cost: <strong className="text-emerald-300">${item.replacementCostUsd.toLocaleString()} USD</strong></span>
                      <span className="text-slate-500">Grade: {item.conditionGrade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Meow Home Insurance Asset Inventory Engine
          </span>
          {items ? (
            <button
              onClick={handleGenerateSidecars}
              className={`px-5 py-2 rounded-xl font-mono text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all ${
                generatedSuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {generatedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Insurance Sidecars Generated!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ Auto-Generate Insurance Sidecars</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
