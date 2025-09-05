
import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestError, User } from '@supabase/supabase-js';
import * as z from 'zod';

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
  stage_techniques: z.record(z.array(z.string())).optional(),
  requirement_id: z.string().optional(), // For saved_results table
});


// Define the type for a single requirement based on your schema
export type Requirement = z.infer<typeof RequirementSchema>;


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key are required.');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

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
): Promise<{ data: Requirement | null; error: PostgDrestError | null }> {
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

    // Prepare data for saving
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
