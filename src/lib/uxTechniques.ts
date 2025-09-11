
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

  const doArraysIntersect = (reqArray: readonly string[] | undefined | null, techArray: readonly string[]): boolean => {
    if (!reqArray || reqArray.length === 0) return true; // If user didn't specify, it's a match.
    if (!techArray || techArray.length === 0) return false; // If tech has no values for this, it can't match.
    return reqArray.some(item => techArray.includes(item));
  };
  
  allTechniques.forEach(tech => {
    // 1. Project Type Match
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(p => p.toLowerCase() === requirement.project_type!.toLowerCase())
      : false;

    // 2. User Base Match
    const userContext = requirement.existing_users ? "existing" : "new";
    const userBaseMatch = tech.user_base.includes(userContext);

    // 3. Goal Match
    const goalMatch = requirement.primary_goal
      ? tech.goals.includes(requirement.primary_goal)
      : false;
      
    // 4. Constraint Compatibility Check
    // A technique is compatible if it does NOT have a constraint that the user's project also has.
    // Example: If tech has "Tight Deadline" constraint, it's only suitable for projects WITHOUT that constraint.
    // So, if the user's project has a "Tight Deadline", this technique should be excluded.
    const hasConflictingConstraint = tech.constraints.some(techConstraint => 
        requirement.constraints?.includes(techConstraint)
    );

    // 5. Outcome Match
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);

    // 6. Device Type Match
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);

    // 7. Output Type Match
    const outputTypeMatch = doArraysIntersect(requirement.output_type, tech.output_types);

    if (
      projectTypeMatch &&
      userBaseMatch &&
      goalMatch &&
      !hasConflictingConstraint && // The logic is now correctly inverted.
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
