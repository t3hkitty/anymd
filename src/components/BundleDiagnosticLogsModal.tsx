import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Activity, Trash2, Copy, Pause, Play, Download, Search, 
  Filter, Check, AlertTriangle, AlertCircle, Info, Bug 
} from 'lucide-react';
import { 
  defaultHostInstance, 
  DiagnosticLogEntry, 
  DiagnosticLogLevel 
} from '../../contracts/libr-contract';

export interface BundleDiagnosticLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BundleDiagnosticLogsModal: React.FC<BundleDiagnosticLogsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [logs, setLogs] = useState<DiagnosticLogEntry[]>(() => defaultHostInstance.getLogs());
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [levelFilter, setLevelFilter] = useState<DiagnosticLogLevel | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Subscribe to live ring-buffer emissions
  useEffect(() => {
    if (!isOpen) return;
    setLogs(defaultHostInstance.getLogs());

    const unsubscribe = defaultHostInstance.subscribeLogs((entry) => {
      if (!isPaused) {
        setLogs(prev => {
          const next = [...prev, entry];
          if (next.length > 500) next.shift();
          return next;
        });
      }
    });

    return () => unsubscribe();
  }, [isOpen, isPaused]);

  // Derived filter options
  const sources = useMemo(() => {
    const s = new Set<string>();
    logs.forEach(l => l.source && s.add(l.source));
    return Array.from(s).sort();
  }, [logs]);

  const stages = useMemo(() => {
    const st = new Set<string>();
    logs.forEach(l => l.stage && st.add(l.stage));
    return Array.from(st).sort();
  }, [logs]);

  // Filtered view
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;
      if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
      if (stageFilter !== 'all' && log.stage !== stageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const msg = (log.message || '').toLowerCase();
        const src = (log.source || '').toLowerCase();
        const stg = (log.stage || '').toLowerCase();
        const metaStr = JSON.stringify(log.meta || {}).toLowerCase();
        return msg.includes(q) || src.includes(q) || stg.includes(q) || metaStr.includes(q);
      }
      return true;
    });
  }, [logs, levelFilter, sourceFilter, stageFilter, searchQuery]);

  if (!isOpen) return null;

  const handleCopyLogs = async () => {
    const text = JSON.stringify(filteredLogs, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anymd-diagnostic-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    defaultHostInstance.clearLogs();
    setLogs([]);
  };

  const getLevelBadge = (level?: DiagnosticLogLevel) => {
    switch (level) {
      case 'error':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> ERROR</span>;
      case 'warn':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> WARN</span>;
      case 'debug':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1"><Bug className="w-2.5 h-2.5" /> DEBUG</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1"><Info className="w-2.5 h-2.5" /> INFO</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl w-full max-w-4xl h-[88vh] shadow-2xl p-5 flex flex-col gap-3.5 text-slate-100 animate-fadeIn"
        style={{ borderRadius: '32px', boxShadow: '4px 4px 0px #000' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide flex items-center gap-2">
                Bundle Diagnostic Logs &amp; Telemetry 🐾
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time ring buffer ({filteredLogs.length}/{logs.length} entries) • Traces fallback stubs, WebDAV &amp; rclone
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                isPaused 
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLogs}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold font-mono rounded-xl text-sky-300 flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all"
              title="Export Filtered Logs as JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl text-rose-300 transition-all"
              title="Clear Ring Buffer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-950/60 p-2.5 border border-slate-800 rounded-2xl text-xs font-mono">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-2 py-1 w-full outline-none"
            >
              <option value="all">Level: All</option>
              <option value="error">Error only</option>
              <option value="warn">Warn &amp; Error</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-2 py-1 w-full outline-none"
            >
              <option value="all">Source: All ({sources.length})</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-2 py-1 w-full outline-none"
            >
              <option value="all">Stage: All ({stages.length})</option>
              {stages.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          {/* Search Query */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs &amp; meta..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-8 pr-2.5 py-1 outline-none text-[11px]"
            />
          </div>
        </div>

        {/* Logs Feed Canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-950 rounded-2xl border border-slate-800 p-2.5 space-y-1.5 font-mono text-[11px]">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-1.5 py-12">
              <Activity className="w-8 h-8 opacity-40 animate-pulse" />
              <span>No log entries match the current filter.</span>
            </div>
          ) : (
            filteredLogs.map((entry, idx) => (
              <div 
                key={entry.id || idx}
                className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    {getLevelBadge(entry.level)}
                    <span className="text-indigo-300 font-bold">[{entry.source}]</span>
                    {entry.stage && (
                      <span className="text-slate-500 uppercase">stage:{entry.stage}</span>
                    )}
                  </div>
                  <span className="text-slate-500">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>

                <div className="text-slate-200 break-words pl-0.5">
                  {entry.message}
                </div>

                {entry.meta && Object.keys(entry.meta).length > 0 && (
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(entry.meta, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
          <span>🐾 host.log() Bounded Ring Buffer ~500 events • Kawaiianism Diagnostics</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
