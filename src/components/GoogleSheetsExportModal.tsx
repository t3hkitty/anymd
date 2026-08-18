import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { exportVaultToGoogleSheetsCsv } from '../plugins/googleSheetsExportPlugin';
import { X, FileSpreadsheet, Download, Copy, Check, ExternalLink, Sparkles, Table } from 'lucide-react';

interface GoogleSheetsExportModalProps {
  isOpen: boolean;
  books: Book[];
  onClose: () => void;
}

export const GoogleSheetsExportModal: React.FC<GoogleSheetsExportModalProps> = ({
  isOpen,
  books,
  onClose,
}) => {
  const [copiedTsv, setCopiedTsv] = useState(false);

  if (!isOpen) return null;

  const csvData = exportVaultToGoogleSheetsCsv(books);

  const handleDownloadCsv = () => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sovereign_Vault_GoogleSheets_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTsvForGoogleSheets = () => {
    const tsv = csvData.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '')).join('\t')).join('\n');
    navigator.clipboard.writeText(tsv);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Export Vault to Google Sheets</h3>
              <p className="text-xs text-slate-400">Export All Vault Items, TCG Grails & Sidecar Metadata to Google Sheets Spreadsheet</p>
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
          
          {/* Action Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-100">{books.length} Vault Items Ready for Google Sheets</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleCopyTsvForGoogleSheets}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center space-x-1.5 transition-all border border-slate-700"
              >
                {copiedTsv ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedTsv ? 'Copied for Sheets!' : 'Copy TSV (Paste to Sheets)'}</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download .CSV</span>
              </button>
            </div>
          </div>

          {/* Google Sheets Link Prompt */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-300 block">Open Blank Google Sheet:</span>
              <span className="text-slate-400 text-[11px]">Click below to launch Google Sheets in a new tab, then press Ctrl+V to paste!</span>
            </div>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 shrink-0 transition-all shadow-md"
            >
              <span>sheets.new</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Preview CSV Data Table */}
          <div className="space-y-2 font-mono">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Table className="w-4 h-4 text-emerald-400" />
              <span>Google Sheets Export Data Preview (.CSV)</span>
            </h4>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-64 overflow-x-auto overflow-y-auto">
              <pre className="text-[11px] text-emerald-400 leading-relaxed font-mono whitespace-pre">{csvData}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Formatted for Google Sheets, Microsoft Excel & Apple Numbers
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
