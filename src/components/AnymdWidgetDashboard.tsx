import React, { useState, useEffect } from 'react';

// Custom interfaces for our button builder and widget configuration
interface DynamicButton {
  id: string;
  label: string;
  icon: string;
  color: string; // Tailwind bg class for color-coded pills
  preconfig: 'sip' | 'pee' | 'poop' | 'meds' | 'custom';
  tags: string[];
  template: string; // Log line format, e.g. "Hydration: {text} sips"
}

interface WidgetLayout {
  slots: { [key: number]: string }; // Map slotIndex (0-7) to Button ID
}

export const AnymdWidgetDashboard: React.FC = () => {
  // 1. STICKY SETTINGS: Persistent buttons and layout configuration
  const [buttons, setButtons] = useState<DynamicButton[]>(() => {
    const saved = localStorage.getItem('anymd_widget_buttons');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'btn-sip',
        label: 'Sip Water',
        icon: '💧',
        color: 'bg-cyan-200 text-cyan-900 border-cyan-400',
        preconfig: 'sip',
        tags: ['#sip', '#hydration', '#telemetry'],
        template: 'Hydration Log: +1 Sip'
      },
      {
        id: 'btn-pee',
        label: 'Log Pee',
        icon: '🚽',
        color: 'bg-yellow-200 text-yellow-900 border-yellow-400',
        preconfig: 'pee',
        tags: ['#pee', '#bio_break', '#telemetry'],
        template: 'Bio Break: Urination'
      },
      {
        id: 'btn-poop',
        label: 'Log Poop',
        icon: '💩',
        color: 'bg-amber-200 text-amber-900 border-amber-400',
        preconfig: 'poop',
        tags: ['#poop', '#bio_break', '#telemetry'],
        template: 'Bio Break: Bowel Movement'
      },
      {
        id: 'btn-meds',
        label: 'Meds Taken',
        icon: '💊',
        color: 'bg-pink-200 text-pink-900 border-pink-400',
        preconfig: 'meds',
        tags: ['#meds', '#health', '#telemetry'],
        template: 'Meds Log: Morning Dose Confirmed'
      },
      {
        id: 'btn-code',
        label: 'Start Code',
        icon: '💻',
        color: 'bg-purple-200 text-purple-900 border-purple-400',
        preconfig: 'custom',
        tags: ['#create', '#coding', '#deep_work'],
        template: 'Focus Started: Coding'
      },
      {
        id: 'btn-rest',
        label: 'Somatic Calm',
        icon: '🧘',
        color: 'bg-emerald-200 text-emerald-900 border-emerald-400',
        preconfig: 'custom',
        tags: ['#calm', '#reset', '#mindfulness'],
        template: 'Somatic Recovery: Box Breathing Completed'
      }
    ];
  });

  const [layout, setLayout] = useState<WidgetLayout>(() => {
    const saved = localStorage.getItem('anymd_widget_layout');
    if (saved) return JSON.parse(saved);
    return {
      slots: {
        0: 'btn-sip',
        1: 'btn-pee',
        2: 'btn-poop',
        3: 'btn-meds',
        4: 'btn-code',
        5: 'btn-rest',
        6: '',
        7: ''
      }
    };
  });

  // State for the Active Configurator / Editor
  const [selectedButtonId, setSelectedButtonId] = useState<string>('btn-sip');
  const [typedInputText, setTypedInputText] = useState<string>('');
  const [draggedSlot, setDragSlot] = useState<number | null>(null);
  const [notification, setNotification] = useState<string>('');

  // Auto-save changes to localStorage
  useEffect(() => {
    localStorage.setItem('anymd_widget_buttons', JSON.stringify(buttons));
  }, [buttons]);

  useEffect(() => {
    localStorage.setItem('anymd_widget_layout', JSON.stringify(layout));
  }, [layout]);

  // Toast Notification System
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const getSelectedButton = (): DynamicButton => {
    return buttons.find(b => b.id === selectedButtonId) || buttons[0];
  };

  // 2. PRECONFIG HANDLERS: Easily update templated values
  const handlePreconfigSelect = (type: 'sip' | 'pee' | 'poop' | 'meds' | 'custom') => {
    const presets: { [key: string]: Partial<DynamicButton> } = {
      sip: {
        icon: '💧',
        color: 'bg-cyan-200 text-cyan-900 border-cyan-400',
        tags: ['#sip', '#hydration', '#telemetry'],
        template: 'Hydration Log: +1 Sip'
      },
      pee: {
        icon: '🚽',
        color: 'bg-yellow-200 text-yellow-900 border-yellow-400',
        tags: ['#pee', '#bio_break', '#telemetry'],
        template: 'Bio Break: Urination'
      },
      poop: {
        icon: '💩',
        color: 'bg-amber-200 text-amber-900 border-amber-400',
        tags: ['#poop', '#bio_break', '#telemetry'],
        template: 'Bio Break: Bowel Movement'
      },
      meds: {
        icon: '💊',
        color: 'bg-pink-200 text-pink-900 border-pink-400',
        tags: ['#meds', '#health', '#telemetry'],
        template: 'Meds Log: Morning Dose Confirmed'
      }
    };

    if (type !== 'custom') {
      const preset = presets[type];
      setButtons(prev => prev.map(b => b.id === selectedButtonId ? { ...b, preconfig: type, ...preset } : b));
    } else {
      setButtons(prev => prev.map(b => b.id === selectedButtonId ? { ...b, preconfig: 'custom' } : b));
    }
  };

  const updateSelectedButtonField = (field: keyof DynamicButton, value: any) => {
    setButtons(prev => prev.map(b => b.id === selectedButtonId ? { ...b, [field]: value } : b));
  };

  // 3. DRAG-AND-DROP SWAPPING: Reorder widget buttons with Wipe Guard warnings
  const handleDragStart = (e: React.DragEvent, slotIndex: number) => {
    setDragSlot(slotIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    if (draggedSlot === null || draggedSlot === targetSlot) return;

    const sourceButtonId = layout.slots[draggedSlot] || '';
    const targetButtonId = layout.slots[targetSlot] || '';

    // Safety Wipe Guard alert for bottom-left slots (Slots 4, 6 represent bottom left corner)
    if ((targetSlot === 4 || targetSlot === 6) && sourceButtonId) {
      showToast('⚠️ Wipe Guard: High-frequency targets placed in the bottom-left swipe zone may trigger accidental activations while wiping!');
    }

    setLayout(prev => {
      const updatedSlots = { ...prev.slots };
      updatedSlots[targetSlot] = sourceButtonId;
      updatedSlots[draggedSlot] = targetButtonId;
      return { slots: updatedSlots };
    });

    setDragSlot(null);
  };

  // Mock Event Logging Pipeline: Logs out of AnyMD just like the mirrored Widget would
  const triggerLogEvent = (button: DynamicButton) => {
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const userTextNote = typedInputText ? ` - Note: "${typedInputText}"` : '';
    const logLine = `[${timestamp}] ${button.icon} ${button.template}${userTextNote} ${button.tags.join(' ')}`;
    
    // Simulate writing to local Markdown Database
    showToast(`📝 Synced to AnyMD: "${button.label}" logged!`);
    console.log('Writing flat Zettel entry to disk:', logLine);
    setTypedInputText(''); // Clear typing box after logging
  };

  const activeBtn = getSelectedButton();

  return (
    <div className="bg-[#fcf8f2] border-4 border-black p-6 font-mono max-w-6xl mx-auto my-4 shadow-[8px_8px_0_rgba(0,0,0,1)] rounded-none relative">
      {/* TOAST SYSTEM */}
      {notification && (
        <div className="fixed top-4 right-4 bg-yellow-300 border-4 border-black px-4 py-2 text-xs font-black shadow-[4px_4px_0_#000] z-50 animate-bounce">
          {notification}
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
            🐾 AnyMD: Dynamic Widget Dashboard & Button Builder
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1 uppercase tracking-wide">
            WYSIWYG layout mirror & custom log line templates
          </p>
        </div>
        <div className="bg-black text-yellow-300 font-black px-3 py-1 text-xs uppercase shadow-[2px_2px_0_#000]">
          V3.2.0 CO-CREATION ACTIVE
        </div>
      </div>

      {/* DETAILED ACCESSIBILITY / WIPE GUARD WARNING */}
      <div className="bg-orange-100 border-4 border-black p-3 mb-6 relative">
        <h4 className="text-xs font-black text-orange-800 uppercase tracking-wider flex items-center gap-2">
          🧠 Somatic Safeguard: The Accidental Swipe & Wipe Guard
        </h4>
        <p className="text-xs font-bold leading-relaxed text-orange-950 mt-1">
          When recovering from neurological trauma (like strokes), fine-motor coordination is a daily calibration exercise. Wiping the screen or holding the phone can trigger accidental taps on screen edges. Use this visual dashboard to drag and drop high-frequency triggers (like 🚽 or 💊) to central slots, keeping the <strong>bottom-left boundary clear</strong> to prevent accidental logs.
        </p>
      </div>

      {/* DUAL PANE WORKSPACE MODE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (GRID SLOT & LAYOUT MIRROR) */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-4 shadow-[4px_4px_0_#000]">
          <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4 text-purple-800 flex justify-between items-center">
            📱 Widget Screen Mirror
            <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 border border-black">DRAG TO REORDER</span>
          </h3>

          {/* DRAGGABLE MOBILE BUTTON GRID */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 8 }).map((_, idx) => {
              const btnId = layout.slots[idx];
              const button = buttons.find(b => b.id === btnId);
              const isBottomLeftZone = idx === 4 || idx === 6;

              return (
                <div
                  key={idx}
                  draggable={!!button}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`h-24 border-4 border-black p-2 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none relative transition-all group ${
                    button ? button.color : 'bg-gray-100 border-dashed border-gray-400'
                  } ${isBottomLeftZone ? 'ring-2 ring-orange-400' : ''}`}
                >
                  {/* Wipe zone indicators */}
                  {isBottomLeftZone && !button && (
                    <span className="absolute top-1 left-1 text-[8px] font-black text-orange-600 bg-orange-100 px-1 border border-orange-300">
                      WIPE EDGE ZONE (SAFE)
                    </span>
                  )}

                  {button ? (
                    <>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{button.icon}</span>
                        <button
                          onClick={() => setSelectedButtonId(button.id)}
                          className="bg-white hover:bg-gray-200 border border-black text-[9px] font-bold px-1 py-0.5 active:translate-y-[1px]"
                        >
                          EDIT ✏️
                        </button>
                      </div>
                      <div className="text-[10px] font-black tracking-tight leading-none uppercase truncate">
                        {button.label}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[10px] font-bold text-gray-400 uppercase">
                      Empty Slot
                    </div>
                  )}
                  {/* Slot identifier badge */}
                  <span className="absolute bottom-1 right-1 text-[8px] bg-black text-white px-1">
                    Slot {idx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* INTERACTIVE COMPOSER BAR */}
          <div className="border-t-2 border-black pt-4 mt-4">
            <span className="text-xs font-black uppercase text-gray-600 block mb-1">
              📝 Companion Keyboard Input Buffer
            </span>
            <input
              type="text"
              value={typedInputText}
              onChange={(e) => setTypedInputText(e.target.value)}
              placeholder="Type any custom text first, then tap any mirrored widget button..."
              className="w-full border-4 border-black p-2 text-xs font-bold focus:outline-none focus:bg-yellow-50 bg-white placeholder-gray-400"
            />
            {typedInputText && (
              <div className="text-[10px] font-bold text-blue-600 mt-1 uppercase animate-pulse">
                ⚡ Active buffer: "{typedInputText}" will append to your next widget tap!
              </div>
            )}
          </div>

          {/* ACTIVE TEST BOARD TRiggers */}
          <div className="bg-gray-100 border-2 border-black p-3 mt-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-gray-800">
              ⚡ Live Interaction Console
            </h5>
            <p className="text-[10px] font-bold text-gray-500 leading-relaxed mt-1">
              Tap on any configured button below to trigger and log a simulated flat Zettelkasten Markdown entry directly into memory:
            </p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {buttons.map(btn => (
                <button
                  key={btn.id}
                  onClick={() => triggerLogEvent(btn)}
                  className="bg-white border-2 border-black p-1 text-[10px] font-black hover:bg-yellow-100 active:translate-y-[1px] shadow-[2px_2px_0_#000] flex items-center justify-center gap-1"
                >
                  <span>{btn.icon}</span>
                  <span className="truncate">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (BUTTON BUILDER & CONFIGURATOR PANEL) */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-4 shadow-[4px_4px_0_#000]">
          <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4 text-purple-800">
            🛠️ Button Builder Configurator
          </h3>

          {/* RE-CONFIG SELECTOR TABS */}
          <div className="flex flex-wrap gap-2 mb-4">
            {buttons.map(btn => (
              <button
                key={btn.id}
                onClick={() => setSelectedButtonId(btn.id)}
                className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${
                  selectedButtonId === btn.id
                    ? 'bg-purple-200 text-black shadow-[2px_2px_0_#000] translate-y-[-1px]'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>

          <div className="bg-purple-50 border-4 border-black p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BUTTON LABEL & EMOJI */}
              <div>
                <label className="text-xs font-black uppercase text-purple-900 block mb-1">
                  Label Title
                </label>
                <input
                  type="text"
                  value={activeBtn.label}
                  onChange={(e) => updateSelectedButtonField('label', e.target.value)}
                  className="w-full border-2 border-black p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-purple-900 block mb-1">
                  Icon / Emoji Selector
                </label>
                <select
                  value={activeBtn.icon}
                  onChange={(e) => updateSelectedButtonField('icon', e.target.value)}
                  className="w-full border-2 border-black p-2 text-xs font-black bg-white"
                >
                  <option value="💧">💧 Water Sip</option>
                  <option value="🚽">🚽 Pee Break</option>
                  <option value="💩">💩 Poop Break</option>
                  <option value="💊">💊 Medication</option>
                  <option value="🍳">🍳 Breakfast</option>
                  <option value="💻">💻 Coding / Tech</option>
                  <option value="🧘">🧘 Somatic Calm</option>
                  <option value="☕">☕ Coffee Break</option>
                  <option value="🦖">🦖 Chaos Mode</option>
                  <option value="🌸">🌸 Kaomoji Sparkle</option>
                </select>
              </div>
            </div>

            {/* PRE-CONFIG CHIPS */}
            <div className="mt-4 border-t-2 border-dashed border-purple-300 pt-3">
              <span className="text-xs font-black uppercase text-purple-900 block mb-2">
                📦 Inbound Preconfig Schemas (Sip / Bio Presets)
              </span>
              <div className="flex flex-wrap gap-2">
                {['sip', 'pee', 'poop', 'meds', 'custom'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handlePreconfigSelect(type as any)}
                    className={`px-2 py-1 border-2 border-black text-[10px] font-black uppercase transition-all ${
                      activeBtn.preconfig === type
                        ? 'bg-purple-800 text-white shadow-[2px_2px_0_#000] translate-y-[-1px]'
                        : 'bg-white text-purple-900 hover:bg-purple-100'
                    }`}
                  >
                    {type === 'sip' && '💧 Hydration / Sip'}
                    {type === 'pee' && '🚽 Urination / Pee'}
                    {type === 'poop' && '💩 Motility / Poop'}
                    {type === 'meds' && '💊 Health / Meds'}
                    {type === 'custom' && '⚙️ Custom Builder'}
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC LOG LINE / TEMPLATE BUILDER */}
            <div className="mt-4 border-t-2 border-dashed border-purple-300 pt-3">
              <label className="text-xs font-black uppercase text-purple-900 block mb-1">
                📝 Log Line Line-builder Template
              </label>
              <input
                type="text"
                value={activeBtn.template}
                disabled={activeBtn.preconfig !== 'custom'}
                onChange={(e) => updateSelectedButtonField('template', e.target.value)}
                className={`w-full border-2 border-black p-2 text-xs font-bold font-mono ${
                  activeBtn.preconfig !== 'custom' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Ex: Hydration Log: +1 Sip"
              />
              <span className="text-[9px] font-bold text-gray-500 mt-1 block">
                {activeBtn.preconfig !== 'custom' 
                  ? '🔒 Template locked to preconfig standard. Switch to Custom Builder to edit.' 
                  : '✏️ Edit template freely. Appending companion inputs automatically binds to the end.'}
              </span>
            </div>

            {/* COLOR CODED PILLS AND TAG COMPILER */}
            <div className="mt-4 border-t-2 border-dashed border-purple-300 pt-3">
              <span className="text-xs font-black uppercase text-purple-900 block mb-2">
                🏷️ Active Tags & Color-Coded Pills Preview
              </span>
              <div className="bg-white border-2 border-black p-3">
                <div className="flex flex-wrap gap-2">
                  {/* Render simulated color coded pills */}
                  {activeBtn.tags.map((tag, tIdx) => {
                    const tagColors = [
                      'bg-teal-100 text-teal-800 border-teal-300',
                      'bg-purple-100 text-purple-800 border-purple-300',
                      'bg-blue-100 text-blue-800 border-blue-300',
                      'bg-pink-100 text-pink-800 border-pink-300',
                    ];
                    const selectedColor = tagColors[tIdx % tagColors.length];

                    return (
                      <span
                        key={tIdx}
                        className={`px-2 py-0.5 border text-[10px] font-black uppercase rounded-full ${selectedColor}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LIVE ZETTEL EXPORT PREVIEW */}
            <div className="mt-4 border-t-2 border-dashed border-purple-300 pt-3">
              <span className="text-xs font-black uppercase text-purple-900 block mb-1">
                👁️ Live Markdown Zettel Card Preview
              </span>
              <div className="bg-[#090d16] border-4 border-black p-4 text-[10px] text-cyan-400 font-mono overflow-x-auto select-all">
                <div>---</div>
                <div>title: "{activeBtn.label} Telemetry"</div>
                <div>zettel_id: "20260826-1606"</div>
                <div>type: "telemetry_log"</div>
                <div>tags:</div>
                {activeBtn.tags.map((tag, tIdx) => (
                  <div key={tIdx}>&nbsp;&nbsp;- "{tag.replace('#', '')}"</div>
                ))}
                <div>preconfig_schema: "{activeBtn.preconfig}"</div>
                <div>---</div>
                <div className="text-yellow-300 mt-2">
                  # {activeBtn.template}
                </div>
                {typedInputText && (
                  <div className="text-pink-300 font-black">
                    &gt; "{typedInputText}"
                  </div>
                )}
                <div className="text-gray-500 mt-2">
                  *Synced on 2026-08-26 via AnyMD Mirrored Widget Dashboard.*
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
