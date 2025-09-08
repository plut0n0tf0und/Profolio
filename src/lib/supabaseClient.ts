
import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestError, User } from '@supabase/supabase-js';
import * as z from 'zod';
import { generateUUID } from './utils';

// Zod schema for validation, matches the form schema
const RequirementSchema = z.object({
  id: z.string().optional(),
  created_at: z.string().optional(),
  user_id: z.string().optional(),
  project_name: z.string().min(1, 'Project name is required.').optional(),
  date: z.union([z.date(), z.string()]).optional(),
  problem_statement: z.string().optional(),
  role: z.string().optional(),
  output_type: z.array(z.string()).optional(),
  outcome: z.array(z.string()).optional(),
  device_type: z.array(z.string()).optional(),
  project_type: z.enum(['new', 'old']).optional(),
  requirement_id: z.string().optional(), // For saved_results table
});


// Define the type for a single requirement based on your schema
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
            value: z.any() // Storing file data might be complex, often URLs are stored after upload.
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
    // This is for joining data, not a real column in remixed_techniques
    saved_results: z.any().optional(),
});

export type RemixedTechnique = z.infer<typeof TechniqueRemixSchema>;

/*
 SQL to create the remixed_techniques table in Supabase:

 CREATE TABLE public.remixed_techniques (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NULL,
  technique_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  date text NULL,
  duration text NULL,
  teamSize text NULL,
  why text NULL,
  overview text NULL,
  problemStatement text NULL,
  "role" text NULL,
  prerequisites jsonb NULL,
  executionSteps jsonb NULL,
  attachments jsonb NULL,
  CONSTRAINT remixed_techniques_pkey PRIMARY KEY (id),
  -- The foreign key "remixed_techniques_project_id_fkey" links the
  -- "project_id" column of this table to the "id" column of the "public.saved_results" table.
  CONSTRAINT remixed_techniques_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.saved_results(id) ON DELETE SET NULL,
  CONSTRAINT remixed_techniques_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

---
REQUIRED RLS POLICIES FOR `remixed_techniques` TABLE (run this in Supabase SQL Editor):
---

ALTER TABLE public.remixed_techniques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own remixed techniques"
ON public.remixed_techniques
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

---
REQUIRED RLS POLICIES FOR `saved_results` TABLE (run this in Supabase SQL Editor):
---

-- 1. Enable RLS on the table
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to SELECT (view) their own projects
CREATE POLICY "Allow users to view their own projects"
ON public.saved_results
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Allow users to INSERT (create) their own projects
CREATE POLICY "Allow users to insert their own projects"
ON public.saved_results
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to UPDATE their own projects
CREATE POLICY "Allow users to update their own projects"
ON public.saved_results
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Allow users to DELETE their own projects
CREATE POLICY "Allow users to delete their own projects"
ON public.saved_results
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

*/


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key are required.');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Deletes the currently authenticated user's account and all associated data.
 * This calls a Supabase database function `delete_user_data`.
 * @returns A promise that resolves with an error if one occurred.
 */
export async function deleteUserAccount(): Promise<{ error: any | null }> {
    const { error } = await supabase.rpc('delete_user_data');
    return { error };
}

/**
 * Fetches the currently authenticated user's profile data.
 * @returns A promise that resolves with the user object or an error.
 */
export async function getUserProfile(): Promise<{ user: User | null; error: any | null }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

/**
 * Updates the user's metadata.
 * @param updates - An object containing the metadata fields to update.
 * @returns A promise that resolves with the updated user data or an error.
 */
export async function updateUserProfile(updates: { full_name?: string; role?: string; company?: string; }): Promise<{ data: any | null; error: any | null }> {
    const { data, error } = await supabase.auth.updateUser({
        data: updates,
    });
    return { data, error };
}


/**
 * Inserts a new requirement into the Supabase 'requirements' table.
 * @param requirement - The requirement object to insert.
 * @returns A promise that resolves with the inserted data or an error.
 */
export async function insertRequirement(
  requirement: Partial<Requirement>
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: {
      message: 'User not authenticated', details: '', hint: '', code: '401',
      name: ''
    } };
  }

  const requirementToInsert = {
    ...requirement,
    user_id: user.id,
    output_type: requirement.output_type || [],
    outcome: requirement.outcome || [],
    device_type: requirement.device_type || [],
  };
  
  const { data, error } = await supabase
    .from('requirements')
    .insert([requirementToInsert])
    .select()
    .single();

  return { data, error };
}

/**
 * Updates an existing requirement in the Supabase 'requirements' table.
 * @param id - The UUID of the requirement to update.
 * @param updates - An object containing the fields to update.
 * @returns A promise that resolves with the updated data or an error.
 */
export async function updateRequirement(
  id: string,
  updates: Partial<Requirement>
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      return { data: null, error: {
        message: 'User not authenticated', details: '', hint: '', code: '401',
        name: ''
      } };
  }

  const { data, error } = await supabase
      .from('requirements')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own requirement
      .select()
      .single();

  return { data, error };
}


/**
 * Fetches all requirements for the currently authenticated user.
 * @returns A promise that resolves with an array of requirements or an error.
 */
export async function fetchRequirementsForUser(): Promise<{ data: Requirement[] | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: {
      message: 'User not authenticated', details: '', hint: '', code: '401',
      name: ''
    } };
  }

  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { data, error };
}


/**
 * Fetches a single requirement by its ID.
 * @param id - The UUID of the requirement.
 * @returns A promise that resolves with a single requirement object or an error.
 */
export async function fetchRequirementById(
  id: string
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: {
      message: 'User not authenticated', details: '', hint: '', code: '401',
      name: ''
    } };
  }
  
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only fetch their own requirement
    .single();

  // The 'date' field from Supabase is a string, convert it to a Date object.
  if (data?.date) {
    data.date = new Date(data.date);
  }

  return { data, error };
}

/**
 * Saves or updates a project result in the 'saved_results' table.
 * This function manually checks for an existing record and then either
 * updates it or inserts a new one.
 * @param requirementId - The UUID of the original requirement.
 * @param resultData - The complete result data to save.
 * @returns A promise that resolves with the saved data or an error.
 */
export async function saveOrUpdateResult(
  requirementId: string,
  resultData: Partial<Requirement>
): Promise<{ data: Requirement | null; error: any | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated', code: '401' } };
    }

    // Check if a result already exists for this requirement_id and user_id
    const { data: existingResult, error: selectError } = await supabase
      .from('saved_results')
      .select('id')
      .eq('requirement_id', requirementId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (selectError) {
        console.error('Error checking for existing result:', selectError);
        throw selectError;
    }
    
    const dataToSave = {
        ...resultData,
        user_id: user.id,
        requirement_id: requirementId,
      };

    let responseData, responseError;

    if (existingResult) {
      // Record exists, so update it
      const { data, error } = await supabase
        .from('saved_results')
        .update(dataToSave)
        .eq('id', existingResult.id)
        .select()
        .single();
      responseData = data;
      responseError = error;
    } else {
      // Record does not exist, so insert it
      const { data, error } = await supabase
        .from('saved_results')
        .insert(dataToSave)
        .select()
        .single();
      responseData = data;
      responseError = error;
    }

    if (responseError) {
      throw responseError;
    }

    return { data: responseData, error: null };

  } catch (error: any) {
    console.error("Error in saveOrUpdateResult:", error);
    return { data: null, error };
  }
}

/**
 * Updates an existing saved result in the 'saved_results' table.
 * @param id - The UUID of the saved result to update.
 * @param updates - An object containing the fields to update.
 * @returns A promise that resolves with the updated data or an error.
 */
export async function updateSavedResult(
  id: string,
  updates: Partial<Requirement>
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };
  }

  const { data, error } = await supabase
    .from('saved_results')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  return { data, error };
}


/**
 * Fetches all saved results for the currently authenticated user.
 * @returns A promise that resolves with an array of saved results or an error.
 */
export async function fetchSavedResults(): Promise<{ data: Requirement[] | null; error: PostgrestError | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: {
          message: 'User not authenticated', details: '', hint: '', code: '401',
          name: ''
        } };
    }

    const { data, error } = await supabase
        .from('saved_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return { data, error };
}


/**
 * Fetches a single saved result by its ID from the 'saved_results' table.
 * @param id - The UUID of the saved result.
 * @returns A promise that resolves with a single result object or an error.
 */
export async function fetchSavedResultById(
  id: string
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: {
      message: 'User not authenticated', details: '', hint: '', code: '401',
      name: ''
    } };
  }

  const { data, error } = await supabase
    .from('saved_results')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  return { data, error };
}

/**
 * Deletes a saved result and its associated remixed techniques.
 * @param id - The UUID of the saved result (project) to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export async function deleteSavedResult(id: string): Promise<{ error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };
  }

  // 1. Delete all remixed techniques associated with this project
  const { error: techniquesError } = await supabase
    .from('remixed_techniques')
    .delete()
    .eq('project_id', id)
    .eq('user_id', user.id);

  if (techniquesError) {
    console.error('Error deleting associated techniques:', techniquesError);
    return { error: techniquesError };
  }

  // 2. Delete the main project from saved_results
  const { error: projectError } = await supabase
    .from('saved_results')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return { error: projectError };
}

/**
 * Saves or updates a remixed technique. If no project_id is provided,
 * it creates a placeholder project in 'saved_results' first.
 * @param techniqueData - The data for the remixed technique.
 * @returns The saved or updated technique data.
 */
export async function saveOrUpdateRemixedTechnique(
  techniqueData: Partial<RemixedTechnique> & { id?: string }
): Promise<{ data: RemixedTechnique | null; error: any | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated', code: '401' } };
    }

    let currentProjectId = techniqueData.project_id;

    // If no project_id is provided, create a placeholder project first.
    if (!currentProjectId) {
      const placeholderProject = {
        user_id: user.id,
        requirement_id: generateUUID(), // Satisfy NOT NULL constraint
        project_name: `Standalone - ${techniqueData.technique_name || 'Technique'}`,
        role: techniqueData.role || 'N/A',
        problem_statement: techniqueData.problemStatement || 'N/A',
        date: new Date().toISOString(),
      };

      const { data: newProject, error: projectError } = await supabase
        .from('saved_results')
        .insert(placeholderProject)
        .select('id, project_name')
        .single();

      if (projectError || !newProject?.id) {
        console.error('Failed to create placeholder project:', projectError);
        return { data: null, error: projectError || new Error('Could not create placeholder project.') };
      }

      currentProjectId = newProject.id;
    }

    const dataToSave = { ...techniqueData, user_id: user.id, project_id: currentProjectId };
    const existingId = dataToSave.id;
    delete dataToSave.id;

    if (existingId) {
      // Update existing technique
      const { data, error } = await supabase
        .from('remixed_techniques')
        .update(dataToSave)
        .eq('id', existingId)
        .eq('user_id', user.id)
        .select()
        .single();
      return { data, error };
    } else {
      // Insert new technique
      const { data, error } = await supabase
        .from('remixed_techniques')
        .insert(dataToSave)
        .select()
        .single();
      return { data, error };
    }
  } catch (error: any) {
    console.error("Error in saveOrUpdateRemixedTechnique:", error);
    return { data: null, error };
  }
}


/**
 * Fetches a single remixed technique by its ID.
 * @param id - The UUID of the remixed technique.
 * @returns A promise that resolves with the technique data or an error.
 */
export async function fetchRemixedTechniqueById(id: string): Promise<{ data: RemixedTechnique | null; error: PostgrestError | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };
    }

    const { data, error } = await supabase
        .from('remixed_techniques')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    return { data, error };
}

/**
 * Fetches all remixed techniques for the current user, joining with project names.
 * @returns A promise that resolves with an array of remixed techniques or an error.
 */
export async function fetchAllRemixedTechniquesForUser(): Promise<{ data: RemixedTechnique[] | null; error: PostgrestError | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };
    }

    // Join remixed_techniques with saved_results to get the project name
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


/**
 * Fetches all remixed techniques associated with a specific project ID.
 * @param projectId - The UUID of the project (saved_result).
 * @returns A promise that resolves with an array of remixed techniques or an error.
 */
export async function fetchRemixedTechniquesByProjectId(projectId: string): Promise<{ data: RemixedTechnique[] | null; error: PostgrestError | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401', name: '' } };
    }

    const { data, error } = await supabase
        .from('remixed_techniques')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

    return { data, error };
}

    