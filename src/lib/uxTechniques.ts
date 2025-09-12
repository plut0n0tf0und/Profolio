
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
  if (!reqArray || reqArray.length === 0) return true; // No requirement, no filter.
  if (!techArray || techArray.length === 0) return false; // Requirement, but tech has no offerings.

  const lowercasedReqSet = new Set(reqArray.map(item => item.toLowerCase()));
  return techArray.some(item => lowercasedReqSet.has(item.toLowerCase()));
};

/**
 * Retrieves a filtered and scored list of UX techniques based on project requirements.
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
  
  const scoredTechniques = allTechniques.map(tech => {
    let score = 0;

    // HARD FILTERS: If these don't match, the technique is disqualified (score of -1).
    // 1. Project Type must match.
    const lowercasedProjectType = requirement.project_type?.toLowerCase();
    if (lowercasedProjectType && !tech.project_types.map(p => p.toLowerCase()).includes(lowercasedProjectType)) {
        return { ...tech, score: -1 };
    }

    // 2. User Base must match.
    const userContext = requirement.existing_users ? "existing" : "new";
    if (!tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
        return { ...tech, score: -1 };
    }

    // SOFT FILTERS: Award points for matches.
    // 1. Primary Goal
    if (requirement.primary_goal && tech.goals.map(g => g.toLowerCase()).includes(requirement.primary_goal.toLowerCase())) {
        score++;
    }
    // 2. Outcome
    if (doArraysIntersect(requirement.outcome, tech.outcomes)) {
        score++;
    }
    // 3. Device Type
    if (doArraysIntersect(requirement.device_type, tech.device_types)) {
        score++;
    }
    // 4. Output Type
    if (doArraysIntersect(requirement.output_type, tech.output_types)) {
        score++;
    }
    
    // 5. Constraints
    const userConstraints = requirement.constraints?.map(c => c.toLowerCase()) || [];
    const techConstraints = tech.constraints.map(c => c.toLowerCase());
    if (userConstraints.length > 0) {
      if (userConstraints.every(uc => techConstraints.includes(uc))) {
        score++;
      } else {
        // This is a penalty, but not a hard disqualification unless it's a critical mismatch.
        // For now, we just don't award a point.
      }
    } else {
      // If user has no constraints, it's a neutral match.
      score++;
    }

    return { ...tech, score };
  });

  const validTechniques = scoredTechniques.filter(tech => tech.score >= 0);
  const maxScore = Math.max(...validTechniques.map(t => t.score), 0);
  
  // We'll consider any technique that has a score of at least 50% of the max score.
  // This avoids showing totally irrelevant results, while still being flexible.
  // The threshold can be adjusted.
  const scoreThreshold = Math.ceil(maxScore * 0.5);

  const finalTechniques = validTechniques.filter(tech => tech.score >= scoreThreshold);

  finalTechniques.forEach(tech => {
    const stage = tech.stage.charAt(0).toUpperCase() + tech.stage.slice(1).toLowerCase();
    if (recommendations[stage]) {
      recommendations[stage].push({ name: tech.name, slug: tech.slug });
    }
  });

  return recommendations;
}
