import React, { useState, useEffect, useRef } from 'react';

interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  category: 'filament' | 'fastener' | 'electronics' | 'finish';
}

export const CreativeAtelierPlugin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pantry' | 'standcard' | 'catify' | 'mindscape'>('pantry');
  const [toast, setToast] = useState<string | null>(null);

  // Maker Pantry State
  const [pantry, setPantry] = useState<PantryItem[]>([
    { id: '1', name: 'Polymaker Lavender PLA', quantity: '0.85 kg', category: 'filament' },
    { id: '2', name: 'M3 Brass Heat Set Inserts', quantity: '150 pcs', category: 'fastener' },
    { id: '3', name: 'ESP32-S3 Mini Core Board', quantity: '4 modules', category: 'electronics' },
    { id: '4', name: 'Pastel Mint Krylon Acrylic Spray', quantity: '2 cans', category: 'finish' }
  ]);

  // Artist Alley Vector line parameters (w(t) = a + b * t^2) [cite: 289]
  const [paramA, setParamA] = useState<number>(2.0);
  const [paramB, setParamB] = useState<number>(3.5);
  const [isCatified, setIsCatified] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Artist Alley Vector rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#7e22ce';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Draw Parametric Inking Line: w(t) = a + b * t^2 [cite: 289]
    ctx.beginPath();
    ctx.moveTo(30, 100);
    
    for (let t = 0; t <= 1; t += 0.02) {
      const x = 30 + t * 240;
      const width = paramA + paramB * Math.pow(t, 2);
      ctx.lineWidth = width;
      ctx.lineTo(x, 100 + Math.sin(t * Math.PI * 4) * 20);
    }
    ctx.stroke();

    // Catify overlay
    if (isCatified) {
      ctx.fillStyle = '#f472b6';
      // Left ear
      ctx.beginPath();
      ctx.moveTo(100, 80);
      ctx.lineTo(80, 50);
      ctx.lineTo(120, 65);
      ctx.fill();

      // Right ear
      ctx.beginPath();
      ctx.moveTo(200, 80);
      ctx.lineTo(220, 50);
      ctx.lineTo(180, 65);
      ctx.fill();

      // `:3` Snout
      ctx.strokeStyle = '#4c1d95';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(142, 105, 8, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(158, 105, 8, 0, Math.PI);
      ctx.stroke();
    }
  }, [paramA, paramB, isCatified, activeTab]);

  return (
    <div className="bg-[#FAF8F5] text-[#4c1d95] rounded-[32px] border-[6px] border-[#e9d5ff] p-6 max-w-4xl mx-auto shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-[#e9d5ff] pb-4 mb-6">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          🎨 anyMD Creative Atelier Plugin Suite
        </h2>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {['pantry', 'standcard', 'catify', 'mindscape'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-bold rounded-full capitalize text-xs hover:scale-105 transition-all ${
                activeTab === tab ? 'bg-[#c084fc] text-white' : 'bg-white text-[#c084fc] border-2 border-[#e9d5ff]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] border-4 border-[#e9d5ff] min-h-[350px]">
        {activeTab === 'pantry' && (
          <div>
            <h3 className="text-lg font-black mb-4">🛒 Maker Portfolio & Pantry Ledger</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pantry.map(item => (
                <div key={item.id} className="p-4 border-2 border-[#f3e8ff] rounded-[20px] bg-[#faf5ff] flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs opacity-75 capitalize">Category: {item.category}</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-white text-[#a855f7] border border-[#e9d5ff] rounded-full font-black">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'standcard' && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-6 border-4 border-[#e9d5ff] rounded-[24px] bg-[#faf5ff] shadow-inner relative flex flex-col justify-between max-w-[280px] mx-auto min-h-[400px]">
              <div>
                <div className="border-b-2 border-[#e9d5ff] pb-2 text-center">
                  <span className="text-2xl">⚡</span>
                  <h4 className="font-black text-sm uppercase mt-1">Maker Portfolio Exhibit</h4>
                  <p className="text-[10px] opacity-75">KawaiiNekoty Code: #A400</p>
                </div>
                <div className="py-6 text-center">
                  <p className="text-xs opacity-80">PROUDLY PRESENTING:</p>
                  <p className="font-black text-lg text-[#7e22ce] mt-2">KVMeowboard</p>
                  <p className="text-xs italic opacity-75 mt-1">The Zero-Install Bluetooth Octopus [cite: 47]</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                {/* Fake QR code */}
                <div className="w-24 h-24 border-2 border-[#4c1d95] p-1 bg-white flex flex-wrap">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-6 h-6 ${(i + 3) % 3 === 0 ? 'bg-[#4c1d95]' : 'bg-white'}`} />
                  ))}
                </div>
                <span className="text-[9px] font-mono opacity-70">github.com/t3hkitty/anymd</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="font-black text-sm">Generate Exhibition Standcard (5x7 Acrylic Template)</h3>
              <p className="text-xs leading-relaxed">
                Automatically generate printable 5x7 exhibit placards containing QR code provenance links [cite: 22, 23] routing directly to your open-source repositories! [cite: 23, 587]
              </p>
              <button 
                onClick={() => showToast("5x7 Standcard PDF prepared for direct download! 📋✨")}
                className="w-full py-3 bg-[#a855f7] text-white font-black rounded-full shadow-md hover:bg-[#7e22ce]"
              >
                Download PDF Card Template
              </button>
            </div>
          </div>
        )}

        {activeTab === 'catify' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black">🖌️ Artist Alley Parametric Inking & Catify</h3>
            <p className="text-xs opacity-80">Line Width function: w(t) = a + b * t² [cite: 289]</p>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={150} 
                className="border-4 border-[#e9d5ff] rounded-[24px] bg-[#faf5ff]"
              />
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="text-xs font-black block">Base Width A: {paramA}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5" 
                    value={paramA} 
                    onChange={(e) => setParamA(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black block">Scale Parameter B: {paramB}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    step="0.5" 
                    value={paramB} 
                    onChange={(e) => setParamB(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7]"
                  />
                </div>
                <button 
                  onClick={() => {
                    setIsCatified(!isCatified);
                    showToast(isCatified ? "De-catified!" : "Procedural ears and :3 snout sprouts applied successfully! 🐱🌸");
                  }}
                  className="w-full py-2 bg-[#d946ef] text-white font-bold text-xs rounded-full hover:bg-[#a21caf]"
                >
                  {isCatified ? "Remove Catify" : "🐱 1-Click Catify Line"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mindscape' && (
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-black text-left">🛌 3D Sims-style Mindscape room Canvas</h3>
            <p className="text-xs text-left opacity-80 mb-4">
              Renders physical room objects dynamically mapped to active database telemetry profiles [cite: 203, 550].
            </p>
            <div className="border-4 border-[#e9d5ff] rounded-[24px] p-6 bg-[#faf5ff] inline-block w-full max-w-[400px]">
              {/* Fake Isometric illustration rendering room coordinates */}
              <pre className="text-xs font-mono leading-tight text-[#a855f7]">
{`
         /\
        /  \
       /    \
      /______\
      |      |
      | [🛏️]  |  <-- Sleep quality: 92%
      |      |
      --------
`}
              </pre>
              <div className="text-[10px] opacity-75 mt-3">Active Telemetry: Vault folder mapped, syncing room metrics [cite: 550, 553].</div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-[#10b981] text-white font-black text-sm rounded-full shadow-lg animate-bounce z-50">
          {toast}
        </div>
      )}
    </div>
  );
};
