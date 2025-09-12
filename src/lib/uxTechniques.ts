
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
    return true; // If user didn't specify, it's not a disqualifier
  }
  if (!techArray || techArray.length === 0) {
    return false; // If user specified but tech has none, it's a mismatch
  }
  const lowercasedReqSet = new Set(reqArray.map(item => item.toLowerCase()));
  const hasIntersection = techArray.some(item => lowercasedReqSet.has(item.toLowerCase()));
  
  console.log(`  - Comparing req [${[...lowercasedReqSet]}] with tech [${techArray.map(t => t.toLowerCase())}]. Result: ${hasIntersection}`);
  
  return hasIntersection;
};

/**
 * Retrieves a filtered list of UX techniques based on project requirements.
 */
export function getFilteredTechniques(requirement: Requirement): Record<string, { name: string; slug: string }[]> {
  console.clear(); // Clear console for fresh debug output
  console.log("--- DEBUG START: getFilteredTechniques ---");
  console.log("Requirement (Input):", JSON.stringify(requirement, null, 2));

  const recommendations: Record<string, { name: string; slug: string }[]> = {
    Discover: [],
    Define: [],
    Design: [],
    Develop: [],
    Deliver: [],
  };

  if (!requirement) {
    console.error("Requirement object is null or undefined. Aborting.");
    return recommendations;
  }

  allTechniques.forEach(tech => {
    console.log(`\n--- Checking Technique: ${tech.name} ---`);
    let isMatch = true;

    // 1. Project Type Match
    const projectTypeMatch = requirement.project_type
      ? tech.project_types.some(p => p.toLowerCase() === requirement.project_type!.toLowerCase())
      : true; // If not specified, don't filter by it
    console.log(`[1. Project Type] User: "${requirement.project_type}", Tech: [${tech.project_types.join(', ')}]. Match: ${projectTypeMatch}`);
    if (!projectTypeMatch) {
        isMatch = false;
    }

    // 2. User Base Match
    const userContext = requirement.existing_users ? "existing" : "new";
    const userBaseMatch = tech.user_base.includes(userContext);
    console.log(`[2. User Base] User requires: "${userContext}", Tech supports: [${tech.user_base.join(', ')}]. Match: ${userBaseMatch}`);
    if (isMatch && !userBaseMatch) {
      isMatch = false;
    }

    // 3. Goal Match
    const goalMatch = requirement.primary_goal
      ? tech.goals.some(g => g.toLowerCase() === requirement.primary_goal!.toLowerCase())
      : true; // If no goal is set, don't filter by it
    console.log(`[3. Primary Goal] User: "${requirement.primary_goal}", Tech: [${tech.goals.join(', ')}]. Match: ${goalMatch}`);
    if (isMatch && !goalMatch) {
      isMatch = false;
    }

    // 4. Constraints Match
    const lowercasedTechConstraints = tech.constraints.map(c => c.toLowerCase());
    const constraintMatch = requirement.constraints && requirement.constraints.length > 0
      ? requirement.constraints.every(c => lowercasedTechConstraints.includes(c.toLowerCase()))
      : true;
    console.log(`[4. Constraints] User: [${requirement.constraints?.join(', ')}], Tech: [${tech.constraints.join(', ')}]. Match: ${constraintMatch}`);
    if (isMatch && !constraintMatch) {
      isMatch = false;
    }

    // 5. Outcome Match
    console.log(`[5. Outcome] Checking...`);
    const outcomeMatch = doArraysIntersect(requirement.outcome, tech.outcomes);
    if (isMatch && !outcomeMatch) {
        isMatch = false;
    }

    // 6. Device Type Match
    console.log(`[6. Device Type] Checking...`);
    const deviceTypeMatch = doArraysIntersect(requirement.device_type, tech.device_types);
    if (isMatch && !deviceTypeMatch) {
        isMatch = false;
    }

    // 7. Output Type Match
    console.log(`[7. Output Type] Checking...`);
    const outputTypeMatch = doArraysIntersect(requirement.output_type, tech.output_types);
    if (isMatch && !outputTypeMatch) {
        isMatch = false;
    }

    // Final Decision
    console.log(`FINAL DECISION for ${tech.name}: ${isMatch ? 'INCLUDE' : 'DISCARD'}`);
    if (isMatch) {
      const stage = tech.stage.charAt(0).toUpperCase() + tech.stage.slice(1).toLowerCase();
      if (recommendations[stage]) {
        recommendations[stage].push({ name: tech.name, slug: tech.slug });
      }
    }
  });

  console.log("\n--- DEBUG END: Final Recommendations ---", JSON.stringify(recommendations, null, 2));
  return recommendations;
}
