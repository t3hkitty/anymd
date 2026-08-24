import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';

interface MealRoutine {
  name: string;
  defaultPrepTime: number; // minutes
  defaultEatTime: number; // minutes
}

export const NourishmentFastingWidget: React.FC = () => {
  // 1-Click Disable Toggle (Stored in localStorage to preserve peace of mind)
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('anymd_fasting_enabled') !== 'false';
  });

  const [activePrepMeal, setActivePrepMeal] = useState<string | null>(null);
  const [customFoodInput, setCustomFoodInput] = useState<string>('');
  const [lastMealEndTime, setLastMealEndTime] = useState<string | null>(() => {
    return localStorage.getItem('anymd_last_meal_end') || null;
  });
  const [computedFast, setComputedFastingWindow] = useState<string | null>(null);
  const [activeTipIndex, setActiveTipIndex] = useState<number>(0);
  
  // HAES / Anti-Diet Modal View State
  const [showHaesHub, setShowHaesHub] = useState<boolean>(false);

  // Dr. Jason Fung's Core Fasting Tips (Actionable, Non-Judgmental, and Science-Backed)
  const drFungTips = [
    "💧 Hydration is key. Dr. Fung recommends drinking plenty of water, herbal teas, or black coffee during fasting windows.",
    "🧬 Fasting isn't about starvation; it's about lowering insulin levels to give your liver and digestive tract a vital period of metabolic rest.",
    "🍳 Break your fast gently. Start with a balanced, whole-food routine (like eggs, broth, or healthy fats) rather than a heavy, sugary carb spike.",
    "🧘 Focus on the 'Why.' Fasting is a tool for mental clarity, cellular cleanup (autophagy), and bodily renewal, not a caloric punishment.",
    "🦁 Hunger comes in waves. It is driven by the hormone ghrelin, which naturally peaks and recedes. Sip warm water and breathe through the peak."
  ];

  // Calculate fasting window passively (T_start - T_last_end) without a ticking countdown
  useEffect(() => {
    if (lastMealEndTime) {
      const lastEnd = new Date(lastMealEndTime).getTime();
      const now = new Date().getTime();
      const diffHours = ((now - lastEnd) / (1000 * 60 * 60)).toFixed(1);
      setComputedFastingWindow(diffHours);
    }
  }, [lastMealEndTime]);

  const handleQuickTapMeal = (mealName: string, notes: string = '') => {
    const nowISO = new Date().toISOString();
    // Convert to 14-digit Zettelkasten serialization format
    const zettelId = nowISO.split('T')[0].replace(/-/g, '') + '-' + nowISO.split('T')[1].substring(0, 5).replace(/:/g, '');
    
    // Log pure, zero-calorie positive fuel telemetry card
    const mealZettel = {
      zettel_id: zettelId,
      title: `🍳 Nourishment Log: ${mealName}`,
      tags: ['#chow_down', '#nourishment', '#telemetry'],
      content: `Consumed ${mealName}${notes ? `: ${notes}` : ''}. Body is primed for activity and focused rest! 🔋`
    };

    console.log("Saving Meal Zettel to vault:", mealZettel);
    
    // Set last meal end to simulate immediately completing a quick-tap snack
    localStorage.setItem('anymd_last_meal_end', nowISO);
    setLastMealEndTime(nowISO);
    setCustomFoodInput('');
    setActivePrepMeal(null);
  };

  const startMealPrepRoutine = (mealName: string) => {
    setActivePrepMeal(mealName);
    const nowISO = new Date().toISOString();
    // Logs the start event automatically for the post-hoc fasting calculation
    console.log(`[T1] Meal Prep Started for ${mealName} at ${nowISO}`);
  };

  const completeMealPrepRoutine = () => {
    if (!activePrepMeal) return;
    handleQuickTapMeal(activePrepMeal, `Prepped & Consumed ${customFoodInput || 'a nourishing meal'}`);
  };

  const toggleWidgetDisplay = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('anymd_fasting_enabled', String(newState));
  };

  if (!isEnabled) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-400 text-center bg-gray-50">
        <span className="text-sm font-bold text-gray-500 mr-2">🚫 Fasting Tracker is currently hidden</span>
        <button 
          onClick={toggleWidgetDisplay}
          className="bg-purple-200 border-2 border-black text-xs font-black px-2 py-1 hover:bg-purple-300 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none"
        >\n          Enable Tracker\n        </button>\n      </div>\n    );\n  }\n\n  return (\n    <WidgetPanel \n      title=\"🍳 Nourishment & Fasting Studio\" \n      badge=\"📌 STICKY TAPE\"\n      className=\"border-4 border-black shadow-[4px_4px_0_#000] bg-white p-2 rounded-none max-w-md relative\"\n    >\n      {/* !?i Anti-Diet/HAES Science Button in top-right corner of the panel */}\n      <button \n        onClick={() => setShowHaesHub(!showHaesHub)}\n        className=\"absolute top-2 right-2 bg-pink-200 border-2 border-black text-[11px] font-black w-6 h-6 flex items-center justify-center shadow-[1px_1px_0_#000] active:translate-y-[1px] active:shadow-none hover:bg-pink-300 z-10\"\n        title=\"HAES & Anti-Diet Scientific Information Hub\"\n      >\n        !?i\n      </button>\n\n      <div className=\"flex flex-col gap-3\">\n        \n        {/* FASTING STATUS BANNER (Post-hoc calculated, zero-ticking) */}\n        <div className=\"bg-purple-100 border-2 border-black p-2 flex justify-between items-center mr-8\">\n          <div>\n            <h4 className=\"font-black text-xs uppercase tracking-tight text-purple-800\">⏱️ Active Metabolic Rest</h4>\n            <p className=\"text-2xl font-black tracking-tighter\">\n              {computedFast ? `${computedFast} Hours` : \"0.0 Hours\"}\n            </p>\n            <span className=\"text-[10px] font-bold text-gray-500 block leading-tight\">\n              Calculated passively (T₂ - T₁) from last logged nourishment\n            </span>\n          </div>\n          <button \n            onClick={toggleWidgetDisplay}\n            className=\"bg-white border-2 border-black text-[10px] font-bold px-2 py-1 hover:bg-gray-100 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none\"\n          >\n            Hide Tracker\n          </button>\n        </div>\n\n        {/* INTERACTIVE HAES & ANTI-DIET SCIENCE HUB PANEL */}\n        {showHaesHub && (\n          <div className=\"bg-pink-50 border-4 border-black p-3 my-1 shadow-[4px_4px_0_#ec4899] transition-all\">\n            <div className=\"flex justify-between items-center border-b-2 border-black pb-1 mb-2\">\n              <span className=\"font-black text-xs text-pink-700 uppercase tracking-tight\">🧬 Anti-Diet & HAES Science Hub</span>\n              <button \n                onClick={() => setShowHaesHub(false)}\n                className=\"text-[9px] bg-white border-2 border-black px-1 font-bold hover:bg-gray-200\"\n              >\n                Close ✖\n              </button>\n            </div>\n            <div className=\"flex flex-col gap-2 text-xs text-black font-bold leading-relaxed\">\n              <p>\n                <span className=\"bg-pink-200 p-0.5\">1. Weight Inclusivity:</span> Health is a spectrum independent of size. HAES shifts clinical focus from coercive weight-loss to sustainable, joyful health behaviors.\n              </p>\n              <p>\n                <span className=\"bg-pink-200 p-0.5\">2. The Failure of Calorie Counting:</span> Multi-decade clinical data confirms 95% of calorie-restrictive diets fail long-term. Metabolic rates down-regulate (adaptive thermogenesis), and chronic restriction elevates cortisol, causing severe anxiety and weight cycling.\n              </p>\n              <p>\n                <span className=\"bg-pink-200 p-0.5\">3. Intuitive Eating Principles:</span> Reject the diet mentality, honor your hunger, respect your fullness, and discover the satisfaction factor of nourishing whole meals.\n              </p>\n              <p>\n                <span className=\"bg-pink-200 p-0.5\">4. Fasting as Hormonal Rest:</span> Dr. Fung's science targets *insulin levels*, not calorie starvation. Giving the gut a rest allows digestion to halt and glycogen levels to stabilize without altering metabolic rate.\n              </p>\n              <div className=\"border-t-2 border-dashed border-black pt-1 mt-1 text-[10px] text-gray-600\">\n                References: *The Fuck It Diet* (Caroline Dooner), *Health at Every Size* (Dr. Lindo Bacon), *The Obesity Code* (Dr. Jason Fung).\n              </div>\n            </div>\n          </div>\n        )}\n\n        {/* QUICK TAP MEAL BUTTONS */}\n        <div className=\"flex flex-col gap-1\">\n          <span className=\"text-xs font-black uppercase tracking-wider text-gray-600\">Quick Logging</span>\n          <div className=\"grid grid-cols-2 gap-2\">\n            <button \n              onClick={() => handleQuickTapMeal('Breakfast')}\n              className=\"bg-green-200 border-2 border-black p-2 font-bold text-xs hover:bg-green-300 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none\"\n            >\n              🥞 Tap Breakfast\n            </button>\n            <button \n              onClick={() => handleQuickTapMeal('Snack')}\n              className=\"bg-yellow-200 border-2 border-black p-2 font-bold text-xs hover:bg-yellow-300 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none\"\n            >\n              🍌 Tap Snack\n            </button>\n          </div>\n        </div>\n\n        {/* CUSTOM ROUTINES WITH PREP TIME */}\n        <div className=\"border-t-2 border-black pt-2 flex flex-col gap-2\">\n          <span className=\"text-xs font-black uppercase tracking-wider text-gray-600\">Prep Routines (Accounts for Cooking)</span>\n          \n          {!activePrepMeal ? (\n            <div className=\"flex gap-2\">\n              <button \n                onClick={() => startMealPrepRoutine('Lunch')}\n                className=\"flex-1 bg-blue-100 border-2 border-black p-1 text-xs font-bold hover:bg-blue-200\"\n              >\n                🥗 Prep Lunch\n              </button>\n              <button \n                onClick={() => startMealPrepRoutine('Dinner')}\n                className=\"flex-1 bg-indigo-100 border-2 border-black p-1 text-xs font-bold hover:bg-indigo-200\"\n              >\n                🍲 Prep Dinner\n              </button>\n            </div>\n          ) : (\n            <div className=\"bg-red-50 border-2 border-black p-2\">\n              <p className=\"text-xs font-black text-red-800 animate-pulse mb-1\">\n                ⏳ ACTIVE PREP ROUTINE: Cooking {activePrepMeal}...\n              </p>\n              <input \n                type=\"text\"\n                value={customFoodInput}\n                onChange={(e) => setCustomFoodInput(e.target.value)}\n                placeholder=\"What are we making? (e.g. Rice, Noodles)\"\n                className=\"w-full border-2 border-black p-1 text-xs font-mono mb-2\"\n              />\n              <button \n                onClick={completeMealPrepRoutine}\n                className=\"w-full bg-red-400 border-2 border-black text-xs font-black text-white p-1 hover:bg-red-500 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none\"\n              >\n                ✅ Done Prepping & Eating!\n              </button>\n            </div>\n          )}\n        </div>\n\n        {/* DR. FUNG'S TIPS PANEL */}\n        <div className=\"bg-yellow-50 border-2 border-black p-2 relative mt-1\">\n          <div className=\"flex justify-between items-center border-b-2 border-black pb-1 mb-1\">\n            <span className=\"font-black text-[10px] text-yellow-800 uppercase\">🧠 Dr. Fung's Fasting Wisdom</span>\n            <button \n              onClick={() => setActiveTipIndex((activeTipIndex + 1) % drFungTips.length)}\n              className=\"text-[9px] bg-white border-2 border-black px-1 font-bold hover:bg-gray-100\"\n            >\n              Next Tip ➔\n            </button>\n          </div>\n          <p className=\"text-xs font-bold leading-snug\">\n            {drFungTips[activeTipIndex]}\n          </p>\n        </div>\n\n      </div>\n    </WidgetPanel>\n  );\n};