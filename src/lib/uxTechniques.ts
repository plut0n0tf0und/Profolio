
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
      return false;
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
    
    // 1. Project Type Match: Must match if a project type is selected.
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(p => p.toLowerCase() === requirement.project_type!.toLowerCase())
      : false;

    // 2. User Base Match: Must match the user context ('new' or 'existing').
    const userBaseMatch = tech.user_base.includes(userContext);

    // 3. Goal Match: Must match if a primary goal is selected.
    const goalMatch = requirement.primary_goal && typeof requirement.primary_goal === 'string'
      ? tech.goals.includes(requirement.primary_goal)
      : false;

    // 4. Constraint Match: The technique must satisfy ALL of the project's constraints.
    // A technique is a match if its constraints array contains every constraint the user has specified.
    const constraintMatch = requirement.constraints && requirement.constraints.length > 0
      ? requirement.constraints.every(c => tech.constraints.includes(c))
      : true;

    // 5. Outcome Match: There must be an intersection.
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);

    // 6. Device Type Match: There must be an intersection.
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);

    // 7. Output Type Match: There must be an intersection.
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
