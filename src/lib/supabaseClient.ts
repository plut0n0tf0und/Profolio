
import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestError } from '@supabase/supabase-js';
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
 * Inserts a new requirement into the Supabase 'requirements' table.
 * @param requirement - The requirement object to insert.
 * @returns A promise that resolves with the inserted data or an error.
 */
export async function insertRequirement(
  requirement: Partial<Requirement>
): Promise<{ data: Requirement | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401' } };
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
      return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401' } };
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
    return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401' } };
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
    return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401' } };
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

    