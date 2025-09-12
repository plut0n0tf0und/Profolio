
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

    // NORMALIZE project_type
    let projectType = requirement.project_type?.toLowerCase();
    if (projectType === "old") projectType = "existing"; // map old → existing

    // HARD FILTER: Project Type
    if (projectType && !tech.project_types.map(p => p.toLowerCase()).includes(projectType)) {
      return { ...tech, score: -1 };
    }

    // NORMALIZE user_base
    let userContext: string;
    if (requirement.existing_users === false) {
      userContext = "new"; // treat "no users" as new
    } else if (requirement.existing_users === true) {
      userContext = "existing";
    } else {
      userContext = "new"; // default
    }

    // HARD FILTER: User Base
    if (!tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
      return { ...tech, score: -1 };
    }

    // SOFT FILTERS
    if (requirement.primary_goal && tech.goals.map(g => g.toLowerCase()).includes(requirement.primary_goal.toLowerCase())) {
      score++;
    }
    if (doArraysIntersect(requirement.outcome, tech.outcomes)) {
      score++;
    }
    if (doArraysIntersect(requirement.device_type, tech.device_types)) {
      score++;
    }
    if (doArraysIntersect(requirement.output_type, tech.output_types)) {
      score++;
    }

    // Constraints scoring
    const userConstraints = requirement.constraints?.map(c => c.toLowerCase()) || [];
    const techConstraints = tech.constraints.map(c => c.toLowerCase());
    if (userConstraints.length > 0) {
      if (userConstraints.some(uc => techConstraints.includes(uc))) {
        score++;
      }
    } else {
      score++;
    }

    return { ...tech, score };
  });

  const validTechniques = scoredTechniques.filter(tech => tech.score >= 0);
  const maxScore = Math.max(...validTechniques.map(t => t.score), 0);
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
