
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
 */
const doArraysIntersect = (reqArray: readonly string[] | undefined | null, techArray: readonly string[]): boolean => {
  if (!reqArray || reqArray.length === 0) {
    return true; // If user didn't specify, it's not a disqualifier.
  }
  const lowercasedReqSet = new Set(reqArray.map(item => item.toLowerCase()));
  return techArray.some(item => lowercasedReqSet.has(item.toLowerCase()));
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

  if (!requirement) {
    return recommendations;
  }

  allTechniques.forEach(tech => {
    // HARD FILTERS: These must pass or the technique is disqualified.
    // 1. Project Type must match.
    if (requirement.project_type && !tech.project_types.map(p => p.toLowerCase()).includes(requirement.project_type.toLowerCase())) {
        return; // Disqualify
    }

    // 2. User Base must match.
    const userContext = requirement.existing_users ? "existing" : "new";
    if (!tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
        return; // Disqualify
    }

    // 3. Constraints must be satisfied.
    // If the user has constraints, the technique must be able to meet ALL of them.
    if (requirement.constraints && requirement.constraints.length > 0) {
        const techConstraintsLower = tech.constraints.map(c => c.toLowerCase());
        const userConstraintsLower = requirement.constraints.map(c => c.toLowerCase());
        
        const canMeetConstraints = userConstraintsLower.every(userConstraint =>
            techConstraintsLower.includes(userConstraint)
        );

        if (!canMeetConstraints) {
            return; // Disqualify
        }
    }

    // SOFT FILTERS: At least one item must intersect for each category.
    const goalMatch = doArraysIntersect(requirement.primary_goal ? [requirement.primary_goal] : [], tech.goals);
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);
    const outputTypeMatch = doArraysIntersect(requirement.output_type, tech.output_types);

    // The technique is a match if all "soft" criteria pass.
    if (goalMatch && outcomeMatch && deviceTypeMatch && outputTypeMatch) {
      const stage = tech.stage.charAt(0).toUpperCase() + tech.stage.slice(1).toLowerCase();
      if (recommendations[stage]) {
        recommendations[stage].push({ name: tech.name, slug: tech.slug });
      }
    }
  });

  return recommendations;
}
