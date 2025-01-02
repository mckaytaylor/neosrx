import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface Review {
  id: string
  user_id: string
  provider_notes: string | null
  approval_status: "Pending" | "Approved" | "Denied"
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
  } | null
}

const ReviewsTable = ({
  reviews,
  handleStatusUpdate,
  showActions = false,
}: {
  reviews: Review[]
  handleStatusUpdate: (id: string, status: "Approved" | "Denied", notes: string) => void
  showActions?: boolean
}) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submission Date</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviews?.map((review) => (
          <TableRow key={review.id}>
            <TableCell>
              {review.profiles?.first_name} {review.profiles?.last_name}
            </TableCell>
            <TableCell>{review.approval_status}</TableCell>
            <TableCell>
              {new Date(review.created_at).toLocaleDateString()}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handleStatusUpdate(review.id, "Approved", "Approved by provider")
                    }
                    variant="default"
                    size="sm"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() =>
                      handleStatusUpdate(review.id, "Denied", "Denied by provider")
                    }
                    variant="destructive"
                    size="sm"
                  >
                    Deny
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {reviews?.length === 0 && (
          <TableRow>
            <TableCell colSpan={showActions ? 4 : 3} className="text-center py-4">
              No reviews found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
)

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
          profiles(first_name, last_name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Review[]
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

  const pendingReviews = reviews?.filter((r) => r.approval_status === "Pending") || []
  const approvedReviews = reviews?.filter((r) => r.approval_status === "Approved") || []
  const deniedReviews = reviews?.filter((r) => r.approval_status === "Denied") || []

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending Review ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="denied">
            Denied ({deniedReviews.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <ReviewsTable
            reviews={pendingReviews}
            handleStatusUpdate={handleStatusUpdate}
            showActions={true}
          />
        </TabsContent>
        <TabsContent value="approved">
          <ReviewsTable
            reviews={approvedReviews}
            handleStatusUpdate={handleStatusUpdate}
          />
        </TabsContent>
        <TabsContent value="denied">
          <ReviewsTable
            reviews={deniedReviews}
            handleStatusUpdate={handleStatusUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProviderDashboard