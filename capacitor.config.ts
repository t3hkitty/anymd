import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.artkitty.anymd',
  appName: 'AnyMD',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
