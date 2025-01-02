import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  user_id: string;
  provider_notes: string | null;
  approval_status: "Pending" | "Approved" | "Denied";
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const ProviderDashboard = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("provider_reviews")
        .select(`
          *,
          profiles:profiles!provider_reviews_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive",
      });
    }
  };

  const updateReviewStatus = async (reviewId: string, status: "Approved" | "Denied") => {
    try {
      const { error } = await supabase
        .from("provider_reviews")
        .update({ approval_status: status })
        .eq("id", reviewId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Review ${status.toLowerCase()} successfully`,
      });

      fetchReviews();
    } catch (error: any) {
      console.error("Error updating review:", error);
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Provider Dashboard</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 border rounded-lg bg-white shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {review.profiles?.first_name} {review.profiles?.last_name}
                </h3>
                <p className="text-sm text-gray-500">
                  Status: {review.approval_status}
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateReviewStatus(review.id, "Approved")}
                  disabled={review.approval_status !== "Pending"}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateReviewStatus(review.id, "Denied")}
                  disabled={review.approval_status !== "Pending"}
                >
                  Deny
                </Button>
              </div>
            </div>
            {review.provider_notes && (
              <p className="text-sm text-gray-600">{review.provider_notes}</p>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-gray-500">No reviews to display</p>
        )}
      </div>
    </div>
  );
};