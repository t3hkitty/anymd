import React, { useState, useRef } from 'react';
import type { Book } from '../types/resonance';
import type { ScannedCardOrComicItem } from '../plugins/cardScannerPlugin';
import {
  scanMultipleIndividualPhotos,
  convertScannedCardsToVaultItems
} from '../plugins/cardScannerPlugin';
import {
  X,
  Camera,
  Scan,
  Sparkles,
  Check,
  ShieldCheck,
  BookMarked,
  Images,
  Layers
} from 'lucide-react';

interface CardScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoGenerateVaultItems: (newBooks: Book[]) => void;
}

export const CardScannerModal: React.FC<CardScannerModalProps> = ({
  isOpen,
  onClose,
  onAutoGenerateVaultItems,
}) => {
  const [scanMode, setScanMode] = useState<'individual_comics' | 'individual_cards' | 'binder_page'>('individual_comics');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResults, setScannedResults] = useState<ScannedCardOrComicItem[] | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ name: string; url: string }>>([]);
  const [publisherFilter, setPublisherFilter] = useState('');
  const [generatedSuccess, setGeneratedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setUploadedPhotos(fileList);
    processScanBatch(fileList, publisherFilter);
  };

  const processScanBatch = (fileList: Array<{ name: string; url: string }>, filter: string = publisherFilter) => {
    setIsScanning(true);
    setScannedResults(null);

    setTimeout(() => {
      const mode = scanMode === 'individual_comics' ? 'comic' : 'card';
      const results = scanMultipleIndividualPhotos(fileList, mode, filter);
      setScannedResults(results);
      setIsScanning(false);
    }, 1200);
  };

  const handleSimulateDemo = () => {
    const demoFiles = scanMode === 'individual_comics' ? [
      { name: 'spiderman_300_cgc98.jpg', url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400' },
      { name: 'killing_joke_1st_print.jpg', url: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=400' },
      { name: 'xmen_1_gatefold.jpg', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400' }
    ] : [
      { name: 'moonbreon_vmax_alt.jpg', url: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400' },
      { name: 'charizard_base_psa10.jpg', url: 'https://images.unsplash.com/photo-[REDACTED_PHONE]-adc38448a05e?w=400' }
    ];

    setUploadedPhotos(demoFiles);
    processScanBatch(demoFiles);
  };

  const handleGenerateAllEntries = () => {
    if (!scannedResults) return;
    const generatedBooks = convertScannedCardsToVaultItems(scannedResults);
    onAutoGenerateVaultItems(generatedBooks);
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
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Comic Book &amp; Card Photo Scanner Studio</h3>
              <p className="text-xs text-slate-400">
                Individual Photo-per-Item Stream &bull; Comic Key Issues &amp; Graded Slabs (CGC/CBCS/PSA) &bull; 100% Local OCR
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

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => { setScanMode('individual_comics'); setScannedResults(null); setUploadedPhotos([]); }}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              scanMode === 'individual_comics'
                ? 'border-rose-500 text-rose-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5 text-rose-400" />
            <span>🦸‍♂️ Individual Comic Books &amp; Slabs</span>
          </button>

          <button
            onClick={() => { setScanMode('individual_cards'); setScannedResults(null); setUploadedPhotos([]); }}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              scanMode === 'individual_cards'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Images className="w-3.5 h-3.5 text-amber-400" />
            <span>🃏 Individual Single Cards (1-by-1)</span>
          </button>

          <button
            onClick={() => { setScanMode('binder_page'); setScannedResults(null); setUploadedPhotos([]); }}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              scanMode === 'binder_page'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>📑 9-Pocket Binder Page Sheet</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          
          {/* Zero Keys Required Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-emerald-300">
                100% Free &amp; Meow: Individual Photo Batch OCR
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Select multiple photos from phone gallery at once</span>
          </div>
          
          {/* Multi-File Upload / Capture Drop Area */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          {!scannedResults && !isScanning && (
            <div className="space-y-4 font-mono text-xs">
              
              {/* Estate Sale Auto-Detect & Set Filter Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center space-x-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Publisher / Set Filter (Leave blank for Estate Sale Auto-Lookup):</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                    ✨ Auto-Detect Active
                  </span>
                </div>

                <input
                  type="text"
                  value={publisherFilter}
                  onChange={(e) => setPublisherFilter(e.target.value)}
                  placeholder="🔍 Auto-Detect Mode: I don't know the set / Estate Sale Lot (or type custom label)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 placeholder-slate-500 font-bold text-xs focus:outline-none focus:border-amber-400"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Quick Presets:</span>
                  {[
                    { label: '🔍 Auto-Detect (Estate Sale / Unknown)', val: '' },
                    { label: '🦸‍♂️ Marvel / DC Key Issues', val: 'Marvel & DC Comics' },
                    { label: '🃏 90s TCG Binder (Pokemon / MTG)', val: '90s Vintage TCG Collection' },
                    { label: '📚 Antique Leather & Hardcovers', val: 'Estate Antique Books' },
                    { label: '🏛️ Pop Culture & Figures', val: 'Pop & Figure Collectibles' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPublisherFilter(preset.val)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        publisherFilter === preset.val
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 font-sans leading-relaxed pt-1">
                  💡 <strong>Don't know what set or publisher it is?</strong> Leave this blank — our local vision OCR will automatically identify the characters, titles, issue numbers, CGC/PSA grade estimates, and fair market values without needing to know the set beforehand!
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-10 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-3xl bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all group"
              >
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1 font-mono">
                  <p className="text-sm font-bold text-slate-200">
                    {scanMode === 'individual_comics'
                      ? 'Click to Select Individual Comic Photos (Select 1 or Multiple)'
                      : scanMode === 'individual_cards'
                      ? 'Click to Select Individual Card Photos (Select 1 or Multiple)'
                      : 'Click to Upload 9-Pocket Binder Page Photo'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports selecting dozens of phone photos at once &bull; JPG, PNG, HEIC &bull; Automatic Zettelkasten serial linking
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSimulateDemo}
                  className="text-xs font-mono text-slate-400 hover:text-amber-300 underline transition-colors"
                >
                  ⚡ Or click here to test with sample {scanMode === 'individual_comics' ? 'comic books' : 'grail cards'} demo batch
                </button>
              </div>
            </div>
          )}

          {/* Scanning In-Progress Animation */}
          {isScanning && (
            <div className="p-12 border border-slate-800 rounded-3xl bg-slate-950 flex flex-col items-center justify-center space-y-4 font-mono text-xs">
              <Scan className="w-10 h-10 text-amber-400 animate-spin" />
              <div className="text-center space-y-1">
                <p className="font-bold text-amber-300">
                  Segmenting &amp; Analyzing {uploadedPhotos.length || 1} Individual Photo(s)...
                </p>
                <p className="text-slate-400">
                  Extracting Publisher / Issue #, CGC Grade Estimates &amp; Generating Zettelkasten Serials...
                </p>
              </div>
            </div>
          )}

          {/* Scanned Results Grid */}
          {scannedResults && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {scanMode === 'individual_comics' ? 'Comic Books' : 'Cards'} Detected ({scannedResults.length} Items)
                  </span>
                </span>
                
                <div className="flex items-center space-x-2 font-sans">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    + Add More Photos
                  </button>

                  <button
                    onClick={handleGenerateAllEntries}
                    className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all shadow-md text-xs ${
                      generatedSuccess
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950'
                    }`}
                  >
                    {generatedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Vault Sidecars Auto-Generated!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>⚡ Auto-Generate All {scannedResults.length} Vault Sidecars</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scannedResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-100 leading-tight">
                            {item.itemType === 'comic' ? '🦸‍♂️ ' : '🃏 '}
                            {item.detectedTitle}
                          </h4>
                          <p className="text-xs text-amber-400 font-bold mt-0.5">
                            {item.detectedSetOrPublisher} {item.issueOrSetNumber ? `(${item.issueOrSetNumber})` : ''}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs font-mono shrink-0">
                          ${item.estimatedValuationUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {item.keyFeatures && (
                        <p className="text-[11px] text-slate-300 font-sans bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                          ✨ {item.keyFeatures}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                      <span>Grade: <strong className="text-emerald-400">{item.conditionGrade}</strong></span>
                      <span className="truncate max-w-[140px] text-slate-500">📷 {item.photoFileName || 'Single Photo'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between font-sans">
          <span className="text-xs text-slate-400 font-mono">
            Meow Individual Photo Recognition &bull; Comic Books &amp; Cards
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
