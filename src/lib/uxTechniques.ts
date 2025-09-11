
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
 */
const doArraysIntersect = (arr1: readonly string[] | undefined | null, arr2: readonly string[]): boolean => {
    if (!arr1 || arr1.length === 0) return false;
    return arr1.some(item => arr2.includes(item));
};

/**
 * Retrieves a filtered list of UX techniques based on project requirements.
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
    let isMatch = true;

    // 1. Project Type Match: If specified, it must match.
    if (requirement.project_type) {
        if (!tech.project_types.some(p => p.toLowerCase() === requirement.project_type!.toLowerCase())) {
            isMatch = false;
        }
    }

    // 2. User Base Match: Must match.
    if (isMatch && !tech.user_base.includes(userContext)) {
        isMatch = false;
    }

    // 3. Goal Match: If specified, it must match.
    if (isMatch && requirement.primary_goal) {
        if (!tech.goals.includes(requirement.primary_goal)) {
            isMatch = false;
        }
    }

    // 4. Constraint Match: The technique must support ALL user-selected constraints.
    if (isMatch && requirement.constraints && requirement.constraints.length > 0) {
        if (!requirement.constraints.every(c => tech.constraints.includes(c))) {
            isMatch = false;
        }
    }

    // 5. Outcome Match: Must be an intersection.
    if (isMatch && !doArraysIntersect(requirement.outcome, tech.outcomes)) {
        isMatch = false;
    }

    // 6. Device Type Match: Must be an intersection.
    if (isMatch && !doArraysIntersect(requirement.device_type, tech.device_types)) {
        isMatch = false;
    }
    
    // 7. Output Type Match: Must be an intersection.
    if (isMatch && !doArraysIntersect(requirement.output_type, tech.output_types)) {
        isMatch = false;
    }

    if (isMatch) {
      if (!recommendations[tech.stage].some(t => t.name === tech.name)) {
        recommendations[tech.stage].push({ name: tech.name, slug: tech.slug });
      }
    }
  });

  return recommendations;
}
