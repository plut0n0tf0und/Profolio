
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
 * Retrieves a filtered list of UX techniques based on strict matching
 * of the project requirements.
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
      if (arr2.length === 0) return false; // A technique with no specified outcomes can't match a requirement with outcomes.
      return arr1.some(item => arr2.includes(item));
    };

    // Project type must match exactly.
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(pType => pType.toLowerCase() === requirement.project_type!.toLowerCase())
      : false;

    // At least one Output Type must match.
    const outputTypeMatch = doArraysIntersect(requirement.output_type, tech.output_types);

    // At least one Outcome must match.
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);

    // At least one Device Type must match.
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);

    // All conditions must be met to recommend the technique.
    if (projectTypeMatch && outputTypeMatch && outcomeMatch && deviceTypeMatch) {
      if (recommendations[tech.stage] && !recommendations[tech.stage].includes(tech.name)) {
        recommendations[tech.stage].push(tech.name);
      }
    }
  });

  return recommendations;
}
