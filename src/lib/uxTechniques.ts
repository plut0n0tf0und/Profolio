
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
    let isMatch = true;

    // Hard Filter 1: Project Type must match.
    if (requirement.project_type) {
      if (!tech.project_types.map(p => p.toLowerCase()).includes(requirement.project_type.toLowerCase())) {
        isMatch = false;
      }
    }

    // Hard Filter 2: User Base must match.
    const userContext = requirement.existing_users ? "existing" : "new";
    if (!tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
      isMatch = false;
    }
    
    // Hard Filter 3: Constraints must be satisfied.
    // If the user has constraints, the technique must be able to meet all of them.
    if (requirement.constraints && requirement.constraints.length > 0) {
      const lowercasedTechConstraints = tech.constraints.map(c => c.toLowerCase());
      const lowercasedUserConstraints = requirement.constraints.map(c => c.toLowerCase());
      
      const canMeetConstraints = lowercasedUserConstraints.every(userConstraint => 
          lowercasedTechConstraints.includes(userConstraint)
      );

      if (!canMeetConstraints) {
          isMatch = false;
      }
    }
    
    // Soft Filters: Check for at least one intersection in these categories.
    // If ANY of these don't match, we disqualify. This is the correct AND logic.
    if (isMatch && !doArraysIntersect(requirement.primary_goal ? [requirement.primary_goal] : [], tech.goals)) {
        isMatch = false;
    }
    if (isMatch && !doArraysIntersect(requirement.outcome, tech.outcomes)) {
        isMatch = false;
    }
    if (isMatch && !doArraysIntersect(requirement.device_type, tech.device_types)) {
        isMatch = false;
    }
    if (isMatch && !doArraysIntersect(requirement.output_type, tech.output_types)) {
        isMatch = false;
    }

    // Final Decision
    if (isMatch) {
      const stage = tech.stage.charAt(0).toUpperCase() + tech.stage.slice(1).toLowerCase();
      if (recommendations[stage]) {
        recommendations[stage].push({ name: tech.name, slug: tech.slug });
      }
    }
  });

  return recommendations;
}
