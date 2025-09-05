
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
const fiveDStages = ["Discover", "Define", "Design", "Develop", "Deliver"];

/**
 * Retrieves a filtered list of UX techniques based on the project requirements.
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

  // Helper to check for array intersection or if the requirement array is empty
  const matches = (reqArray: string[] | undefined, techArray: string[]): boolean => {
    if (!reqArray || reqArray.length === 0) return true; // If user selected nothing, it's a match
    return reqArray.some(item => techArray.includes(item));
  };
  
  // Helper for project type check
  const projectTypeMatches = (reqType: 'new' | 'old' | undefined, techTypes: string[]): boolean => {
    if (!reqType) return true; // If user selected nothing, it's a match
    return techTypes.some(techType => techType.toLowerCase() === reqType.toLowerCase());
  }

  allTechniques.forEach(tech => {
    const isMatch =
      matches(requirement.outcome, tech.outcomes) &&
      matches(requirement.output_type, tech.output_types) &&
      matches(requirement.device_type, tech.device_types) &&
      projectTypeMatches(requirement.project_type, tech.project_types);

    if (isMatch && recommendations[tech.stage]) {
      recommendations[tech.stage].push(tech.name);
    }
  });

  return recommendations;
}
