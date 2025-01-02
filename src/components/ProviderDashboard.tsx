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
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Actions</TableHead>
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
                <TableCell>
                  {review.approval_status === "Pending" && (
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
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ProviderDashboard