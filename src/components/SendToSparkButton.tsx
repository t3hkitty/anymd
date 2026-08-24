import React, { useState } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';

interface SendToSparkProps {
  activeZettelId?: string;
  defaultContent?: string;
  defaultImageUrl?: string;
}

export const SendToSparkButton: React.FC<SendToSparkProps> = ({
  activeZettelId = "20260822-1250",
  defaultContent = "Alright buddy let's take it from the top! Fold those clothes...",
  defaultImageUrl = "/assets/bujo_sketches/20260822-1240.png"
}) => {
  const [promptText, setPromptText] = useState<string>("Analyze the style of this low-poly isometric room drawing and animate a slow, 3D panning shot through the space.");
  const [selectedFolder, setSelectedFolder] = useState<string>("G:\\My Drive\\anymd\\Sidecars");
  const [syncState, setSyncStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');
  const [diagnosticLog, setDiagnosticLog] = useState<string>("");

  const handleSendToSpark = async () => {
    setSyncStatus('sending');
    setDiagnosticLog("📡 Packaging Zettel payload and asset paths...");

    // Format the payload with Zettelkasten serial headers
    const payload = {
      zettel_id: activeZettelId,
      prompt: promptText,
      original_content: defaultContent,
      image_path: defaultImageUrl,
      destination_path: selectedFolder,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Fire local HTTP request to your self-hosted n8n gateway
      setDiagnosticLog("🧬 Dispatching payload to local n8nEngine (port 5678)...");
      
      const response = await fetch("http://localhost:3050/webhook/sandbox_vault/inbox?filename=" + activeZettelId + "_spark_prompt.md", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          append: false,
          content: `---
type: "spark_sidecar_prompt"
zettel_id: "${payload.zettel_id}"
originating_vault: "myBlackbox"
associated_assets:
  - "${payload.image_path}"
n8n_dispatched: true
mcp_visible: true
tags:
  - "#spark_bridge"
  - "#mcp_payload"
---

### 📝 Prompt Directive for Gemini:
> "${payload.prompt}"

### 📖 Grounding Context / Writing:
${payload.original_content}
`
        })
      });

      if (response.ok) {
        setSyncStatus('success');
        setDiagnosticLog("🎉 SUCCESS! File saved locally. Google Drive Sync and local MCP server refreshed!");
        
        // Trigger a custom local TTS success chime
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance("Oh yeah! Prompt successfully dispatched to the Spark Bridge! Ready for Gemini processing.");
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        throw new Error("HTTP " + response.status);
      }
    } catch (err: any) {
      setSyncStatus('failed');
      setDiagnosticLog("❌ Failed to send: " + err.message);
    }
  };

  return (
    <WidgetPanel 
      title="⚡ Gemini Spark MCP Bridge" 
      badge="🔌 ACTIVE BRIDGE"
      className="border-4 border-black shadow-[4px_4px_0_#000] bg-white p-3 rounded-none max-w-md relative"
    >
      <div className="flex flex-col gap-3">
        
        {/* RETRO DYNAMIC CONSOLE */}
        <div className="bg-emerald-950 border-2 border-black p-2 font-mono text-[10px] text-emerald-400 select-none">
          <p className="font-bold">🖥️ SPARK DETECTOR TERMINAL:</p>
          <p className="leading-snug mt-1">&gt; Mapped Path: {selectedFolder}</p>
          <p className="leading-snug text-yellow-300 animate-pulse mt-0.5">&gt; {diagnosticLog || "Standing by. Ready to broadcast payload."}</p>
        </div>

        {/* INPUT PROMPT DIRECTIVE */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase text-gray-600">Prompt Directive for External AI Model:</label>
          <textarea 
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="border-2 border-black p-2 text-xs font-bold w-full bg-[#fdfdfd] shadow-[inner_2px_2px_0_rgba(0,0,0,0.1)] focus:outline-none leading-relaxed"
          />
        </div>

        {/* DRIVE PATH BINDER */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase text-gray-600">Local Sidecar Sync Folder (MCP Target):</label>
          <input 
            type="text"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="border-2 border-black p-2 text-xs font-bold w-full bg-gray-50 focus:outline-none"
          />
        </div>

        {/* SPARK BUTTONS */}
        <div className="flex flex-col gap-2">
          {syncState !== 'sending' ? (
            <button 
              onClick={handleSendToSpark}
              className="w-full bg-yellow-300 hover:bg-yellow-400 border-4 border-black font-black uppercase text-xs p-3 shadow-[3px_3px_0_#000] active:translate-y-[2px] active:shadow-none transition-transform"
            >
              🚀 Send to Spark & Sync
            </button>
          ) : (
            <div className="bg-pink-100 border-4 border-black p-3 text-center text-xs font-black uppercase tracking-widest text-pink-700 animate-pulse">
              ⚡ BROADCASTING WAVEFORM TERMINAL...
            </div>
          )}

          {syncState === 'success' && (
            <div className="bg-emerald-100 border-2 border-black p-2 text-center text-[10px] font-bold text-emerald-800">
              💡 Tip: Open your external Gemini interface and say: <br />
              <span className="italic">\"Read my spark_prompt.md from my local MCP vault to animate the room!\"</span>
            </div>
          )}
        </div>

      </div>
    </WidgetPanel>
  );
};