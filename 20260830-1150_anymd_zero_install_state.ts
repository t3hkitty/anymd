import { useState, useEffect } from 'react';

// Sticky Settings Persistence Keys
const KVM_SETTINGS_KEY = '@lorik/zero-install-kvm-settings';
const SOMATIC_TELEMETRY_KEY = '@lorik/somatic-telemetry-state';

export interface KvmConfig {
  activeNode: string;
  monitorIp: string;
  themePreset: 'classic' | 'cute' | 'silly';
  soundEnabled: boolean;
  fontSize: number;
}

export interface SomaticConfig {
  hydrationSips: number;
  lastBioBreakType: 'pee' | 'poop' | 'none';
  lastBioBreakDurationMs: number;
  linguisticInflationFlags: number;
}

const DEFAULT_KVM: KvmConfig = {
  activeNode: 'Node-1 (Workstation)',
  monitorIp: '192.168.1.105',
  themePreset: 'cute',
  soundEnabled: true,
  fontSize: 14,
};

const DEFAULT_SOMATIC: SomaticConfig = {
  hydrationSips: 0,
  lastBioBreakType: 'none',
  lastBioBreakDurationMs: 0,
  linguisticInflationFlags: 0,
};

export const useZeroInstallState = () => {
  const [kvmConfig, setKvmConfigState] = useState<KvmConfig>(() => {
    try {
      const stored = localStorage.getItem(KVM_SETTINGS_KEY);
      return stored ? { ...DEFAULT_KVM, ...JSON.parse(stored) } : DEFAULT_KVM;
    } catch (e) {
      console.warn("KvmConfig: Failed to load, defaulting to Kawaiian safe parameters.", e);
      return DEFAULT_KVM;
    }
  });

  const [somaticConfig, setSomaticConfigState] = useState<SomaticConfig>(() => {
    try {
      const stored = localStorage.getItem(SOMATIC_TELEMETRY_KEY);
      return stored ? { ...DEFAULT_SOMATIC, ...JSON.parse(stored) } : DEFAULT_SOMATIC;
    } catch (e) {
      console.warn("SomaticConfig: Failed to load, defaulting to somatic baselines.", e);
      return DEFAULT_SOMATIC;
    }
  });

  const setKvmConfig = (updates: Partial<KvmConfig>) => {
    setKvmConfigState(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(KVM_SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setSomaticConfig = (updates: Partial<SomaticConfig>) => {
    setSomaticConfigState(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(SOMATIC_TELEMETRY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Cross-Tab Synchronization watchdog
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === KVM_SETTINGS_KEY && e.newValue) {
        setKvmConfigState(JSON.parse(e.newValue));
      }
      if (e.key === SOMATIC_TELEMETRY_KEY && e.newValue) {
        setSomaticConfigState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    kvmConfig,
    setKvmConfig,
    somaticConfig,
    setSomaticConfig,
  };
};
