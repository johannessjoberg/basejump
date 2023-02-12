import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { Database } from "@/types/supabase-types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function useAudit(
  accountId: string,
  operation?: string,
  options?: UseQueryOptions<Database["public"]["Views"]["audit_log"]["Row"][]>
) {
  const supabaseClient = useSupabaseClient<Database>();
  return useQuery<Database["public"]["Views"]["audit_log"]["Row"][], Error>(
    ["audit", { accountId, operation }],
    async () => {
      console.log('operation', operation)

      let query = supabaseClient
        .from("audit_log")
        .select()
        .eq("account_id", accountId)

      if (operation) {
        query = query.eq("op", operation)
      }

      const { data, error } = await query.order('ts', { ascending: false });

      handleSupabaseErrors(data, error);
      return data;
    },
    {
      enabled: true,
      ...options,
    }
  );
}
