
import type { Requirement } from './supabaseClient';
import techniqueDetails from '@/data/uxTechniqueDetails.json';

interface TechniqueDetail {
  name: string;
  slug: string;
  stage: string;
  outcomes: string[];
  output_types: string[];
  device_types: string[];
  project_types: ("New" | "Old")[];
  user_base: ("new" | "existing")[];
  goals: string[];
  constraints: string[];
}

const allTechniques: TechniqueDetail[] = techniqueDetails as TechniqueDetail[];

/**
 * Checks for a non-empty intersection between two string arrays.
 * @param reqArray - First array (e.g., from user requirements).
 * @param techArray - Second array (e.g., from technique data).
 * @returns True if they share at least one common element, false otherwise.
 */
const doArraysIntersect = (reqArray: readonly string[] | undefined | null, techArray: readonly string[]): boolean => {
    if (!reqArray || reqArray.length === 0 || !techArray || techArray.length === 0) {
      return false; // No intersection if either array is empty or undefined.
    }
    return reqArray.some(item => techArray.includes(item));
};

/**
 * Retrieves a filtered list of UX techniques based on project requirements.
 * @param requirement - The user's selections for the project.
 * @returns An object where keys are 5D stages and values are arrays of recommended technique objects.
 */
export function getFilteredTechniques(requirement: Requirement): Record<string, { name: string; slug: string }[]> {
  const recommendations: Record<string, { name: string; slug: string }[]> = {
    Discover: [],
    Define: [],
    Design: [],
    Develop: [],
    Deliver: [],
  };

  if (!requirement) {
    return recommendations;
  }
  
  const userContext = requirement.existing_users ? "existing" : "new";

  allTechniques.forEach(tech => {
    let isMatch = true; // Start by assuming the technique is a match.

    // Disqualify if checks fail.

    // 1. Project Type check
    if (requirement.project_type && !tech.project_types.some(p => p.toLowerCase() === requirement.project_type!.toLowerCase())) {
        isMatch = false;
    }

    // 2. User Base check
    if (!tech.user_base.includes(userContext)) {
        isMatch = false;
    }

    // 3. Primary Goal check (only if a goal is specified)
    if (requirement.primary_goal && !tech.goals.includes(requirement.primary_goal)) {
        isMatch = false;
    }

    // 4. Constraints check (must satisfy ALL user constraints)
    if (requirement.constraints && requirement.constraints.length > 0) {
        if (!requirement.constraints.every(c => tech.constraints.includes(c))) {
            isMatch = false;
        }
    }
    
    // 5. Array intersection checks
    if (!doArraysIntersect(requirement.outcome, tech.outcomes) ||
        !doArraysIntersect(requirement.device_type, tech.device_types) ||
        !doArraysIntersect(requirement.output_type, tech.output_types)) {
        isMatch = false;
    }

    // If the technique survived all checks, add it to the recommendations.
    if (isMatch) {
      if (recommendations[tech.stage] && !recommendations[tech.stage].some(t => t.name === tech.name)) {
        recommendations[tech.stage].push({ name: tech.name, slug: tech.slug });
      }
    }
  });

  return recommendations;
}
