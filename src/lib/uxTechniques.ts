
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
 * Retrieves a filtered list of UX techniques based on project requirements,
 * applying lenient output_type filtering for early stages and strict for later stages.
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
    // Helper to check for array intersection. Returns true if arrays share at least one common element.
    const doArraysIntersect = (reqArray: string[] | undefined, techArray: string[]) => {
      if (!reqArray || reqArray.length === 0 || techArray.length === 0) return false;
      return reqArray.some(item => techArray.includes(item));
    };

    // --- Start Filtering Logic ---

    // 1. Project Type must match. This is a strict requirement for all stages.
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(pType => pType.toLowerCase() === requirement.project_type!.toLowerCase())
      : false;

    // 2. At least one Outcome must match.
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);

    // 3. At least one Device Type must match.
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);

    // 4. Output Type match is conditional based on the stage.
    const earlyStages = ["Discover", "Define", "Design"];
    const isEarlyStage = earlyStages.includes(tech.stage);

    // For early stages, we don't filter by output type. We assume these are foundational.
    // For later stages (Develop, Deliver), we require an output type match.
    const outputTypeMatch = isEarlyStage || doArraysIntersect(requirement.output_type, tech.output_types);

    // --- End Filtering Logic ---

    // All relevant conditions must be met to recommend the technique.
    if (projectTypeMatch && outcomeMatch && deviceTypeMatch && outputTypeMatch) {
      // Ensure stage exists in recommendations and technique is not already added.
      if (recommendations[tech.stage] && !recommendations[tech.stage].includes(tech.name)) {
        recommendations[tech.stage].push(tech.name);
      }
    }
  });

  return recommendations;
}
