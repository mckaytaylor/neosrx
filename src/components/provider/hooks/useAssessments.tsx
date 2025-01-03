import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { Assessment } from "../types"

export const useAssessments = (isProvider: boolean | null, authChecked: boolean) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log('Setting up realtime subscription')
    const channel = supabase
      .channel('assessment-changes')
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
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      console.log('Cleaning up realtime subscription')
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

      if (error) {
        console.error('Error fetching assessments:', error)
        throw error
      }
      
      console.log('Fetched assessments:', data)
      return data as Assessment[]
    },
    enabled: isProvider === true && authChecked,
  })

  return { assessments, isLoading, error }
}