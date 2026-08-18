/**
 * Running Litany, Inactivity Watchdog & AuDHD Morning Manager Plugin
 * Real-time continuous blackbox activity stream, idle watchdog & sleep/traffic synced alarm.
 */

export interface LitanyPulseEntry {
  id: string;
  timestamp: string; // ISO string
  formattedTime: string; // e.g. 10:15 AM
  activityType: 'reading' | 'drafting' | 'routine' | 'collecting' | 'resting' | 'system';
  intensity: 1 | 2 | 3 | 4 | 5;
  headline: string;
  bodySnippet?: string;
  zettelSerial: string;
  tags: string[];
  emojiBurst: string[];
}

export interface WatchdogSettings {
  isEnabled: boolean;
  idleThresholdMinutes: number; // e.g. 2 minutes
  currentActivityStatus: 'Active' | 'Deep Focus' | 'Resting' | 'Sleeping';
  soundChimeEnabled: boolean;
  ttsVoicePrompt: string;
  lastActiveTimestamp: number;
}

export interface AuDhdMorningSettings {
  wakeTargetTime: string; // e.g. "07:30"
  prepBufferMinutes: number; // e.g. 45 min
  transitionTaxMinutes: number; // e.g. 15 min AuDHD task-switching tax
  estimatedCommuteMinutes: number; // e.g. 25 min
  trafficIncidentDelayMinutes: number; // e.g. 12 min
  isAlarmArmed: boolean;
  ttsAlarmGreeting: string; // e.g. "Wake up sovereign operator! Traffic congestion detected on I-90."
  snoozeCount: number;
}

export const DEFAULT_LITANY_ENTRIES: LitanyPulseEntry[] = [
  {
    id: 'litany-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    formattedTime: '09:42 AM',
    activityType: 'drafting',
    intensity: 4,
    headline: 'Synthesized Inspo Ledger & Character Slugs for Peak Lord Arc',
    bodySnippet: 'Refined [MC:flaw] and [ML:eyes] subtext dialogue with non-prose structural interrogatives.',
    zettelSerial: 'ZK-20260818-LITANY-1A4C',
    tags: ['drafting', 'svsss', 'character-slugs'],
    emojiBurst: ['🎋', '🗡️', '⚡', '✨']
  },
  {
    id: 'litany-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    formattedTime: '09:15 AM',
    activityType: 'routine',
    intensity: 3,
    headline: 'Executed Morning Sustenance & Electrolyte Protocol',
    bodySnippet: 'Consumed banana fuel and warm matcha infusion. Circadian light alignment 100%.',
    zettelSerial: 'ZK-20260818-LITANY-8F32',
    tags: ['routine', 'circadian', 'sustenance'],
    emojiBurst: ['🍌', '🍵', '☀️', '💧']
  },
  {
    id: 'litany-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    formattedTime: '08:00 AM',
    activityType: 'system',
    intensity: 2,
    headline: 'Blackbox Watchdog & Sleep Sync Heartbeat Active',
    bodySnippet: 'Local storage quotas verified. Zero external telemetry egress confirmed.',
    zettelSerial: 'ZK-20260818-LITANY-00E9',
    tags: ['watchdog', 'blackbox', 'sovereign'],
    emojiBurst: ['⬛', '🛡️', '🔒']
  }
];

export const DEFAULT_WATCHDOG_SETTINGS: WatchdogSettings = {
  isEnabled: true,
  idleThresholdMinutes: 2,
  currentActivityStatus: 'Active',
  soundChimeEnabled: true,
  ttsVoicePrompt: 'Gentle pulse check: Are we still working on this step, or would you like to take a low-friction micro-break?',
  lastActiveTimestamp: Date.now()
};

export const DEFAULT_AUDHD_MORNING: AuDhdMorningSettings = {
  wakeTargetTime: '07:30',
  prepBufferMinutes: 45,
  transitionTaxMinutes: 15,
  estimatedCommuteMinutes: 25,
  trafficIncidentDelayMinutes: 10,
  isAlarmArmed: true,
  ttsAlarmGreeting: 'Wake up! Traffic delay of 10 minutes detected on your primary route. Total prep buffer adjusted.',
  snoozeCount: 0
};

export const LITANY_STORAGE_KEY = 'lc_md_running_litany_v1';
export const WATCHDOG_STORAGE_KEY = 'lc_md_watchdog_settings_v1';
export const AUDHD_STORAGE_KEY = 'lc_md_audhd_morning_v1';

export function loadRunningLitany(): LitanyPulseEntry[] {
  try {
    const raw = localStorage.getItem(LITANY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load running litany:', err);
  }
  return DEFAULT_LITANY_ENTRIES;
}

export function saveRunningLitany(entries: LitanyPulseEntry[]): void {
  try {
    localStorage.setItem(LITANY_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save running litany:', err);
  }
}

export function loadWatchdogSettings(): WatchdogSettings {
  try {
    const raw = localStorage.getItem(WATCHDOG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_WATCHDOG_SETTINGS, ...JSON.parse(raw), lastActiveTimestamp: Date.now() };
    }
  } catch (err) {
    console.warn('Failed to load watchdog settings:', err);
  }
  return DEFAULT_WATCHDOG_SETTINGS;
}

export function saveWatchdogSettings(settings: WatchdogSettings): void {
  try {
    localStorage.setItem(WATCHDOG_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save watchdog settings:', err);
  }
}

export function loadAuDhdMorningSettings(): AuDhdMorningSettings {
  try {
    const raw = localStorage.getItem(AUDHD_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_AUDHD_MORNING, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to load AuDHD morning settings:', err);
  }
  return DEFAULT_AUDHD_MORNING;
}

export function saveAuDhdMorningSettings(settings: AuDhdMorningSettings): void {
  try {
    localStorage.setItem(AUDHD_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save AuDHD morning settings:', err);
  }
}
