/**
 * AnymdPlugins.ts - Pre-Installed Default Plugin Ecosystem
 * Houses:
 * 1. signalstackDiscoveryPlugin (determinstic web scraper & "One Shade Off" concept drift aggregator)
 * 2. myBlackboxMicrologPlugin (C4 work scenes, mood scorer, hydration/excretion tracker)
 * 3. goblinCrisisTtsPlugin (crisis micro-decomposer with window.speechSynthesis audio director)
 */

export interface PluginManifest {
  id: string;
  name: string;
  category: 'views' | 'sources' | 'real_time_data' | 'publishing';
  description: string;
  author: string;
  version: string;
  license: string;
  enabledByDefault: boolean;
}

export interface WebClipItem {
  title: string;
  url: string;
  excerpt: string;
  date: string;
}

export interface MicrologData {
  moodScore: number; // 1-10 scale
  cognitiveLoad: number; // 1-5 scale
  category: string; // create, consume, chat, collaborate, chow_down, etc.
  notes: string;
  hydrationMl?: number;
  excretionType?: 'pee' | 'poo';
}

/**
 * 1. SignalStack Discovery Engine Plugin
 * Implements determinstic RSS/web novel text aggregation + "One Shade Off" conceptual offsets.
 */
export class SignalStackDiscoveryPlugin {
  public readonly manifest: PluginManifest = {
    id: 'signalstack-discovery',
    name: 'SignalStack Discovery Engine',
    category: 'sources',
    description: 'Bypasses proprietary feeds using keyword subscriptions, scrapes text novel chapters, and pushes lateral "One Shade Off" topics.',
    author: 't3hkitty',
    version: '1.2.0',
    license: 'Unlicense (Public Domain)',
    enabledByDefault: true
  };

  /**
   * Mock search scraping representing native browser-side feed fetch.
   */
  public async fetchKeywordFeed(keywords: string[]): Promise<WebClipItem[]> {
    // Simulates fetching clean web feeds without proprietary tracking
    return [
      {
        title: `Decentralized Metadata Architecture on Local Plain Text`,
        url: `https://glaforge.dev/posts/2026/08/ meow-data`,
        excerpt: `An exploration into how local markdown and atomic Zettelkasten files provide full data meowty.`,
        date: new Date().toISOString()
      },
      {
        title: `Warp Factory and General Relativity Solitons`,
        url: `https://arxiv.org/abs/2102.06824`,
        excerpt: `A look at constant velocity physical warp drive solutions in modern general relativity.`,
        date: new Date().toISOString()
      }
    ];
  }

  /**
   * Concept Drift: Computes adjacent topics to broaden Zettelkasten coverage (One Shade Off).
   */
  public recommendOneShadeOffTopics(currentTags: string[]): string[] {
    const topicMatrix: Record<string, string[]> = {
      'pkm': ['zettelkasten', 'obsidian', 'knowledge-graphs'],
      'physics': ['general-relativity', 'warp-drives', 'exotic-matter'],
      'health': ['hydration-limits', 'circadian-clocks', 'cognitive-load'],
      'creativity': ['storytelling', 'goblin-tools', 'micro-journaling']
    };

    const suggestions: string[] = [];
    currentTags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (topicMatrix[lowerTag]) {
        suggestions.push(...topicMatrix[lowerTag]);
      }
    });

    // Deduplicate suggestions and exclude existing tags
    return Array.from(new Set(suggestions)).filter(s => !currentTags.includes(s));
  }
}

/**
 * 2. myBlackbox Microlog & C4 Engine Plugin
 * Drives day/night themes, C4 work modes (scenes), and physical excretion/hydration telemetry.
 */
export class MyBlackboxMicrologPlugin {
  public readonly manifest: PluginManifest = {
    id: 'myblackbox-microlog',
    name: 'myBlackbox Microlog Protocol',
    category: 'real_time_data',
    description: 'Lightweight telemetry flight recorder logging emotional indexes, hydration stations, and active C4 work modes.',
    author: 't3hkitty',
    version: '2.5.0',
    license: 'Unlicense (Public Domain)',
    enabledByDefault: true
  };

  /**
   * Formats a quick microlog into standard Zettelkasten markdown with frontmatter.
   */
  public generateMicrologZettel(data: MicrologData): string {
    const timestamp = new Date().toISOString();
    const uid = timestamp.replace(/[-T:.Z]/g, '').substring(0, 14);
    
    let headingTitle = `Microlog entry - ${data.category.toUpperCase()}`;
    if (data.excretionType) {
      headingTitle = `Excretion Station: +1 ${data.excretionType.toUpperCase()}`;
    } else if (data.hydrationMl) {
      headingTitle = `Hydration Station: +1 Sip (${data.hydrationMl}ml)`;
    }

    return [
      '---',
      `zettelkasten_uid: "${uid}"`,
      `category: "${data.category}"`,
      `mood_score: ${data.moodScore}`,
      `cognitive_load: ${data.cognitiveLoad}`,
      data.hydrationMl ? `hydration_ml: ${data.hydrationMl}` : '',
      data.excretionType ? `excretion_type: "${data.excretionType}"` : '',
      `tags:`,
      `  - "blackbox-pulse"`,
      `  - "${data.category}"`,
      '---',
      '',
      `# ${headingTitle}`,
      `*Logged at ${timestamp}*`,
      '',
      `## Telemetry Log`,
      `- **Mood Index**: ${data.moodScore}/10`,
      `- **Cognitive Load**: ${data.cognitiveLoad}/5`,
      data.notes ? `\n### User Reflections\n${data.notes}` : '',
      ''
    ].filter(Boolean).join('\n');
  }

  /**
   * Water Descriptor: Translates metric volume into actionable somatic references.
   */
  public getHydrationDescriptor(totalMl: number): { text: string; badge: string } {
    if (totalMl <= 0) {
      return { text: "Thirsty as a desert. Drink some water!", badge: "🏜️ Desert" };
    }
    if (totalMl < 500) {
      return { text: `You've drunk as much as a toddler's sippy cup so far today.`, badge: "🍼 Sippy Cup" };
    }
    if (totalMl < 1500) {
      return { text: "Standard bottle level reached. Great pacing!", badge: "🍾 Water Bottle" };
    }
    if (totalMl < 3000) {
      return { text: "Somatic hydration is high. You're primed for active focus!", badge: "💧 High Hydration" };
    }
    return { text: "Whoa, that is a full pallet of water bottles right there!", badge: "🚚 Water Pallet" };
  }
}

/**
 * 3. Goblin Crisis & TTS Director Plugin
 * Uses window.speechSynthesis to read out atomic steps during meltdowns/executive paralysis.
 */
export class GoblinCrisisTtsPlugin {
  public readonly manifest: PluginManifest = {
    id: 'goblin-crisis-tts',
    name: 'Goblin Crisis & Somatic Director',
    category: 'views',
    description: 'Decomposes overwhelming situations into 1-minute steps, speaking them in a soothing, measured local voice pack.',
    author: 't3hkitty',
    version: '1.4.0',
    license: 'Unlicense (Public Domain)',
    enabledByDefault: true
  };

  private activeUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Somatic task decomposition list based on emotional distress preset.
   */
  public getEmergencyDecomposition(situation: string): string[] {
    const lowerSituation = situation.toLowerCase();
    
    if (lowerSituation.includes('meltdown') || lowerSituation.includes('crying')) {
      return [
        "1. Immediate permission to stop everything. Hands off the keyboard.",
        "2. Splash freezing cold water on your face or hold a cold ice pack to the back of your neck.",
        "3. Put on your noise-canceling headphones and dim the room lights to 10%.",
        "4. Drink exactly 4 ounces of ice water, taking three deep slow exhales.",
        "5. Touch one single physical object in the room and trace its textures before continuing."
      ];
    }
    
    if (lowerSituation.includes('paralysis') || lowerSituation.includes('start')) {
      return [
        "1. Open a blank notepad or text editor. Write just one single word.",
        "2. Close your eyes and count backward from 10 to 1.",
        "3. Tell yourself: 'I only have to type for two minutes, then I can stop.'",
        "4. Set a fast 5-minute 'Beat-the-Clock' compete timer.",
        "5. Type whatever chaotic text comes to mind. Do not edit, just dump."
      ];
    }

    return [
      "1. Pause what you are doing. Lean back and let your shoulders drop.",
      "2. Observe three things you can hear, two you can touch, and one you can smell.",
      "3. Break the current block into a single sentence requirement.",
      "4. Start the next task and spend 60 seconds on it."
    ];
  }

  /**
   * TTS Audio Director: Speaks a single micro-step using browser client-side audio synthesis.
   * Completely local and zero-telemetry compliant.
   */
  public speakStep(stepText: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.stopSpeaking();

    const cleanText = stepText.replace(/^\d+\.\s*/, ''); // Strip numerical markers
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Soothing, calm broadcast voice configurations
    utterance.rate = 0.85; // Measured, slower pacing to decrease anxiety
    utterance.pitch = 0.95; // Slightly lower, comforting frequency
    
    // Choose first english voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
  }
}
