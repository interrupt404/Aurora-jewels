// src/utils/db-helpers.ts
import { PostgrestError } from '@supabase/supabase-js';
import { logger } from './logger';

// A generic type representing any await-able Supabase query builder
type SupabaseQuery = PromiseLike<{ data: any; error: PostgrestError | null; count?: number | null }>;

/**
 * A generic function to execute any Supabase query builder.
 * @param query - The Supabase query builder object to execute.
 * @returns A tuple: [data, error]. On success, error is null. On failure, data is null.
 */
export async function executeQuery<T>(
  query: SupabaseQuery
): Promise<[T | null, PostgrestError | null]> { // Fixed typo here
  try {
    const { data, error } = await query;

    if (error) {
      logger.error('Supabase query failed', error as any);
      return [null, error];
    }

    return [data as T, null];
  } catch (err: any) {
    logger.error('An unexpected error occurred during query execution', err);
    const syntheticError: PostgrestError = {
      name: 'ExecutionError', // Added missing 'name' property
      message: err.message || 'Unexpected database error',
      details: err.stack || '',
      hint: 'This error occurred within the generic executeQuery function.',
      code: 'EXEC500',
    };
    return [null, syntheticError];
  }
}

/**
 * Same as executeQuery, but specifically for queries that include a count.
 * @param query - The Supabase query builder object with { count: 'exact' }.
 * @returns A tuple: [data, count, error].
 */
export async function executeQueryWithCount<T>(
  query: SupabaseQuery
): Promise<[T | null, number, PostgrestError | null]> {
  try {
    const { data, count, error } = await query;

    if (error) {
      logger.error('Supabase query with count failed', error as any);
      return [null, 0, error];
    }

    return [data as T, count || 0, null];
  } catch (err: any) {
    logger.error('An unexpected error occurred during query execution with count', err);
    const syntheticError: PostgrestError = {
      name: 'ExecutionCountError', // Added missing 'name' property
      message: err.message || 'Unexpected database error',
      details: err.stack || '',
      hint: 'This error occurred within the generic executeQueryWithCount function.',
      code: 'EXECCNT500',
    };
    return [null, 0, syntheticError];
  }
}