
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
 * If the requirement array is empty or null, it returns true to avoid penalizing techniques.
 */
const doArraysIntersect = (reqArray: readonly string[] | undefined | null, techArray: readonly string[]): boolean => {
  if (!reqArray || reqArray.length === 0) return true;
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
  const hasSelectedOutputs = requirement.output_type && requirement.output_type.length > 0;
  
  // PASS 1: Scoring - score all techniques.
  let scoredTechniques = allTechniques.map(tech => {
    let score = 0;
    
    // Most important: does it produce the desired output? (Huge bonus)
    if (hasSelectedOutputs && doArraysIntersect(requirement.output_type, tech.output_types)) {
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
    
    // Project Type and User Base are now soft-scored instead of hard-filtered
    const projectType = requirement.project_type?.toLowerCase();
    const techProjectTypes = tech.project_types.map(p => p.toLowerCase());
    if (projectType && techProjectTypes.includes(projectType)) {
        score++;
    }

    const userContext = requirement.existing_users === false ? 'no users' : 'existing';
    if (tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
      score++;
    }

    return { ...tech, score };
  });

  // PASS 2: Rank and Select for each stage
  const stages = Object.keys(recommendations);
  
  stages.forEach(stage => {
    const techniquesForStage = scoredTechniques
      .filter(tech => tech.stage.toLowerCase() === stage.toLowerCase())
      .sort((a, b) => b.score - a.score); // Sort by score, descending

    const limit = isLean ? 3 : 5;
    const minScore = isLean ? 2 : 1;
    
    let finalTechniques = techniquesForStage
      .filter(tech => tech.score >= minScore)
      .slice(0, limit);

    // GUARANTEE Pass: If no techniques were found but some exist for the stage, add the top one.
    if (finalTechniques.length === 0 && techniquesForStage.length > 0) {
        finalTechniques = techniquesForStage.slice(0, 1);
    }
      
    recommendations[stage] = finalTechniques.map(tech => ({ name: tech.name, slug: tech.slug }));
  });


  return recommendations;
}

    