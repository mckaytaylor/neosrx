import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { Assessment } from "../types"

export const useAssessments = (isProvider: boolean | null, authChecked: boolean) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase
      .channel('assessment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessments'
        },
        (payload) => {
          console.log('Realtime update received:', payload)
          queryClient.invalidateQueries({ queryKey: ["provider-assessments"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const { data: assessments, isLoading, error } = useQuery({
    queryKey: ["provider-assessments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No authenticated user")

      const { data, error } = await supabase
        .from("assessments")
        .select("*, profiles(first_name, last_name, email)")
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Assessment[]
    },
    enabled: isProvider === true && authChecked,
  })

  return { assessments, isLoading, error }
}