
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

  const doArraysIntersect = (reqArray: readonly string[] | undefined, techArray: readonly string[]): boolean => {
    if (!reqArray || reqArray.length === 0) return true; // If user didn't specify, it's a match.
    if (techArray.length === 0) return false; // If tech has no values, it can't match.
    return reqArray.some(item => techArray.includes(item));
  };
  
  allTechniques.forEach(tech => {
    // 1. Project Type Match: Must include the selected project_type.
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(p => p.toLowerCase() === requirement.project_type!.toLowerCase())
      : false;

    // 2. User Base Match: Must support new or existing users.
    const userContext = requirement.existing_users ? "existing" : "new";
    const userBaseMatch = tech.user_base.includes(userContext);

    // 3. Goal Match: Must include the primary_goal.
    const goalMatch = requirement.primary_goal
      ? tech.goals.includes(requirement.primary_goal)
      : false;
      
    // 4. Constraint Match: Technique must include ALL constraints from the requirement.
    const constraintMatch = requirement.constraints && requirement.constraints.length > 0
        ? requirement.constraints.every(c => tech.constraints.includes(c))
        : true; // If no constraints are required, it's a match.

    // 5. Outcome Match: Arrays must intersect.
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);

    // 6. Device Type Match: Arrays must intersect.
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);

    // 7. Output Type Match: Arrays must intersect.
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
