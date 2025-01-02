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
import { useNavigate } from "react-router-dom"
import { LogOut, Loader, Inbox } from "lucide-react"

interface Review {
  id: string
  user_id: string
  provider_notes: string | null
  approval_status: "Pending" | "Approved" | "Denied"
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
  }
}

const ProviderDashboard = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["provider-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_reviews")
        .select(`
          *,
          profiles!provider_reviews_user_id_fkey (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as unknown as Review[]
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      navigate("/")
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-destructive mb-4">Error loading reviews</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["provider-reviews"] })}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

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

      {reviews && reviews.length > 0 ? (
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
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    {review.profiles.first_name} {review.profiles.last_name}
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
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center border rounded-lg bg-muted/10">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground">
            Patient reviews will appear here once they are submitted.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProviderDashboard
