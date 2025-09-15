
import type { Requirement } from './supabaseClient';
import techniqueDetailsData from '@/data/uxTechniqueDetails.json';

interface TechniqueDetail {
  id: string;
  name: string;
  slug: string;
  stage: string;
  speed: 'fast' | 'medium' | 'slow';
  focus: 'generative' | 'evaluative' | 'mixed';
  outcomes: string[];
  output_types: string[];
  device_types: string[];
  project_types: string[];
  user_base: string[];
  goals: string[];
  constraints: string[];
  // The JSON now contains scoring_rules, which we can add to the type for future use,
  // but it's not strictly necessary for the current function.
  scoring_rules?: any;
}

const allTechniques: TechniqueDetail[] = techniqueDetailsData.techniques as unknown as TechniqueDetail[];


/**
 * Checks for a non-empty intersection between two string arrays, ignoring case.
 */
const doArraysIntersect = (reqArray: readonly string[] | undefined | null, techArray: readonly string[]): boolean => {
  // Safeguard: Ensure reqArray is an array before processing.
  if (!Array.isArray(reqArray) || reqArray.length === 0) return false;
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

  if (!requirement) return recommendations;

  // Safeguard: Default potentially null/undefined arrays to empty arrays.
  const safeConstraints = requirement.constraints ?? [];

  // Detect lean mode (tight budget or deadline)
  const isLean = safeConstraints.some(c =>
    ['tight deadline', 'limited budget', 'tight budget'].includes(c.toLowerCase())
  );

  // Deadline parsing (only applies if tight deadline is selected)
  let deadlineSpeed: 'fast' | 'medium' | 'slow' | null = null;
  if (requirement.deadline) {
    const deadlineStr = requirement.deadline.toLowerCase();
    if (deadlineStr.includes('1') || deadlineStr.includes('2')) {
      deadlineSpeed = 'fast';
    } else if (deadlineStr.includes('3') || deadlineStr.includes('4')) {
      deadlineSpeed = 'medium';
    } else if (deadlineStr.includes('week') || deadlineStr.includes('month') || deadlineStr.includes('custom')) {
      deadlineSpeed = 'slow';
    }
  }

  // PASS 1: Hard Filters
  let candidates = allTechniques.filter(tech => {
    // Project Type Filter
    const projectType = requirement.project_type?.toLowerCase() === 'old'
      ? 'existing'
      : requirement.project_type?.toLowerCase();
    if (projectType && !tech.project_types.map(p => p.toLowerCase()).includes(projectType)) {
      return false;
    }

    // User Base Filter
    const userContext = requirement.existing_users === false ? 'no users' : 'existing';
    if (!tech.user_base.map(ub => ub.toLowerCase()).includes(userContext)) {
      return false;
    }

    // Deadline / Lean filtering
    if (deadlineSpeed && tech.speed !== deadlineSpeed) {
      return false;
    }
    if (isLean && tech.speed === 'slow') {
      return false;
    }

    return true;
  });

  // PASS 2: Scoring
  let scoredTechniques = candidates.map(tech => {
    let score = 0;

    // Safeguard: Ensure requirement arrays are valid before use.
    const safeOutputTypes = requirement.output_type ?? [];
    const safePrimaryGoals = requirement.primary_goal ?? [];
    const safeOutcomes = requirement.outcome ?? [];
    const safeDeviceTypes = requirement.device_type ?? [];

    // Huge bonus for matching output types
    if (doArraysIntersect(safeOutputTypes, tech.output_types)) score += 10;

    // Strong bonus for aligning with primary goals
    if (doArraysIntersect(safePrimaryGoals, tech.goals)) score += 5;

    // Deadline-aware scoring
    if (deadlineSpeed && tech.speed === deadlineSpeed) score += 3;

    // Lean preference for evaluative
    if (isLean && tech.focus === 'evaluative') score += 2;

    // Minor bonuses for outcomes and device type
    if (doArraysIntersect(safeOutcomes, tech.outcomes)) score++;
    if (doArraysIntersect(safeDeviceTypes, tech.device_types)) score++;

    return { ...tech, score };
  });

  // PASS 3: Rank & Select
  const stages = Object.keys(recommendations);

  stages.forEach(stage => {
    const techniquesForStage = scoredTechniques
      .filter(tech => tech.stage.toLowerCase() === stage.toLowerCase())
      .sort((a, b) => b.score - a.score);

    // Selection rules
    const limit = isLean ? 2 : 3;
    const minScore = isLean ? 5 : 1;
    let finalTechniques = techniquesForStage
      .filter(tech => tech.score >= minScore)
      .slice(0, limit);

    // Fallbacks
    if (finalTechniques.length === 0 && techniquesForStage.length > 0) {
      finalTechniques = techniquesForStage.slice(0, 1);
    }

    recommendations[stage] = finalTechniques.map(tech => ({
      name: tech.name,
      slug: tech.slug,
    }));
  });

  return recommendations;
}
