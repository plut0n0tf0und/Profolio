
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
  
  const isLean = requirement.constraints?.some(c => ['tight deadline', 'limited budget'].includes(c.toLowerCase()));
  
  // PASS 1: Scoring - score all techniques first, then filter.
  let scoredTechniques = allTechniques.map(tech => {
    let score = 0;
    
    // Most important: does it produce the desired output? (Huge bonus)
    if (doArraysIntersect(requirement.output_type, tech.output_types)) {
      score += 10;
    }
    
    // Second most important: does it align with the primary goal? (Strong bonus)
    if (doArraysIntersect(requirement.primary_goal, tech.goals)) {
      score += 5;
    }

    // Lean projects prefer evaluative techniques over generative ones.
    if (isLean && tech.focus === 'evaluative') {
      score += 3;
    }
    
    // Lean projects prefer fast techniques
    if(isLean && tech.speed === 'fast') {
      score += 2;
    }

    // General attribute matching (minor bonus)
    if (doArraysIntersect(requirement.outcome, tech.outcomes)) score++;
    if (doArraysIntersect(requirement.device_type, tech.device_types)) score++;

    return { ...tech, score };
  });

  // PASS 2: Hard Filters
  let candidates = scoredTechniques.filter(tech => {
    // Project Type Filter
    const projectType = requirement.project_type?.toLowerCase();
    const techProjectTypes = tech.project_types.map(p => p.toLowerCase());
    if (projectType) {
        if (projectType === 'existing' && !techProjectTypes.includes('old')) return false;
        if (projectType === 'new' && !techProjectTypes.includes('new')) return false;
    }

    // User Base Filter
    const userContext = requirement.existing_users === false ? 'no users' : 'existing';
    if (!tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
      return false;
    }

    return true;
  });


  // PASS 3: Rank and Select for each stage
  const stages = Object.keys(recommendations);
  
  stages.forEach(stage => {
    const techniquesForStage = candidates
      .filter(tech => tech.stage.toLowerCase() === stage.toLowerCase())
      .sort((a, b) => b.score - a.score); // Sort by score, descending

    // If lean, be very selective. Otherwise, be a bit more generous.
    const limit = isLean ? 2 : 4;
    
    // Start with a base minimum score, but be more lenient if the desired output is a match
    const baseMinScore = isLean ? 5 : 1;
    let finalTechniques = techniquesForStage
      .filter(tech => {
        // If it's a direct match for a desired output type, its score is high enough.
        if (doArraysIntersect(requirement.output_type, tech.output_types)) {
          return true;
        }
        // Otherwise, it must meet the base minimum score
        return tech.score >= baseMinScore;
      })
      .slice(0, limit);

    // GUARANTEE Pass: If no techniques were found, fall back to less strict criteria
    if (finalTechniques.length === 0 && techniquesForStage.length > 0) {
        // Just take the top N scored techniques for this stage, ignoring minimum score.
        finalTechniques = techniquesForStage.slice(0, limit);
    }
      
    recommendations[stage] = finalTechniques.map(tech => ({ name: tech.name, slug: tech.slug }));
  });


  return recommendations;
}
