import techniquesData from '@/../data/uxTechniques.json';

export type TechniqueMapping = Record<string, string[]>;

const techniques = techniquesData as TechniqueMapping;

/**
 * Retrieves the list of UX techniques for a specific 5D stage.
 * @param stage - The name of the 5D stage (e.g., "Discover", "Define").
 * @returns An array of technique strings for that stage, or an empty array if not found.
 */
export function getTechniquesForStage(stage: string): string[] {
  if (!stage) return [];
  return techniques[stage] ?? [];
}

/**
 * Returns the entire mapping of stages to techniques.
 * @returns The full technique mapping object.
 */
export function getAllTechniques(): TechniqueMapping {
  return techniques;
}
