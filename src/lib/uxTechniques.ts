import techniquesData from '@/../data/uxTechniques.json';


export type TechniqueMapping = Record<string, string[]>;

const techniques = techniquesData as TechniqueMapping;

export function getTechniquesForOutput(outputType: string): string[] {
  if (!outputType) return [];
  return techniques[outputType] ?? [];
}

export function getTechniquesForOutputs(outputTypes: string[] = []): string[] {
  if (!Array.isArray(outputTypes)) return [];
  const all = outputTypes.flatMap(t => {
      // Handle combined keys like "UI Design, Visual Design"
      const individualTypes = t.split(',').map(s => s.trim());
      return individualTypes.flatMap(singleType => techniques[singleType] ?? []);
  });
  // Return unique techniques
  return Array.from(new Set(all));
}
