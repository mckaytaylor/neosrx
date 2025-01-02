import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { UserManagement } from "./provider/UserManagement"
import { ReviewsTable } from "./provider/ReviewsTable"

const ProviderDashboard = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["provider-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_reviews")
        .select(`
          *,
          profiles(first_name, last_name, application_status)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
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

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading...</div>
  }

  const unsubmittedReviews = reviews?.filter(
    (r) => !r.approval_status || r.profiles?.application_status === "unsubmitted"
  ) || []
  const pendingReviews = reviews?.filter(
    (r) => r.approval_status === "Pending"
  ) || []
  const approvedReviews = reviews?.filter(
    (r) => r.approval_status === "Approved"
  ) || []
  const deniedReviews = reviews?.filter(
    (r) => r.approval_status === "Denied"
  ) || []

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>
      
      <div className="mb-10">
        <UserManagement />
      </div>

      <Tabs defaultValue="unsubmitted" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="unsubmitted">Unsubmitted</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
        </TabsList>

        <TabsContent value="unsubmitted">
          <ReviewsTable
            reviews={unsubmittedReviews}
            title="Unsubmitted Applications"
          />
        </TabsContent>

        <TabsContent value="pending">
          <ReviewsTable
            reviews={pendingReviews}
            handleStatusUpdate={handleStatusUpdate}
            showActions={true}
            title="Pending Reviews"
          />
        </TabsContent>

        <TabsContent value="approved">
          <ReviewsTable
            reviews={approvedReviews}
            title="Approved Applications"
          />
        </TabsContent>

        <TabsContent value="denied">
          <ReviewsTable
            reviews={deniedReviews}
            title="Denied Applications"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProviderDashboard