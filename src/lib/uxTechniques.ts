
import type { Requirement } from './supabaseClient';
import techniqueDetails from '@/data/uxTechniqueDetails.json';

interface TechniqueDetail {
  name: string;
  stage: string;
  outcomes: string[];
  output_types: string[];
  device_types: string[];
  project_types: string[];
}

const allTechniques: TechniqueDetail[] = techniqueDetails;

/**
 * Retrieves a filtered list of UX techniques based on a scoring system
 * derived from the project requirements.
 * @param requirement - The user's selections for the project.
 * @returns An object where keys are 5D stages and values are arrays of recommended technique names.
 */
export function getFilteredTechniques(requirement: Requirement): Record<string, string[]> {
  const recommendations: Record<string, string[]> = {
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
    let score = 0;

    // Score based on outcome match
    if (requirement.outcome && requirement.outcome.length > 0) {
      if (requirement.outcome.some(item => tech.outcomes.includes(item))) {
        score++;
      }
    }

    // Score based on output type match
    if (requirement.output_type && requirement.output_type.length > 0) {
      if (requirement.output_type.some(item => tech.output_types.includes(item))) {
        score++;
      }
    }
    
    // Score based on device type match
    if (requirement.device_type && requirement.device_type.length > 0) {
        if (requirement.device_type.some(item => tech.device_types.includes(item))) {
            score++;
        }
    }

    // Score based on project type match
    if (requirement.project_type) {
      if (tech.project_types.some(pType => pType.toLowerCase() === requirement.project_type!.toLowerCase())) {
        score++;
      }
    }

    // If the score is greater than 0, the technique is relevant.
    if (score > 0 && recommendations[tech.stage]) {
      // Avoid adding duplicates
      if (!recommendations[tech.stage].includes(tech.name)) {
        recommendations[tech.stage].push(tech.name);
      }
    }
  });
  
  // A fallback for when no specific filters lead to recommendations
  // If a stage has no recommendations, it might be better to show a few core techniques
  // For now, we'll return potentially empty stages as the scoring handles relevance.

  return recommendations;
}
