import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { LogOut, Loader } from "lucide-react"
import { ReviewsTable } from "./provider/ReviewsTable"
import { EmptyState } from "./provider/EmptyState"
import { Review } from "./provider/types"
import { useEffect, useState } from "react"

const ProviderDashboard = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isProvider, setIsProvider] = useState<boolean | null>(null)

  useEffect(() => {
    const checkProviderAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate("/provider-login")
        return
      }

      const isProviderUser = user.app_metadata?.is_provider === true && user.role === 'provider'
      setIsProvider(isProviderUser)

      if (!isProviderUser) {
        toast({
          title: "Unauthorized",
          description: "You don't have access to the provider dashboard.",
          variant: "destructive",
        })
        navigate("/provider-login")
      }
    }

    checkProviderAccess()
  }, [navigate, toast])

  const fetchReviews = async () => {
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("provider_reviews")
      .select(`
        *,
        profiles!provider_reviews_user_id_profiles_fk (
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError)
      throw reviewsError
    }
    return reviewsData as Review[]
  }

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["provider-reviews"],
    queryFn: fetchReviews,
    enabled: isProvider === true, // Only fetch if user is confirmed as provider
  })

  const updateReviewStatus = useMutation({
    mutationFn: async ({
      reviewId,
      status,
      notes,
    }: {
      reviewId: string
      status: "Approved" | "Denied"
      notes: string
    }) => {
      const { error } = await supabase
        .from("provider_reviews")
        .update({ approval_status: status, provider_notes: notes })
        .eq("id", reviewId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-reviews"] })
      toast({
        title: "Review updated",
        description: "The patient's review status has been updated successfully.",
      })
    },
    onError: (error) => {
      console.error("Error updating review:", error)
      toast({
        title: "Error",
        description: "Failed to update the review. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleStatusUpdate = (
    reviewId: string,
    status: "Approved" | "Denied",
    notes: string = ""
  ) => {
    updateReviewStatus.mutate({ reviewId, status, notes })
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      navigate("/provider-login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Show loading state while checking provider status
  if (isProvider === null) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // Always show the logout button and header
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Provider Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-destructive mb-4">Error loading reviews</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["provider-reviews"] })}>
            Try Again
          </Button>
        </div>
      ) : reviews && reviews.length > 0 ? (
        <ReviewsTable reviews={reviews} onUpdateStatus={handleStatusUpdate} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default ProviderDashboard