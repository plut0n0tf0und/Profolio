
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
export function getFilteredTechniques(requirement: Requirement): Record<string, {name: string, slug: string}[]> {
  const recommendations: Record<string, {name: string, slug: string}[]> = {
    Discover: [],
    Define: [],
    Design: [],
    Develop: [],
    Deliver: [],
  };

  if (!requirement) return recommendations;

  const doArraysIntersect = (reqArray: string[] | null | undefined, techArray: string[] | null | undefined): boolean => {
    // If the user didn't specify any requirements for this category, we don't filter by it.
    if (!reqArray || reqArray.length === 0) return true;
    // If the technique doesn't apply to any items in this category, it can't be a match.
    if (!techArray || techArray.length === 0) return false;
    // Return true only if there is at least one common item between the two arrays.
    return reqArray.some(item => techArray.includes(item));
  };
  
  allTechniques.forEach(tech => {
    // 1. Project Type Match: Check if the technique is suitable for a "New" or "Existing" project.
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(pType => pType.toLowerCase() === requirement.project_type!.toLowerCase())
      : true;

    // 2. User Base Match: Check if the technique is suitable for projects with or without existing users.
    const userContext = requirement.existing_users ? "existing" : "new";
    const userBaseMatch = tech.user_base.includes(userContext);

    // 3. Goal Match: Check if the technique aligns with the project's primary goal.
    const goalMatch = requirement.primary_goal 
        ? tech.goals.includes(requirement.primary_goal) 
        : true;

    // 4. Constraint Mismatch: A technique is EXCLUDED if it's not good for a constraint the project has.
    // For example, if project has 'Tight Deadline', we exclude techniques that are NOT listed under 'Tight Deadline'.
    const constraintMismatch = requirement.constraints?.some(constraint => 
        !tech.constraints.includes(constraint) && tech.constraints.length > 0
    ) ?? false;

    // 5. Outcome Match: Check for intersection between desired outcomes and technique outcomes.
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);
    
    // 6. Device Type Match: Check for intersection.
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);

    // 7. Output Type Match: Check for intersection.
    const outputTypeMatch = doArraysIntersect(requirement.output_type, tech.output_types);

    if (
      projectTypeMatch &&
      userBaseMatch &&
      goalMatch &&
      !constraintMismatch &&
      outcomeMatch &&
      deviceTypeMatch &&
      outputTypeMatch
    ) {
      if (recommendations[tech.stage] && !recommendations[tech.stage].find(t => t.name === tech.name)) {
        recommendations[tech.stage].push({ name: tech.name, slug: tech.slug });
      }
    }
  });

  return recommendations;
}
