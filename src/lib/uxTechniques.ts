
import type { Requirement } from './supabaseClient';
import techniqueDetailsData from '@/data/uxTechniqueDetails.json';

interface TechniqueDetail {
  id: string;
  label: string;
  slug: string; // The slug is the id
  tags: string[];
  estimated_weeks: number;
  cost_level: string;
  outputs: string[];
}

interface Rule {
  id: string;
  description: string;
  priority: number;
  conditions: {
    project_type?: 'new' | 'old';
    existing_users?: boolean;
    constraints?: string[];
    constraints_excludes?: string[];
    deadline_weeks_max?: number;
    deadline_weeks_min?: number;
    output_type_includes?: string[];
    device_type_includes?: string[];
  };
  recommendations?: { technique_id: string; score: number; reason?: string }[];
  adjustments?: {
    tag_boost?: string[];
    tag_penalty?: string[];
    allowed_tags?: string[];
    output_affinity?: string[];
    boost_for_output_tags?: string[];
  };
}

const allTechniques: TechniqueDetail[] = techniqueDetailsData.techniques.map(t => ({...t, slug: t.id}));
const rules: Rule[] = techniqueDetailsData.rules as Rule[];

const ALL_STAGES = ['Discover', 'Define', 'Design', 'Develop', 'Deliver'];
// A loose mapping from technique tag/keyword to 5D stage
const techniqueToStageMapping: { [key: string]: string } = {
    'heuristic-evaluation': 'Define',
    'expert-review': 'Define',
    'guerrilla-testing': 'Design',
    'quick-survey': 'Discover',
    'recruit-survey-research': 'Discover',
    'user-interviews': 'Discover',
    'field-research': 'Discover',
    'card-sorting': 'Define',
    'tree-testing': 'Define',
    'diary-study': 'Discover',
    'competitive-analysis': 'Discover',
    'analytics-review': 'Define',
    'a-b-testing': 'Develop',
    'journey-mapping': 'Define',
    'persona-creation': 'Define',
    'lofi-wireframes': 'Design',
    'rapid-prototyping': 'Design',
    'interactive-prototype-testing': 'Design',
    'hi-fi-prototype': 'Design',
    'design-system': 'Develop',
    'content-strategy': 'Define',
    'storyboards': 'Design',
    'presentation_pack': 'Deliver',
    'video_case': 'Deliver',
    'accessibility-audit': 'Develop',
    'service-blueprint': 'Define',
    'kpi-dashboard': 'Deliver',
    'chatbot-voice-design': 'Design',
};


function parseDeadline(deadline?: string | null): number | null {
    if (!deadline) return null;
    const match = deadline.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

export function getFilteredTechniques(requirement: Requirement): Record<string, { name: string; slug: string }[]> {
    // --- SAFEGUARD ---
    // This is the definitive fix. We ensure that any nullable array from the
    // requirement object is defaulted to an empty array before any logic runs.
    const safeRequirement = {
        ...requirement,
        constraints: requirement.constraints ?? [],
        output_type: requirement.output_type ?? [],
        primary_goal: requirement.primary_goal ?? [],
        outcome: requirement.outcome ?? [],
        device_type: requirement.device_type ?? [],
    };
    // --- END SAFEGUARD ---

    let scores: { [key: string]: number } = {};
    allTechniques.forEach(t => scores[t.id] = 0);
    let allowedTechniques: Set<string> | null = null;
    const deadlineWeeks = parseDeadline(safeRequirement.deadline);

    // Apply rules
    for (const rule of rules) {
        const conditions = rule.conditions;
        let match = true;

        if (conditions.project_type && conditions.project_type !== safeRequirement.project_type) match = false;
        if (conditions.existing_users !== undefined && conditions.existing_users !== safeRequirement.existing_users) match = false;
        if (conditions.constraints && !conditions.constraints.every(c => safeRequirement.constraints.includes(c))) match = false;
        if (conditions.constraints_excludes && conditions.constraints_excludes.some(c => safeRequirement.constraints.includes(c))) match = false;
        if (deadlineWeeks !== null) {
            if (conditions.deadline_weeks_max && deadlineWeeks > conditions.deadline_weeks_max) match = false;
            if (conditions.deadline_weeks_min && deadlineWeeks < conditions.deadline_weeks_min) match = false;
        }
        if (conditions.output_type_includes && !conditions.output_type_includes.some(ot => safeRequirement.output_type.includes(ot))) match = false;
        if (conditions.device_type_includes && !conditions.device_type_includes.some(dt => safeRequirement.device_type.includes(dt))) match = false;
        
        if (match) {
            if (rule.recommendations) {
                rule.recommendations.forEach(rec => {
                    scores[rec.technique_id] = (scores[rec.technique_id] || 0) + rec.score;
                });
            }
            if (rule.adjustments) {
                const { tag_boost, tag_penalty, allowed_tags } = rule.adjustments;
                allTechniques.forEach(tech => {
                    if (tag_boost && tech.tags.some(t => tag_boost.includes(t))) scores[tech.id] += 20;
                    if (tag_penalty && tech.tags.some(t => tag_penalty.includes(t))) scores[tech.id] -= 50;
                });
                if (allowed_tags) {
                    allowedTechniques = new Set();
                    allTechniques.forEach(tech => {
                        if (tech.tags.some(t => allowed_tags.includes(t))) {
                            allowedTechniques!.add(tech.id);
                        }
                    });
                }
            }
        }
    }

    let finalTechniques = allTechniques
        .map(tech => ({ ...tech, score: scores[tech.id] }))
        .filter(tech => tech.score > 0);

    if (allowedTechniques) {
        finalTechniques = finalTechniques.filter(tech => allowedTechniques!.has(tech.id));
    }
    
    finalTechniques.sort((a, b) => b.score - a.score);
    
    const recommendations: Record<string, { name: string; slug: string }[]> = ALL_STAGES.reduce((acc, stage) => {
        acc[stage] = [];
        return acc;
    }, {} as Record<string, { name: string; slug: string }[]>);

    finalTechniques.slice(0, 10).forEach(tech => {
        const stage = techniqueToStageMapping[tech.id] || 'Define'; // Default to Define if no mapping
        if (recommendations[stage] && recommendations[stage].length < 3) {
            recommendations[stage].push({ name: tech.label, slug: tech.slug });
        }
    });

    return recommendations;
}
