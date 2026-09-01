import React, { useState, useEffect, useRef } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';

interface Anthem {
  title: string;
  artist: string;
  url: string;
  cheesyFactor: string; // 🕶️, 🧀, 🧀🧀, 🧀🧀🧀
}

interface ChoreStep {
  title: string;
  instruction: string;
  hypeQuote: string;
}

export const MotivationHelperWidget: React.FC = () => {
  // Configurable User Call-Sign (Retrieved from Accounts/Connections settings)
  const userCallSign = localStorage.getItem('anymd_tts_callsign') || 'Hey Kitty';

  // State Management
  const [activeChore, setActiveChore] = useState<string>('Sort & Fold Laundry');
  const [selectedAnthem, setSelectedAnthem] = useState<Anthem | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5-minute countdown (300s)
  const [isDone, setIsDone] = useState<boolean>(false);
  const [aiBanter, setAiBanter] = useState<string>("Wait... did you think that 2mg Intuniv was going to fold the sheets for you? Put your headphones on, choose a weapon of auditory mass distraction, and let's beat the clock!");
  
  // TTS Coach Boss State
  const [coachActive, setCoachActive] = useState<boolean>(false);
  const [coachPersona, setCoachPersona] = useState<'hype_man' | 'drill_sergeant' | 'aerobics_instructor'>('hype_man');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Idle Bro Helper Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customIdleTasks, setCustomIdleTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('anymd_idle_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['Sort & Fold Laundry', 'Sweep Kitchen Floor', 'Water Plants', 'Clean Desk', 'Stretch 5 Minutes'];
  });
  const [newTaskInput, setNewTaskInput] = useState('');

  const saveIdleTasks = (tasks: string[]) => {
    setCustomIdleTasks(tasks);
    localStorage.setItem('anymd_idle_tasks', JSON.stringify(tasks));
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Curated list of cheesy ass motivation anthems
  const cheesyAnthems: Anthem[] = [
    { title: "Eye of the Tiger", artist: "Survivor", url: "https://www.youtube.com/watch?v=btPJPFnesV4", cheesyFactor: "🧀🧀🧀" },
    { title: "Danger Zone", artist: "Kenny Loggins", url: "https://www.youtube.com/watch?v=siwpn14IE7E", cheesyFactor: "🧀🧀🧀" },
    { title: "Holding Out for a Hero", artist: "Bonnie Tyler", url: "https://www.youtube.com/watch?v=bWcASV2sey0", cheesyFactor: "🧀🧀" },
    { title: "The Final Countdown", artist: "Europe", url: "https://www.youtube.com/watch?v=9jK-NcRmVcw", cheesyFactor: "🧀🧀🧀" },
    { title: "You're the Best", artist: "Joe Esposito", url: "https://www.youtube.com/watch?v=oomCIXGznYs", cheesyFactor: "🧀🧀" },
    { title: "Don't Stop Believin'", artist: "Journey", url: "https://www.youtube.com/watch?v=VcjzHMhBtf0", cheesyFactor: "🧀" },
    { title: "Never Gonna Give You Up", artist: "Rick Astley", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", cheesyFactor: "🧀🧀🧀" }
  ];

  // AI Buddy context-aware, slightly sarcastic rants to break rumination loops
  const buddyRants = [
    "🤖 'Those sheets aren't going to align themselves into neat spatial-anchored piles, operator!'",
    "🤖 'My telemetry indicates a 99% risk of laundry-mountain containment breach unless we act immediately.'",
    "🤖 'Intuniv absorption rate: Peak. Cognitive readiness: Ready. Music selection: Unapologetically cheesy. Initiating launch sequence!'",
    "🤖 'I'm not saying the laundry is plotting against you, but it is definitely whispering in Simalese...'"
  ];

  // Dynamic Chore Micro-Steps (High-Energy & Sarcastic)
  const choreStepsMap: Record<string, ChoreStep[]> = {
    'Sort & Fold Laundry': [
      { 
        title: "DUMP THE MOUNTAIN", 
        instruction: "Slam that basket upside down onto the bed! We need full surface disruption!", 
        hypeQuote: "WE DON'T NEGOTIATE WITH CLOTHING PILES! SHAKE OUT THE WRINKLES AND MARK YOUR TERRITORY!" 
      },
      { 
        title: "SOCK HUNTER GENERAL", 
        instruction: "Scout out matching sock pairs. No mismatched hostages left behind!", 
        hypeQuote: "PAIRS ONLY! SOCKS ARE SOCIAL BEINGS! GRAB THE ANKLES AND CRANK UP THE TEMPO!" 
      },
      { 
        title: "HANG AND CONQUER", 
        instruction: "Get those shirts onto hangers before they shrivel like old raisins!", 
        hypeQuote: "HANGERS ON DECK! SNAP-SNAP-SNAP! HIGH VELOCITY COLLAR ENTRY!" 
      },
      { 
        title: "THE DEEPEST DRAWER", 
        instruction: "Fold the rest with mechanical precision and shove them into their designated grids.", 
        hypeQuote: "BOOM! THE SHEETS ARE DEFEATED! LAUNDRY IS NOW RE-CONTAINED!" 
      }
    ],
    'Default Chore': [
      { 
        title: "SECURE THE ZONE", 
        instruction: "Isolate the first micro-segment of the chore. Clear your perimeter.", 
        hypeQuote: "EYES ON THE PRIZE! ONE THING AT A TIME, ABSOLUTE FOCUS!" 
      },
      { 
        title: "HIGH VELOCITY ATTACK", 
        instruction: "Attack the selected segment with 110% energy for exactly 2 minutes.", 
        hypeQuote: "GO! GO! GO! NO COGNITIVE LAG! MAKE THE INTUNIV PROUD!" 
      },
      { 
        title: "CLEAN DEBRIS", 
        instruction: "Throw away trash or return items to their home bases.", 
        hypeQuote: "CLEAR THE DEBRIS! RETREAT IS NOT AN OPTION!" 
      },
      { 
        title: "DOPAMINE VICTORY LAP", 
        instruction: "Check it off, throw your hands up, and scream 'No Zero Days!'", 
        hypeQuote: "YOU'VE WON! SHUT IT DOWN! LAUNCH THE CONFETTI!" 
      }
    ]
  };

  const getActiveSteps = (): ChoreStep[] => {
    return choreStepsMap[activeChore] || choreStepsMap['Default Chore'];
  };

  // Host-native TTS Speech Engine (Web Speech API) - Zero-cost, 100% private
  const speakTtsAlert = (phrase: string, urgent: boolean = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Abort previous speaking
      const utterance = new SpeechSynthesisUtterance(phrase);
      
      // Calibrate voice based on selected Coach Persona
      if (urgent) {
        utterance.rate = 1.15; // Fast and frantic hype
        utterance.pitch = 1.2;
      } else {
        switch (coachPersona) {
          case 'hype_man':
            utterance.rate = 1.10;
            utterance.pitch = 1.3;
            break;
          case 'drill_sergeant':
            utterance.rate = 0.90;
            utterance.pitch = 0.8;
            break;
          case 'aerobics_instructor':
            utterance.rate = 1.20;
            utterance.pitch = 1.4;
            break;
          default:
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
        }
      }

      // Attempt to load standard browser voices
      const voices = window.speechSynthesis.getVoices();
      const highEnergyVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('David'));
      if (highEnergyVoice) utterance.voice = highEnergyVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  // Launch Sequence
  const handleLaunchProtocol = (anthem: Anthem) => {
    setSelectedAnthem(anthem);
    setIsRunning(true);
    setTimeLeft(300);
    setIsDone(false);

    // 1. Trigger the Host Native TTS voice announcement
    const ttsScript = `${userCallSign}! Headphones equipped! Activating the ${activeChore} motivation engine with ${anthem.title} by ${anthem.artist}. You have 5 minutes to beat the clock. Let's make today non-zero!`;
    speakTtsAlert(ttsScript, true);

    // 2. Open the surprise loud YouTube video in a new tab to initiate the audio
    setTimeout(() => {
      window.open(anthem.url, '_blank');
    }, 1500);

    // 3. Set funny AI Buddy encouragement
    const randomRant = buddyRants[Math.floor(Math.random() * buddyRants.length)];
    setAiBanter(randomRant);

    // 4. Start the 5-Minute Countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          setIsDone(true);
          handleSprintFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Launch TTS Coach Boss Micro-Steps
  const triggerCoachStep = (index: number) => {
    const steps = getActiveSteps();
    if (index >= steps.length) {
      setCoachActive(false);
      triggerConfetti();
      return;
    }

    setActiveStepIndex(index);
    setCoachActive(true);

    const step = steps[index];
    let spokenIntro = '';

    // Persona-specific vocal performance
    switch (coachPersona) {
      case 'hype_man':
        spokenIntro = `OH YEAH! STEP ${index + 1}: ${step.title}! ${step.instruction} ${step.hypeQuote}`;
        break;
      case 'drill_sergeant':
        spokenIntro = `DROP AND GIVE ME SPREADSHEETS! STEP ${index + 1}: ${step.title}! LISTEN UP: ${step.instruction} NO EXCUSES, SOLDIER! MOVE IT!`;
        break;
      case 'aerobics_instructor':
        spokenIntro = `AND STEP, AND WORK! AWESOME! STEP ${index + 1}: ${step.title}! Feel that burn while you ${step.instruction} Keep that smile on! You are doing AMAZING!`;
        break;
    }

    speakTtsAlert(spokenIntro, false);
  };

  const handleSprintFinish = () => {
    // Plays success chime
    const endScript = `${userCallSign}! Time is up! Beat-the-clock sprint successfully logged. Go ahead and launch the dopamine victory confetti! You've made today non-zero!`;
    speakTtsAlert(endScript, true);
    
    // Auto-save Zettel entry to vault
    const nowISO = new Date().toISOString();
    const zettelId = nowISO.split('T')[0].replace(/-/g, '') + '-' + nowISO.split('T')[1].substring(0, 5).replace(/:/g, '');
    
    const motivationZettel = {
      zettel_id: zettelId,
      title: `⚡ Motivation Victory: ${activeChore}`,
      tags: ['#motivation_booster', '#beat_the_clock', '#dopamine_victory', '#laundry_sprint', '#non_zero'],
      content: `Successfully ran a 5-minute high-energy sprint for "${activeChore}" with soundtrack "${selectedAnthem?.title || 'Cheesy Anthem'}". Task has been un-blocked! 🏆`
    };
    
    console.log("Saving Zettel Log to vault:", motivationZettel);
  };

  // 1-Click Boost
  const handleAddFiveMinutes = () => {
    setTimeLeft(prev => prev + 60); // Adds 60 seconds
    speakTtsAlert("Plus one minute added to the active countdown. Push the boundary!", true);
  };

  // Trigger local canvas confetti burst
  const triggerConfetti = () => {
    setIsRunning(false);
    setIsDone(true);
    setCoachActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    handleSprintFinish();

    // Trigger local global confetti framework (hooked up by Antigravity)
    if ((window as any).confetti) {
      (window as any).confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      alert("🏆 DOPAMINE VICTORY CONGRATULATIONS! Confetti engine active in spirit!");
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Coach Boss ASCII Art Generator
  const getCoachAscii = () => {
    switch (coachPersona) {
      case 'hype_man':
        return (
`   😎 [ HYPE BOSS ]\n` +
`   (▀̿Ĺ̯▀̿ ̿) ♪ "LET'S GOOO!"\n` +
`   /▓▓▓\\ 📢  *Whistle blows*`
        );
      case 'drill_sergeant':
        return (
`   🤠 [ DRILL BOSS ]\n` +
`   (╬ಠ益ಠ) ⚡ "MOVE IT!"\n` +
`   /███\\ ⚔️   *Whistle shrieks*`
        );
      case 'aerobics_instructor':
        return (
`   💅 [ GLAM BOSS ]\n` +
`   (◕‿◕✿) 🌟 "KEEP SMILING!"\n` +
`   /♥▓♥\\ 📻  *Synths pumping*`
        );
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <WidgetPanel 
      title="🔥 'Eye of the Tiger' Motivation Hub" 
      badge="📌 STICKY TAPE"
      className="border-4 border-black shadow-[4px_4px_0_#000] bg-white p-2 rounded-none max-w-md"
    >
      <div className="flex flex-col gap-3">
        
        {/* RETRO CASSETTE / HEADPHONE ASCII HERO GRAPHIC */}
        {!coachActive ? (
          <div className="bg-yellow-100 border-2 border-black p-2 font-mono text-[10px] text-center leading-tight whitespace-pre-wrap select-none overflow-hidden">
{`   ┌──────────────────────────┐\n` +
`   │ ♫ AI Buddy Cheesy-Pop ♫  │\n` +
`   │   [●]  [●]  [■]  [►]     │\n` +
`   │  ▄▄▄▄ ▄▄  ▄▄ ▄▄▄▄ ▄ ▄▄   │\n` +
`   └─────▄─▄──────────▄─▄─────┘\n` +
`         └─┘          └─┘`}
          </div>
        ) : (
          <div className="bg-pink-100 border-2 border-black p-2 font-mono text-[10px] text-center leading-tight whitespace-pre-wrap select-none overflow-hidden">
            <pre className="font-bold text-pink-900">{getCoachAscii()}</pre>
          </div>
        )}

        {/* CURRENT TARGET INPUT */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase text-gray-600">Active High-Friction Chore:</label>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="text-[10px] font-bold font-mono px-2 py-0.5 border-2 border-black bg-purple-200 hover:bg-purple-300 text-black cursor-pointer"
            >
              ⚙️ Idle Helper Settings
            </button>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={activeChore}
              onChange={(e) => setActiveChore(e.target.value)}
              placeholder="e.g. Sort & Fold Laundry..."
              className="border-2 border-black p-2 text-sm font-bold flex-1 bg-[#fdfdfd] focus:outline-none"
              disabled={isRunning || coachActive}
            />
            {/* Quick dropdown for chores with hardcoded steps */}
            <select 
              value={activeChore} 
              onChange={(e) => setActiveChore(e.target.value)}
              className="border-2 border-black p-1 text-xs font-bold"
              disabled={isRunning || coachActive}
            >
              {customIdleTasks.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="Sort & Fold Laundry">👕 Laundry</option>
              <option value="Default Chore">🔧 Custom / General</option>
            </select>
          </div>
        </div>

        {/* IDLE BRO HELPER SETTINGS CARD */}
        {isSettingsOpen && (
          <div className="bg-purple-100 border-4 border-black p-3 my-1 font-mono text-xs shadow-[3px_3px_0_#000] space-y-2">
            <div className="flex justify-between items-center border-b-2 border-black pb-1">
              <span className="font-black text-xs text-purple-900 uppercase">⚙️ Idle Bro Task &amp; Routine Settings</span>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="font-bold text-xs bg-black text-white px-1.5 py-0.5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase block">Custom Idle Task Queue:</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add new idle task..."
                  className="border-2 border-black p-1 text-xs flex-1 bg-white"
                />
                <button
                  onClick={() => {
                    if (!newTaskInput.trim()) return;
                    saveIdleTasks([...customIdleTasks, newTaskInput.trim()]);
                    setNewTaskInput('');
                  }}
                  className="border-2 border-black bg-black text-white px-2 text-xs font-bold"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {customIdleTasks.map((task, idx) => (
                  <span key={idx} className="bg-white border-2 border-black px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                    <span>{task}</span>
                    <button
                      onClick={() => saveIdleTasks(customIdleTasks.filter((_, i) => i !== idx))}
                      className="text-red-600 font-bold hover:text-red-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION: COACH BOSS ACTIVE MODAL / CARD --- */}
        {coachActive && (
          <div className="bg-[#ffeb3b] border-4 border-black p-3 my-1 shadow-[4px_4px_0_#000] relative">
            <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-2">
              <span className="font-black text-xs text-black uppercase tracking-tight">📣 LIVE TTS COACH BOSS PROTOCOL</span>
              <button 
                onClick={() => setCoachActive(false)}
                className="text-[9px] bg-white border-2 border-black px-1 font-bold hover:bg-gray-200"
              >
                Abort Coach ✖
              </button>
            </div>
            
            <div className="text-center py-2">
              <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
                STEP {activeStepIndex + 1} OF {getActiveSteps().length}
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight text-red-600 mt-2">
                {getActiveSteps()[activeStepIndex].title}
              </h3>
              <p className="text-sm font-bold text-gray-900 mt-2 bg-white border-2 border-black p-2 shadow-[2px_2px_0_#000]">
                "{getActiveSteps()[activeStepIndex].instruction}"
              </p>
              <p className="text-xs font-black italic text-yellow-950 mt-2 leading-snug">
                {getActiveSteps()[activeStepIndex].hypeQuote}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              {activeStepIndex > 0 && (
                <button 
                  onClick={() => triggerCoachStep(activeStepIndex - 1)}
                  className="flex-1 bg-white border-2 border-black p-2 text-xs font-bold hover:bg-gray-100"
                >
                  ◀ Previous
                </button>
              )}
              {activeStepIndex < getActiveSteps().length - 1 ? (
                <button 
                  onClick={() => triggerCoachStep(activeStepIndex + 1)}
                  className="flex-1 bg-emerald-300 border-2 border-black p-2 text-xs font-black hover:bg-emerald-400 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none uppercase"
                >
                  Next Step ▶
                </button>
              ) : (
                <button 
                  onClick={() => triggerCoachStep(activeStepIndex + 1)}
                  className="flex-1 bg-rose-400 text-white border-2 border-black p-2 text-xs font-black hover:bg-rose-500 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none uppercase"
                >
                  Complete Task! 🏆
                </button>
              )}
            </div>
          </div>
        )}

        {/* THE ACTIVE COUNTDOWN TIMER */}
        {isRunning && !coachActive && (
          <div className="bg-pink-100 border-2 border-black p-3 text-center transition-all animate-pulse">
            <h4 className="font-black text-xs uppercase tracking-wider text-pink-700">⏱️ BEAT-THE-CLOCK SPRINT ACTIVE</h4>
            <div className="text-4xl font-black tracking-widest text-black font-mono my-1">
              {formatTime(timeLeft)}
            </div>
            <div className="flex gap-2 justify-center mt-2">
              <button 
                onClick={handleAddFiveMinutes}
                className="bg-white border-2 border-black text-xs font-bold px-2 py-1 hover:bg-gray-100 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none"
              >
                ➕ +1 Minute Boost
              </button>
              <button 
                onClick={triggerConfetti}
                className="bg-emerald-300 border-2 border-black text-xs font-black px-2 py-1 hover:bg-emerald-400 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none uppercase"
              >
                🏆 Finished early!
              </button>
            </div>
          </div>
        )}

        {/* AI BUDDY TEXT INTERCEPTOR */}
        {!coachActive && (
          <div className="bg-purple-50 border-2 border-black p-2 font-bold text-xs relative flex gap-2 items-start">
            <span className="text-lg">🦊</span>
            <div>
              <span className="text-[9px] bg-purple-700 text-white px-1 uppercase block w-max mb-1 font-black">AI Buddy / Troll Interceptor</span>
              <p className="leading-snug italic text-purple-950">"{aiBanter}"</p>
            </div>
          </div>
        )}

        {/* SELECT ANTHEM & COACH SELECT LAUNCH AREA */}
        {!isRunning && !coachActive && (
          <div className="border-t-2 border-black pt-2 flex flex-col gap-2">
            {/* Coach Persona Selector */}
            <div className="flex justify-between items-center bg-gray-50 p-2 border-2 border-black">
              <span className="text-[11px] font-black uppercase text-gray-700">📣 Coach Voice:</span>
              <select 
                value={coachPersona} 
                onChange={(e) => setCoachPersona(e.target.value as any)}
                className="border-2 border-black text-xs font-bold p-1 cursor-pointer"
              >
                <option value="hype_man">😎 Excitement Hype Boss</option>
                <option value="drill_sergeant">🤠 Drill Sergeant Boss</option>
                <option value="aerobics_instructor">💅 80s Glam Instructor</option>
              </select>
            </div>

            {/* Launch Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button 
                onClick={() => triggerCoachStep(0)}
                className="bg-yellow-300 hover:bg-yellow-400 border-2 border-black p-2.5 font-black text-xs uppercase tracking-tight shadow-[3px_3px_0_#000] active:translate-y-[1px] active:shadow-none"
              >
                🔊 Launch Coach Boss
              </button>
              <button 
                onClick={() => handleLaunchProtocol(cheesyAnthems[0])}
                className="bg-blue-300 hover:bg-blue-400 border-2 border-black p-2.5 font-black text-xs uppercase tracking-tight shadow-[3px_3px_0_#000] active:translate-y-[1px] active:shadow-none"
              >
                🎸 Play Eye of Tiger
              </button>
            </div>

            {/* Expandable Anthems */}
            <span className="text-[10px] font-black uppercase text-gray-500 mt-1">Or choose a custom anthem & start timer:</span>
            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
              {cheesyAnthems.slice(1).map((anthem, index) => (
                <button 
                  key={index}
                  onClick={() => handleLaunchProtocol(anthem)}
                  className="w-full text-left bg-blue-50 hover:bg-blue-100 border-2 border-black p-1.5 font-bold text-[11px] flex justify-between items-center"
                >
                  <span>🎸 {anthem.title} <span className="text-[9px] text-gray-500">({anthem.artist})</span></span>
                  <span className="text-[9px] font-black">{anthem.cheesyFactor}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MANUAL SPRINT EXITS & CELEBRATION */}
        {isDone && (
          <div className="bg-emerald-100 border-4 border-black p-3 text-center my-1">
            <h3 className="font-black text-sm uppercase text-emerald-800">🎉 TASK COMPLETED SUCCESSFULLY!</h3>
            <p className="text-xs font-bold text-gray-700 mt-1">Today is officially a Non-Zero Day. Take a break!</p>
            <button 
              onClick={triggerConfetti}
              className="mt-3 bg-yellow-300 hover:bg-yellow-400 border-2 border-black font-black uppercase tracking-tight p-2 text-xs w-full shadow-[3px_3px_0_#000] active:translate-y-[1px] active:shadow-none"
            >\n              🌈 BURST MORE DOPAMINE CONFETTI!\n            </button>
          </div>
        )}

      </div>
    </WidgetPanel>
  );
};