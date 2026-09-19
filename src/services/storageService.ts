import { getSupabaseClient } from './supabaseClient';

/**
 * Service to interact with Supabase Storage buckets for CareDrop media assets
 */
export class StorageService {
  /**
   * Retrieves avatar public or signed URL from `caredrop_avatars` bucket
   * @param path File path in bucket (e.g., '{userId}/avatar_...jpg')
   * @param token Optional Firebase ID token for authenticated access
   */
  public static async getAvatarUrl(path: string, token?: string | null): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const supabase = getSupabaseClient(token);
    const { data } = supabase.storage.from('caredrop_avatars').getPublicUrl(path);
    return data?.publicUrl || '';
  }

  /**
   * Retrieves document or proof photo URL from `caredrop_documents` bucket
   * @param path File path in bucket (e.g., '{userId}/{taskId}/...jpg')
   * @param token Optional Firebase ID token for authenticated access
   */
  public static async getDocumentUrl(path: string, token?: string | null): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const supabase = getSupabaseClient(token);
    const { data } = supabase.storage.from('caredrop_documents').getPublicUrl(path);
    return data?.publicUrl || '';
  }
}
