import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

/**
 * Manages the singleton instance of the Supabase client,
 * ensuring it is initialized only once.
 */
class SupabaseClientManager {
  private static _client: SupabaseClient | null = null;

  /**
   * Initializes the Supabase client. This must be called once at server startup.
   */
  public static initialize(): void {
    if (this._client) {
      logger.warn('Supabase client is already initialized.');
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this._client = createClient(supabaseUrl, supabaseKey);
      logger.info('✅ Supabase client initialized successfully.');
    } else {
      logger.error('❌ Supabase URL or Key is missing. Database operations will fail.');
      throw new Error('Missing Supabase environment variables.');
    }
  }

  /**
   * Returns the singleton instance of the Supabase client.
   * Throws an error if the client has not been initialized.
   */
  public static getClient(): SupabaseClient {
    if (!this._client) {
      throw new Error('Supabase client is not initialized. Call SupabaseClientManager.initialize() at startup.');
    }
    return this._client;
  }
}

// In your main server.ts, you must call this on startup:
// SupabaseClientManager.initialize();

export const supabaseManager = SupabaseClientManager;