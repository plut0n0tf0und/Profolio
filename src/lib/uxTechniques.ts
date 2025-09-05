import techniquesData from '@/../data/uxTechniques.json';

interface TechniqueMapping {
  [key: string]: string[];
}

const techniques: TechniqueMapping = techniquesData;

/**
 * Fetches recommended UX techniques for a given output type.
 *
 * @param outputType - The output type (e.g., "UI Design", "Wireframe").
 * @returns An array of technique names corresponding to the output type, or an empty array if no match is found.
 */
export function getTechniquesForOutput(outputType: string): string[] {
  return techniques[outputType] || [];
}

/**
 * Fetches recommended UX techniques for multiple output types and flattens them into a single unique list.
 *
 * @param outputTypes - An array of output types selected by the user.
 * @returns A single array of unique technique names.
 */
export function getTechniquesForOutputs(outputTypes: string[]): string[] {
    const allTechniques = outputTypes.flatMap(outputType => getTechniquesForOutput(outputType));
    // Return a unique set of techniques
    return [...new Set(allTechniques)];
}
