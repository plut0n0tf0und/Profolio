
import type { Requirement } from './supabaseClient';
import techniqueDetails from '@/data/uxTechniqueDetails.json';

interface TechniqueDetail {
  name: string;
  slug: string;
  stage: string;
  speed: 'fast' | 'medium' | 'slow';
  focus: 'generative' | 'evaluative';
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
  
  const isLean = requirement.constraints?.some(c => ['tight deadline', 'limited budget'].includes(c.toLowerCase()));
  
  // PASS 1: Hard Filters
  let candidates = allTechniques.filter(tech => {
    // Project Type Filter
    let projectType = requirement.project_type?.toLowerCase();
    if (projectType === "old") projectType = "existing";
    if (!tech.project_types.map(p => p.toLowerCase()).includes(projectType || 'new')) {
      return false;
    }

    // User Base Filter
    let userContext = requirement.existing_users === false ? "new" : "existing";
    if (!tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
      return false;
    }

    return true;
  });

  // PASS 2: Scoring
  let scoredTechniques = candidates.map(tech => {
    let score = 0;
    
    // Goal match is important
    if (requirement.primary_goal && tech.goals.map(g => g.toLowerCase()).includes(requirement.primary_goal.toLowerCase())) {
      score += 3;
    }
    
    // Strategic Persona Scoring (Lean/Agile)
    if (isLean) {
      if (tech.speed === 'fast') score += 5; // Big bonus for fast techniques
      if (tech.speed === 'slow') score -= 3; // Penalty for slow techniques
    } else {
      // If not lean, give a slight preference to more thorough methods
      if (tech.speed === 'slow') score += 1;
    }

    // General attribute matching
    if (doArraysIntersect(requirement.outcome, tech.outcomes)) score++;
    if (doArraysIntersect(requirement.device_type, tech.device_types)) score++;
    if (doArraysIntersect(requirement.output_type, tech.output_types)) score++;

    return { ...tech, score };
  });

  // PASS 3: Rank and Select
  const stages = Object.keys(recommendations);
  
  stages.forEach(stage => {
    const techniquesForStage = scoredTechniques
      .filter(tech => tech.stage.toLowerCase() === stage.toLowerCase())
      .sort((a, b) => b.score - a.score); // Sort by score, descending

    // If lean, take top 1-2. Otherwise, take top 2-3.
    const limit = isLean ? 2 : 3;

    recommendations[stage] = techniquesForStage
      .slice(0, limit)
      .map(tech => ({ name: tech.name, slug: tech.slug }));
  });


  return recommendations;
}
