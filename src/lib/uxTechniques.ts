
import type { Requirement } from './supabaseClient';
import techniqueDetails from '@/data/uxTechniqueDetails.json';

interface TechniqueDetail {
  name: string;
  slug: string;
  stage: string;
  outcomes: string[];
  output_types: string[];
  device_types: string[];
  project_types: string[];
  user_base: string[];
  goals: string[];
  constraints: string[];
}

const allTechniques: TechniqueDetail[] = techniqueDetails as TechniqueDetail[];

/**
 * Checks for a non-empty intersection between two string arrays, ignoring case.
 * @param reqArray - First array (e.g., from user requirements).
 * @param techArray - Second array (e.g., from technique data).
 * @returns True if they share at least one common element, false otherwise.
 */
const doArraysIntersect = (reqArray: readonly string[] | undefined | null, techArray: readonly string[]): boolean => {
    if (!reqArray || reqArray.length === 0) {
      // If the user has no requirements for this category, it's not a deal-breaker.
      // The logic in the main function handles if an intersection is truly required.
      // This helper just checks for intersection if both arrays are valid.
      return true;
    }
    const lowercasedReqArray = new Set(reqArray.map(item => item.toLowerCase()));
    return techArray.some(item => lowercasedReqArray.has(item.toLowerCase()));
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
    let isMatch = true;

    // 1. Project Type Match (case-insensitive)
    if (requirement.project_type) {
        if (!tech.project_types.some(p => p.toLowerCase() === requirement.project_type!.toLowerCase())) {
            isMatch = false;
        }
    }

    // 2. User Base Match
    if (isMatch && !tech.user_base.includes(userContext)) {
      isMatch = false;
    }

    // 3. Primary Goal Match (case-insensitive)
    if (isMatch && requirement.primary_goal) {
      if (!tech.goals.some(g => g.toLowerCase() === requirement.primary_goal!.toLowerCase())) {
        isMatch = false;
      }
    }
    
    // 4. Constraints Match (case-insensitive): Technique must have all constraints user specified.
    if (isMatch && requirement.constraints && requirement.constraints.length > 0) {
        const lowercasedTechConstraints = new Set(tech.constraints.map(c => c.toLowerCase()));
        if (!requirement.constraints.every(c => lowercasedTechConstraints.has(c.toLowerCase()))) {
            isMatch = false;
        }
    }
    
    // 5. Array intersection checks (all case-insensitive)
    if (isMatch && requirement.outcome && requirement.outcome.length > 0 && !doArraysIntersect(requirement.outcome, tech.outcomes)) {
      isMatch = false;
    }
    if (isMatch && requirement.device_type && requirement.device_type.length > 0 && !doArraysIntersect(requirement.device_type, tech.device_types)) {
      isMatch = false;
    }
    if (isMatch && requirement.output_type && requirement.output_type.length > 0 && !doArraysIntersect(requirement.output_type, tech.output_types)) {
      isMatch = false;
    }

    // If the technique survived all checks, add it to the recommendations.
    if (isMatch) {
      const stage = tech.stage.charAt(0).toUpperCase() + tech.stage.slice(1).toLowerCase();
      if (recommendations[stage] && !recommendations[stage].some(t => t.name === tech.name)) {
        recommendations[stage].push({ name: tech.name, slug: tech.slug });
      }
    }
  });

  return recommendations;
}
