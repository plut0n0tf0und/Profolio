
import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestError } from '@supabase/supabase-js';
import * as z from 'zod';

// Zod schema for validation, matches the form schema
const RequirementSchema = z.object({
  project_name: z.string().min(1, 'Project name is required.'),
  date: z.date(),
  problem_statement: z.string().optional(),
  role: z.string().optional(),
  output_type: z.array(z.string()).optional(),
  outcome: z.array(z.string()).optional(),
  device_type: z.array(z.string()).optional(),
  project_type: z.enum(['new', 'old']).optional(),
});


// Define the type for a single requirement based on your schema
export type Requirement = z.infer<typeof RequirementSchema> & {
  id?: string;
  user_id?: string;
  created_at?: string;
};


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
  requirement: Omit<Requirement, 'user_id'>
): Promise<{ data: Requirement[] | null; error: PostgrestError | null }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: 'User not authenticated', details: '', hint: '', code: '401' } };
  }

  const requirementToInsert = {
    ...requirement,
    user_id: user.id,
    date: requirement.date.toISOString(),
  };

  const { data, error } = await supabase
    .from('requirements')
    .insert([requirementToInsert])
    .select();

  return { data, error };
}


/**
 * Fetches all requirements for a given user ID.
 * @param userId - The UUID of the user.
 * @returns A promise that resolves with an array of requirements or an error.
 */
export async function fetchRequirementsByUserId(
  userId: string
): Promise<{ data: Requirement[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}
