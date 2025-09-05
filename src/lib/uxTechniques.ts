
import type { Requirement } from './supabaseClient';
import techniqueDetails from '@/data/uxTechniqueDetails.json';

interface TechniqueDetail {
  name: string;
  stage: string;
  outcomes: string[];
  output_types: string[];
  device_types: string[];
  project_types: string[];
}

const allTechniques: TechniqueDetail[] = techniqueDetails;

/**
 * Retrieves a filtered list of UX techniques based on the project requirements,
 * with more inclusive logic for early design stages.
 * @param requirement - The user's selections for the project.
 * @returns An object where keys are 5D stages and values are arrays of recommended technique names.
 */
export function getFilteredTechniques(requirement: Requirement): Record<string, string[]> {
  const recommendations: Record<string, string[]> = {
    Discover: [],
    Define: [],
    Design: [],
    Develop: [],
    Deliver: [],
  };

  if (!requirement) {
    return recommendations;
  }

  allTechniques.forEach(tech => {
    // Helper function to check for array intersection
    const doArraysIntersect = (arr1: string[] | undefined, arr2: string[]) => {
      if (!arr1 || arr1.length === 0) return false;
      // An empty array in the technique details means it's not applicable for this filter type.
      if (arr2.length === 0) return false; 
      return arr1.some(item => arr2.includes(item));
    };

    // 1. Project Type must match. This is a strict requirement for all stages.
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(pType => pType.toLowerCase() === requirement.project_type!.toLowerCase())
      : false;

    // 2. Outcome must have at least one match. This is a strict requirement.
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);

    // 3. Device Type must have at least one match. This is a strict requirement.
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);

    // 4. Output Type match is conditional based on the stage.
    const earlyStages = ["Discover", "Define", "Design"];
    const isEarlyStage = earlyStages.includes(tech.stage);

    // For early stages, we don't filter by output type. We assume these activities are foundational.
    // For later stages (Develop, Deliver), we require an output type match.
    const outputTypeMatch = isEarlyStage || doArraysIntersect(requirement.output_type, tech.output_types);

    // All relevant conditions must be met to recommend the technique.
    if (projectTypeMatch && outcomeMatch && deviceTypeMatch && outputTypeMatch) {
      if (recommendations[tech.stage] && !recommendations[tech.stage].includes(tech.name)) {
        recommendations[tech.stage].push(tech.name);
      }
    }
  });

  return recommendations;
}
