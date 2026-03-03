import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useArchiveData(search: string, typeFilter: string) {
  return useQuery({
    queryKey: ['archive', search, typeFilter],
    queryFn: async () => {
      let query = supabase.from('research_archive').select('*').order('year', { ascending: false });

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
