
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
  if (!reqArray || reqArray.length === 0) return false;
  if (!techArray || techArray.length === 0) return false;

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
  
  const isLean = requirement.constraints?.some(c => ['tight deadline', 'limited budget', 'tight budget'].includes(c.toLowerCase()));
  
  // PASS 1: Hard Filters
  let candidates = allTechniques.filter(tech => {
    // Project Type Filter
    const projectType = requirement.project_type?.toLowerCase() === 'old' ? 'existing' : requirement.project_type?.toLowerCase();
    if (!tech.project_types.map(p => p.toLowerCase()).includes(projectType || 'new')) {
      return false;
    }

    // User Base Filter
    const userContext = requirement.existing_users === false ? 'no users' : 'existing';
    if (!tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
      return false;
    }

    // If lean, apply a hard filter for speed. Only fast techniques are allowed.
    if (isLean && tech.speed !== 'fast') {
      return false;
    }

    return true;
  });

  // PASS 2: Scoring
  let scoredTechniques = candidates.map(tech => {
    let score = 0;
    
    // Most important: does it produce the desired output? (Huge bonus)
    if (doArraysIntersect(requirement.output_type, tech.output_types)) {
      score += 10;
    }
    
    // Second most important: does it align with the primary goal? (Strong bonus)
    if (requirement.primary_goal && tech.goals.map(g => g.toLowerCase()).includes(requirement.primary_goal.toLowerCase())) {
      score += 5;
    }

    // Lean projects prefer evaluative techniques over generative ones.
    if (isLean && tech.focus === 'evaluative') {
      score += 3;
    }

    // General attribute matching (minor bonus)
    if (doArraysIntersect(requirement.outcome, tech.outcomes)) score++;
    if (doArraysIntersect(requirement.device_type, tech.device_types)) score++;

    return { ...tech, score };
  });

  // PASS 3: Rank and Select
  const stages = Object.keys(recommendations);
  
  stages.forEach(stage => {
    const techniquesForStage = scoredTechniques
      .filter(tech => tech.stage.toLowerCase() === stage.toLowerCase())
      .sort((a, b) => b.score - a.score); // Sort by score, descending

    // If lean, be very selective. Otherwise, be a bit more generous.
    const limit = isLean ? 2 : 3;
    const minScore = isLean ? 5 : 1;

    recommendations[stage] = techniquesForStage
      .filter(tech => tech.score >= minScore) // Filter out low-scoring techniques
      .slice(0, limit)
      .map(tech => ({ name: tech.name, slug: tech.slug }));
  });


  return recommendations;
}
