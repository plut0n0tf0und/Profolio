
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

  const doArraysIntersect = (arr1: string[] | null | undefined, arr2: string[] | null | undefined): boolean => {
    if (!arr1 || arr1.length === 0) return true; // If no requirement, don't filter on this criteria
    if (!arr2 || arr2.length === 0) return false; // If technique has no values, it can't match a requirement
    return arr1.some(item1 => arr2.includes(item1));
  };
  
  const doesArrayContain = (value: string | null | undefined, arr: string[] | null | undefined): boolean => {
      if (!value) return true; // If no requirement, don't filter
      if (!arr || arr.length === 0) return false; // If technique has no values, it can't match
      return arr.includes(value);
  }

  allTechniques.forEach(tech => {
    // 1. Project Type Match
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(pType => pType.toLowerCase() === requirement.project_type!.toLowerCase())
      : true;

    // 2. User Base Match
    const userContext = requirement.existing_users ? "existing" : "new";
    const userBaseMatch = tech.user_base.includes(userContext);

    // 3. Goal Match
    const goalMatch = doesArrayContain(requirement.primary_goal, tech.goals);

    // 4. Constraint Match (a technique is a mismatch if it has a constraint the project also has)
    const constraintMismatch = doArraysIntersect(requirement.constraints, tech.constraints);

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
