
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
 * @param reqArray - The user's selections.
 * @param techArray - The technique's supported options.
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

  if (!requirement) return recommendations;
  
  const userContext = requirement.existing_users ? "existing" : "new";

  allTechniques.forEach(tech => {
    
    // Rule 1: Project Type Match
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(p => p.toLowerCase() === requirement.project_type!.toLowerCase())
      : false;

    // Rule 2: User Base Match
    const userBaseMatch = tech.user_base.includes(userContext);

    // Rule 3: Goal Match
    const goalMatch = requirement.primary_goal
      ? tech.goals.includes(requirement.primary_goal)
      : false;

    // Rule 4: Constraint Match - Technique must satisfy ALL project constraints.
    const constraintMatch = requirement.constraints && requirement.constraints.length > 0
      ? requirement.constraints.every(c => tech.constraints.includes(c))
      : true; // If user has no constraints, this check passes.

    // Rule 5: Outcome Match (Intersection)
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);

    // Rule 6: Device Type Match (Intersection)
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);

    // Rule 7: Output Type Match (Intersection)
    const outputTypeMatch = doArraysIntersect(requirement.output_type, tech.output_types);

    if (
      projectTypeMatch &&
      userBaseMatch &&
      goalMatch &&
      constraintMatch &&
      outcomeMatch &&
      deviceTypeMatch &&
      outputTypeMatch
    ) {
      if (!recommendations[tech.stage].some(t => t.name === tech.name)) {
        recommendations[tech.stage].push({ name: tech.name, slug: tech.slug });
      }
    }
  });

  return recommendations;
}
