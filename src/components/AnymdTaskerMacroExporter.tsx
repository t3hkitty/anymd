import React, { useState, useEffect, useRef } from 'react';

/**
 * Zettelkasten ID: 20260826-1831
 * Project: anymd (React Web Client)
 * Role: Kawaii Brutalist Tasker & MacroDroid Automation Exporter Widget [cite: 15, 122]
 * 
 * High-Density Kawaii Brutalist Standards:
 * - 0px border-radii, 2px solid black borders, desaturated cream background (#FFFDF5) [cite: 122].
 * - Escape key and click-outside listeners to close help modals [cite: 615].
 * - Instant clipboard copy and file downloads to maximize user convenience [cite: 14, 56].
 */

interface ExporterProps {
  onAddTerminalLog?: (msg: string) => void;
}

export const AnymdTaskerMacroExporter: React.FC<ExporterProps> = ({ onAddTerminalLog }) => {
  const [activeTab, setActiveTab] = useState<'tasker' | 'macrodroid'>('tasker');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  
  // State: Dynamic Custom Variables for Payload Customization [cite: 14]
  const [customTitle, setCustomTitle] = useState('⚡ Dynamic Somatic Log');
  const [customTags, setCustomTags] = useState('#somatic #quickcapture');
  const [targetFile, setTargetFile] = useState('inbox.md');

  const modalRef = useRef<HTMLDivElement>(null);

  // Esc and Click-Outside Listeners [cite: 615]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowHelpModal(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowHelpModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setCopiedStatus(msg);
    if (onAddTerminalLog) onAddTerminalLog(msg);
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  // Generate Google Tasker XML Configuration Payload [cite: 14, 17]
  const getTaskerXml = () => {
    return `<?xml version="1.0" encoding="utf-8"?>
<TaskerData sr="tasker_export" mver="5.16.0">
  <Task sr="task100">
    <cdate>1724694011000</cdate>
    <edate>1724694011000</edate>
    <id>100</id>
    <nme>AnyMD Send Telemetry</nme>
    <Action sr="act0" ve="7">
      <code>547</code>
      <Str sr="arg0" ve="3">%title</Str>
      <Str sr="arg1" ve="3">${customTitle}</Str>
    </Action>
    <Action sr="act1" ve="7">
      <code>547</code>
      <Str sr="arg0" ve="3">%tags</Str>
      <Str sr="arg1" ve="3">${customTags}</Str>
    </Action>
    <Action sr="act2" ve="7">
      <code>877</code>
      <Str sr="arg0" ve="3">org.anymd.broadcast.INBOUND_TELEMETRY</Str>
      <Int sr="arg1" ve="3">0</Int>
      <Str sr="arg2" ve="3">net.artkitty.anymd</Str>
      <Str sr="arg3" ve="3">net.artkitty.anymd.capture.SomaticTelemetryReceiver</Str>
      <Str sr="arg4" ve="3">title:%title, content:%par1, tags:%tags, file:${targetFile}</Str>
    </Action>
  </Task>
</TaskerData>`.trim();
  };

  // Generate MacroDroid Action JSON Configuration Payload [cite: 14, 17]
  const getMacroDroidJson = () => {
    const macroObj = {
      name: "AnyMD Broadcast Dispatcher",
      triggerList: [
        {
          type: "EmptyTrigger",
          description: "Triggered manually or via secondary launcher widget"
        }
      ],
      actionList: [
        {
          type: "SendIntentAction",
          action: "org.anymd.broadcast.INBOUND_TELEMETRY",
          packageName: "net.artkitty.anymd",
          className: "net.artkitty.anymd.capture.SomaticTelemetryReceiver",
          extras: {
            title: customTitle,
            content: "{lv=user_entered_text}",
            tags: customTags,
            file: targetFile
          }
        }
      ],
      constraintList: []
    };
    return JSON.stringify(macroObj, null, 2);
  };

  const handleCopyToClipboard = () => {
    const payload = activeTab === 'tasker' ? getTaskerXml() : getMacroDroidJson();
    navigator.clipboard.writeText(payload);
    triggerToast(`✔ Successfully copied ${activeTab.toUpperCase()} configuration!`);
  };

  const handleDownloadFile = () => {
    const payload = activeTab === 'tasker' ? getTaskerXml() : getMacroDroidJson();
    const extension = activeTab === 'tasker' ? 'xml' : 'json';
    const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anymd_${activeTab}_config.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`💾 Downloaded anymd_${activeTab}_config.${extension}!`);
  };

  return (
    <div className="p-4 border-2 border-slate-900 bg-[#FFFDF5] text-slate-900 font-mono text-xs max-w-xl w-full shadow-[4px_4px_0_0_#1e293b]">
      {/* Title block */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-slate-900 pb-2">
        <h2 className="text-sm font-black flex items-center gap-1">
          ⚙️ Tasker & MacroDroid Automation Center
        </h2>
        <div className="flex gap-1">
          <button 
            onClick={() => setShowHelpModal(true)} 
            className="px-2 py-0.5 bg-indigo-200 border border-slate-900 hover:bg-indigo-300 transition-all font-bold"
          >
            Help / FAQ
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b-2 border-slate-900 mb-4 bg-slate-100">
        <button
          onClick={() => setActiveTab('tasker')}
          className={`flex-1 py-1 text-center font-bold border-r border-slate-900 transition-all ${
            activeTab === 'tasker' ? 'bg-[#ffed4a] text-black' : 'bg-transparent text-slate-500 hover:bg-slate-200'
          }`}
        >
          Tasker XML
        </button>
        <button
          onClick={() => setActiveTab('macrodroid')}
          className={`flex-1 py-1 text-center font-bold transition-all ${
            activeTab === 'macrodroid' ? 'bg-[#ffed4a] text-black' : 'bg-transparent text-slate-500 hover:bg-slate-200'
          }`}
        >
          MacroDroid JSON
        </button>
      </div>

      {/* Inputs Configuration Box */}
      <div className="space-y-3 mb-4 p-3 bg-white border border-slate-900">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
            Zettel Log Title
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full p-1.5 border border-slate-900 bg-slate-50 focus:bg-white focus:outline-none text-xs"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Zettel Target File
            </label>
            <input
              type="text"
              value={targetFile}
              onChange={(e) => setTargetFile(e.target.value)}
              className="w-full p-1.5 border border-slate-900 bg-slate-50 focus:bg-white focus:outline-none text-xs"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Auto Tags (Space Separated)
            </label>
            <input
              type="text"
              value={customTags}
              onChange={(e) => setCustomTags(e.target.value)}
              className="w-full p-1.5 border border-slate-900 bg-slate-50 focus:bg-white focus:outline-none text-xs"
            />
          </div>
        </div>
      </div>

      {/* Code Previewer */}
      <div className="relative mb-4">
        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
          Compiled Configuration Payload Preview
        </label>
        <pre className="p-3 bg-slate-900 text-slate-200 border border-slate-900 h-32 overflow-y-auto text-[10px] rounded-none select-all font-mono leading-relaxed">
          {activeTab === 'tasker' ? getTaskerXml() : getMacroDroidJson()}
        </pre>
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyToClipboard}
          className="flex-1 py-1.5 bg-[#4F46E5] text-white font-bold border border-slate-900 hover:bg-[#4338CA] transition-all active:translate-y-0.5"
        >
          📋 Copy Configuration
        </button>
        <button
          onClick={handleDownloadFile}
          className="flex-1 py-1.5 bg-emerald-200 text-slate-900 font-bold border border-slate-900 hover:bg-emerald-300 transition-all active:translate-y-0.5"
        >
          💾 Download Config
        </button>
      </div>

      {/* Toast Overlay [cite: 615] */}
      {copiedStatus && (
        <div className="fixed bottom-4 right-4 p-2.5 bg-slate-900 text-emerald-300 border border-emerald-400 shadow-[3px_3px_0_0_#10B981] text-[10px] tracking-wide font-black z-50 animate-bounce">
          {copiedStatus}
        </div>
      )}

      {/* Help & Instruction Modal [cite: 615] */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-40">
          <div 
            ref={modalRef} 
            className="bg-[#FFFDF5] border-2 border-slate-900 p-5 max-w-md w-full shadow-[8px_8px_0_0_#111827] text-xs font-mono"
          >
            <h3 className="text-sm font-black border-b border-slate-900 pb-2 mb-3">
              ❓ Automation Setup Guidelines
            </h3>
            <div className="space-y-3 leading-relaxed text-slate-700">
              <p>
                <strong>1. Tasker Setup:</strong><br />
                Download and import the XML configuration. In Tasker, configure a gesture or trigger, bind it to our action, and pass the text input via <code>%par1</code> [cite: 14].
              </p>
              <p>
                <strong>2. MacroDroid Setup:</strong><br />
                Create a new Macro, import our action JSON template, and map your text triggers or floating overlays to send the intent [cite: 14].
              </p>
              <p>
                <strong>3. Intent Parameters:</strong><br />
                The Android app listens for intent <code>org.anymd.broadcast.INBOUND_TELEMETRY</code> carrying custom title, target file, and note tag parameters [cite: 17].
              </p>
            </div>
            <button 
              onClick={() => setShowHelpModal(false)}
              className="mt-4 w-full py-1 bg-rose-200 text-slate-900 font-bold border border-slate-900 hover:bg-rose-300 transition-all"
            >
              Dismiss (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
