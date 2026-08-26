export interface PinAuthState {
  enabled: boolean;
  pin: string;
}

export function checkPinAuthBypass(frontmatterContent: string): boolean {
  // Checks if ui_guard.enabled: false is set in the frontmatter, bypassing PIN authentication
  const match = frontmatterContent.match(/ui_guard\.enabled\s*:\s*false/i);
  return !!match;
}
