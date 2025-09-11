
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
 * @param arr1 - First array (e.g., from user requirements).
 * @param arr2 - Second array (e.g., from technique data).
 * @returns True if they share at least one common element, false otherwise.
 */
const doArraysIntersect = (reqArray: readonly string[] | undefined | null, techArray: readonly string[]): boolean => {
    if (!reqArray || reqArray.length === 0 || !techArray || techArray.length === 0) {
      return false; // If either array is empty or undefined, there's no intersection.
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
    const goalMatch = requirement.primary_goal
      ? tech.goals.includes(requirement.primary_goal)
      : false;

    // 4. Constraint Match: The technique is only compatible if it does NOT have constraints that conflict with the project's reality.
    // For our current model, this means a technique is EXCLUDED if its own constraints list contains something the project DOES NOT have.
    // However, the current `data/uxTechniqueDetails.json` uses constraints to indicate what a technique IS suitable for.
    // E.g., "Tight Deadline" means it's good for that. So we should check if the tech's constraints are a SUBSET of the project's constraints.
    // This logic is complex. The simplest, most effective filter is: If the user has constraints, only show techniques that can handle them.
    const constraintMatch = (() => {
        // If the user has no constraints, all techniques are fine from a constraint perspective.
        if (!requirement.constraints || requirement.constraints.length === 0) {
            return true;
        }
        // If the user HAS constraints, the technique must be able to handle at least one of them.
        // A technique with an empty `constraints` array is assumed to be flexible and not specifically for constrained projects.
        return doArraysIntersect(requirement.constraints, tech.constraints);
    })();

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
