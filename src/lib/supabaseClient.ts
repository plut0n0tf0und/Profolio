
import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestError, User } from '@supabase/supabase-js';
import * as z from 'zod';
import { generateUUID } from './utils';

/*
================================================================================
REQUIRED RLS POLICIES FOR SUPABASE
Run these in the Supabase SQL Editor to fix data access issues.
================================s================================================
*/

/*
-- 1. Policies for `requirements` table
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own requirements" ON public.requirements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own requirements" ON public.requirements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own requirements" ON public.requirements FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own requirements" ON public.requirements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. Policies for `saved_results` table
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own projects" ON public.saved_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own projects" ON public.saved_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own projects" ON public.saved_results FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own projects" ON public.saved_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. Policies for `remixed_techniques` table
ALTER TABLE public.remixed_techniques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own remixed techniques" ON public.remixed_techniques FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
*/


// Zod schema for validation, matches the 'requirements' table and 'saved_results' table structure.
const RequirementSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().optional(),
  user_id: z.string().uuid().optional(),
  project_name: z.string().min(1, 'Project name is required.'),
  date: z.union([z.date(), z.string()]).optional(),
  problem_statement: z.string().optional(),
  role: z.string().optional(),
  output_type: z.array(z.string()).optional(),
  outcome: z.array(z.string()).optional(),
  device_type: z.array(z.string()).optional(),
  project_type: z.enum(['new', 'old']).optional(),
  // Fields specific to saved_results
  requirement_id: z.string().optional(),
  stage_techniques: z.any().optional(),
});

export type Requirement = z.infer<typeof RequirementSchema>;

// Schema for the remixed technique form data
const TechniqueRemixSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    project_id: z.string().uuid().nullable().optional(),
    created_at: z.string().optional(),
    technique_name: z.string(),
    date: z.string().optional(),
    duration: z.string().optional(),
    teamSize: z.string().optional(),
    why: z.string().optional(),
    overview: z.string().optional(),
    problemStatement: z.string().optional(),
    role: z.string().optional(),
    prerequisites: z.array(z.object({
        id: z.string(),
        text: z.string(),
        checked: z.boolean(),
    })),
    executionSteps: z.array(z.object({
        id: z.string(),
        text: z.string(),
        checked: z.boolean(),
    })),
    attachments: z.object({
        files: z.array(z.object({
            id: z.string(),
            description: z.string(),
            value: z.any()
        })),
        links: z.array(z.object({
            id: z.string(),
            description: z.string(),
            value: z.string()
        })),
        notes: z.array(z.object({
            id: z.string(),
            value: z.string()
        })),
    }),
    saved_results: z.any().optional(),
});

export type RemixedTechnique = z.infer<typeof TechniqueRemixSchema>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key are required.');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export async function deleteUserAccount(): Promise<{ error: any | null }> {
    const { error } = await supabase.rpc('delete_user_data');
    return { error };
}

export async function getUserProfile(): Promise<{ user: User | null; error: any | null }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

export async function updateUserProfile(updates: { full_name?: string; role?: string; company?: string; }): Promise<{ data: any | null; error: any | null }> {
    const { data, error } = await supabase.auth.updateUser({ data: updates });
    return { data, error };
}

export async function insertRequirement(
  requirement: Partial<Requirement>
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

  const requirementToInsert = {
    ...requirement,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('requirements')
    .insert([requirementToInsert])
    .select()
    .single();

  return { data, error };
}

export async function updateRequirement(
  id: string,
  updates: Partial<Requirement>
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

  const { data, error } = await supabase
      .from('requirements')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

  return { data, error };
}

export async function fetchRequirementsForUser(): Promise<{ data: Requirement[] | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function fetchRequirementById(
  id: string
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (data?.date) data.date = new Date(data.date);

  return { data, error };
}

export async function saveOrUpdateResult(
  requirementId: string,
  resultData: Partial<Requirement>
): Promise<{ data: Requirement | null; error: any | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'User not authenticated', code: '401' } };

    const dataToSave = {
      ...resultData,
      user_id: user.id,
      requirement_id: requirementId,
    };

    const { data: existingResult, error: selectError } = await supabase
      .from('saved_results')
      .select('id')
      .eq('requirement_id', requirementId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingResult) {
      const { data, error } = await supabase
        .from('saved_results')
        .update(dataToSave)
        .eq('id', existingResult.id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } else {
      const { data, error } = await supabase
        .from('saved_results')
        .insert(dataToSave)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    }
  } catch (error: any) {
    console.error("Error in saveOrUpdateResult:", error);
    return { data: null, error };
  }
}

export async function updateSavedResult(
  id: string,
  updates: Partial<Requirement>
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

  const { data, error } = await supabase
    .from('saved_results')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  return { data, error };
}

export async function fetchSavedResults(): Promise<{ data: Requirement[] | null; error: PostgrestError | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

    const { data, error } = await supabase
        .from('saved_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return { data, error };
}

export async function fetchSavedResultById(
  id: string
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

  const { data, error } = await supabase
    .from('saved_results')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  return { data, error };
}

export async function deleteSavedResult(id: string): Promise<{ error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

  const { error: techniquesError } = await supabase
    .from('remixed_techniques')
    .delete()
    .eq('project_id', id)
    .eq('user_id', user.id);

  if (techniquesError) {
    console.error('Error deleting associated techniques:', techniquesError);
    return { error: techniquesError };
  }

  const { error: projectError } = await supabase
    .from('saved_results')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return { error: projectError };
}

export async function saveOrUpdateRemixedTechnique(
  techniqueData: Partial<RemixedTechnique> & { id?: string }
): Promise<{ data: RemixedTechnique | null; error: any | null }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Auth error:", userError);
      return { data: null, error: userError };
    }
    if (!user) {
      return {
        data: null,
        error: { message: "User not authenticated", code: "401" },
      };
    }

    let currentProjectId = techniqueData.project_id;

    // 🔹 Create placeholder project if none provided
    if (!currentProjectId) {
      const placeholderProject = {
        user_id: user.id,
        requirement_id: generateUUID().toString(), // always string
        project_name: `Standalone - ${techniqueData.technique_name || "Technique"}`,
        role: techniqueData.role || "N/A",
        problem_statement: techniqueData.problemStatement || "N/A",
        date: new Date().toISOString(),
      };

      const { data: newProject, error: projectError } = await supabase
        .from("saved_results")
        .insert(placeholderProject)
        .select("id, project_name")
        .single();

      if (projectError) {
        console.error("Failed to create placeholder project:", projectError);
        return { data: null, error: projectError };
      }
      if (!newProject?.id) {
        console.error("No project ID returned from insert");
        return { data: null, error: new Error("Could not create placeholder project.") };
      }

      currentProjectId = newProject.id;
    }

    const dataToSave: any = {
      ...techniqueData,
      user_id: user.id,
      project_id: currentProjectId,
    };

    const existingId = dataToSave.id;
    delete dataToSave.id;

    if (existingId) {
      // 🔹 Update
      const { data, error } = await supabase
        .from("remixed_techniques")
        .update(dataToSave)
        .eq("id", existingId)
        .eq("user_id", user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Update error:", error);
        return { data: null, error };
      }
      return { data, error: null };
    } else {
      // 🔹 Insert
      const { data, error } = await supabase
        .from("remixed_techniques")
        .insert(dataToSave)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Insert error:", error);
        return { data: null, error };
      }
      return { data, error: null };
    }
  } catch (error: any) {
    console.error("Unexpected error in saveOrUpdateRemixedTechnique:", error);
    return { data: null, error };
  }
}


export async function fetchRemixedTechniqueById(id: string): Promise<{ data: RemixedTechnique | null; error: PostgrestError | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

    const { data, error } = await supabase
        .from('remixed_techniques')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    return { data, error };
}

export async function fetchAllRemixedTechniquesForUser(): Promise<{ data: RemixedTechnique[] | null; error: PostgrestError | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

    const { data, error } = await supabase
        .from('remixed_techniques')
        .select(`
            *,
            saved_results (
                project_name
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return { data, error };
}

export async function fetchRemixedTechniquesByProjectId(projectId: string): Promise<{ data: RemixedTechnique[] | null; error: PostgrestError | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };

    const { data, error } = await supabase
        .from('remixed_techniques')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

    return { data, error };
}
