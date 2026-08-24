import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.artkitty.myblackbox',
  appName: 'MyBlackBox',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
