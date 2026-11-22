/**
 * Middleware: nuance-brick (Shared Continuity Middleware)
 * Supports shadow entity tracking, implied-line continuity, and continuation_handoff metadata
 * (active_subject, tension_vector) for narrative/translation workflows.
 */

export interface NuanceBrickHandoff {
  brickId: string;
  activeSubject: string;
  tensionVector: string;
  continuityNotes: string;
  updatedAt: string;
}

export function createNuanceHandoff(activeSubject: string, tensionVector: string, continuityNotes: string): NuanceBrickHandoff {
  return {
    brickId: `nb-${Date.now()}`,
    activeSubject,
    tensionVector,
    continuityNotes,
    updatedAt: new Date().toISOString()
  };
}
